import { createServiceClient } from "@/utils/supabase/service";
import type {
  MarketIndex,
  AdjustmentType,
  TrendPoint,
  DeviationPoint,
} from "@/lib/types/financial";
import {
  exponentialRegression,
  calculateDeviation,
  deviationToSigma,
  classifyValuation,
  sigmaBands,
} from "./regression";

interface PriceRow {
  date: string;
  close_price: number;
}

interface CPIRow {
  date: string;
  cpi_value: number;
}

/**
 * Load all price rows for a given index (paginated to bypass Supabase 1000-row default limit).
 */
async function loadPrices(indexId: string): Promise<PriceRow[]> {
  const supabase = createServiceClient();
  const allRows: PriceRow[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("market_prices")
      .select("date, close_price")
      .eq("index_id", indexId)
      .order("date", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Failed to load prices: ${error.message}`);
    if (!data || data.length === 0) break;

    allRows.push(...(data as PriceRow[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

/**
 * Load CPI data for a country.
 */
async function loadCPI(country: string): Promise<CPIRow[]> {
  const supabase = createServiceClient();
  const allRows: CPIRow[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("cpi_data")
      .select("date, cpi_value")
      .eq("country", country)
      .order("date", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Failed to load CPI: ${error.message}`);
    if (!data || data.length === 0) break;

    allRows.push(...(data as CPIRow[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

/**
 * Load deflator prices (gold or oil).
 */
async function loadDeflatorPrices(deflatorSymbol: string): Promise<PriceRow[]> {
  const supabase = createServiceClient();

  const { data: idx } = await supabase
    .from("market_indexes")
    .select("id")
    .eq("symbol", deflatorSymbol)
    .single();

  if (!idx) throw new Error(`Deflator ${deflatorSymbol} not found`);

  return loadPrices(idx.id);
}

/**
 * Map a country to its market region for CPI lookup.
 */
function marketToCountry(market: string): string {
  if (market === "au") return "au";
  if (market === "cn") return "cn";
  return "us";
}

/**
 * Adjust prices by CPI (inflation-adjust to latest CPI value).
 */
function adjustByCPI(
  prices: PriceRow[],
  cpiData: CPIRow[]
): PriceRow[] {
  if (cpiData.length === 0) return prices;

  const latestCPI = cpiData[cpiData.length - 1].cpi_value;

  // Build a map of month -> CPI value
  const cpiMap = new Map<string, number>();
  for (const c of cpiData) {
    const monthKey = c.date.slice(0, 7); // YYYY-MM
    cpiMap.set(monthKey, c.cpi_value);
  }

  // For each price, find the matching or closest prior CPI
  let lastKnownCPI = cpiData[0].cpi_value;
  return prices.map((p) => {
    const monthKey = p.date.slice(0, 7);
    const cpi = cpiMap.get(monthKey) ?? lastKnownCPI;
    if (cpiMap.has(monthKey)) lastKnownCPI = cpi;

    return {
      date: p.date,
      close_price: (p.close_price * latestCPI) / cpi,
    };
  });
}

/**
 * Adjust prices by dividing by a commodity (gold or oil).
 */
function adjustByCommodity(
  prices: PriceRow[],
  commodityPrices: PriceRow[]
): PriceRow[] {
  // Build date map for commodity prices
  const commodityMap = new Map<string, number>();
  for (const c of commodityPrices) {
    commodityMap.set(c.date, c.close_price);
  }

  // Forward-fill: for dates without commodity price, use last known
  let lastCommodityPrice = commodityPrices[0]?.close_price ?? 1;
  return prices
    .map((p) => {
      const commodityPrice = commodityMap.get(p.date) ?? lastCommodityPrice;
      if (commodityMap.has(p.date)) lastCommodityPrice = commodityPrice;

      if (commodityPrice <= 0) return null;
      return {
        date: p.date,
        close_price: p.close_price / commodityPrice,
      };
    })
    .filter((p): p is PriceRow => p !== null);
}

/**
 * Downsample daily series to weekly (keep every 5th trading day).
 */
function downsampleWeekly<T>(series: T[]): T[] {
  return series.filter((_, i) => i % 5 === 0);
}

/**
 * Compute mean reversion analysis for a single index + adjustment type.
 */
export async function computeMeanReversion(
  index: MarketIndex,
  adjustmentType: AdjustmentType
): Promise<void> {
  const supabase = createServiceClient();

  // Load raw prices
  let prices = await loadPrices(index.id);
  if (prices.length < 100) return; // Need sufficient data

  // Apply adjustment
  if (adjustmentType === "cpi") {
    const country = marketToCountry(index.market);
    const cpiData = await loadCPI(country);
    prices = adjustByCPI(prices, cpiData);
  } else if (adjustmentType === "gold") {
    const goldPrices = await loadDeflatorPrices("GOLD");
    prices = adjustByCommodity(prices, goldPrices);
  } else if (adjustmentType === "oil") {
    const oilPrices = await loadDeflatorPrices("OIL");
    prices = adjustByCommodity(prices, oilPrices);
  }

  if (prices.length < 100) return;

  // Convert dates to numeric x values (days since first date)
  const startDate = new Date(prices[0].date).getTime();
  const x = prices.map(
    (p) => (new Date(p.date).getTime() - startDate) / 86400000
  );
  const y = prices.map((p) => p.close_price);

  // Filter out non-positive values (log regression needs positive y)
  const validIndices = y
    .map((val, i) => (val > 0 ? i : -1))
    .filter((i) => i >= 0);
  const xValid = validIndices.map((i) => x[i]);
  const yValid = validIndices.map((i) => y[i]);

  if (xValid.length < 100) return;

  // Fit exponential regression
  const reg = exponentialRegression(xValid, yValid);

  // Calculate current deviation
  const lastX = xValid[xValid.length - 1];
  const lastY = yValid[yValid.length - 1];
  const { deviationPct, trendValue } = calculateDeviation(
    lastY,
    reg.a,
    reg.b,
    lastX
  );
  const sigma = deviationToSigma(deviationPct, reg.residualStdDev);
  const zone = classifyValuation(sigma);

  // Build chart series (weekly sampled)
  const fullTrendSeries: TrendPoint[] = validIndices.map((i) => {
    const bands = sigmaBands(reg.a, reg.b, reg.residualStdDev, x[i]);
    return {
      date: prices[i].date,
      actual: prices[i].close_price,
      trend: bands.trend,
      upper1: bands.upper1,
      lower1: bands.lower1,
      upper2: bands.upper2,
      lower2: bands.lower2,
    };
  });

  const fullDeviationSeries: DeviationPoint[] = validIndices.map((i) => {
    const { deviationPct: devPct } = calculateDeviation(
      prices[i].close_price,
      reg.a,
      reg.b,
      x[i]
    );
    const devSigma = deviationToSigma(devPct, reg.residualStdDev);
    return {
      date: prices[i].date,
      deviation_pct: Math.round(devPct * 100) / 100,
      deviation_sigma: Math.round(devSigma * 1000) / 1000,
    };
  });

  const priceSeries = downsampleWeekly(fullTrendSeries);
  const deviationSeries = downsampleWeekly(fullDeviationSeries);

  // Upsert analysis result
  const { error } = await supabase.from("mean_reversion_analysis").upsert(
    {
      index_id: index.id,
      adjustment_type: adjustmentType,
      computed_at: new Date().toISOString(),
      reg_a: reg.a,
      reg_b: reg.b,
      r_squared: reg.rSquared,
      std_deviation: reg.residualStdDev,
      data_points: xValid.length,
      data_start: prices[0].date,
      current_price: lastY,
      trend_value: trendValue,
      deviation_pct: Math.round(deviationPct * 100) / 100,
      deviation_sigma: Math.round(sigma * 1000) / 1000,
      valuation_zone: zone,
      price_series: priceSeries,
      deviation_series: deviationSeries,
    },
    { onConflict: "index_id,adjustment_type" }
  );

  if (error)
    throw new Error(
      `Failed to store analysis for ${index.symbol}/${adjustmentType}: ${error.message}`
    );
}

/**
 * Run full analysis computation for all active indexes across all adjustment types.
 */
export async function computeAllAnalyses(
  indexes: MarketIndex[]
): Promise<number> {
  const adjustmentTypes: AdjustmentType[] = ["nominal", "cpi", "gold", "oil"];
  let processed = 0;

  for (const index of indexes) {
    // Skip deflators being adjusted by themselves
    for (const adj of adjustmentTypes) {
      if (adj === "gold" && index.symbol === "GOLD") continue;
      if (adj === "oil" && index.symbol === "OIL") continue;

      try {
        await computeMeanReversion(index, adj);
        processed++;
      } catch (e) {
        console.error(
          `Error computing ${index.symbol}/${adj}:`,
          e instanceof Error ? e.message : e
        );
      }
    }
  }

  return processed;
}
