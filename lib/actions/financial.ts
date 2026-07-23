"use server";

import { createFinancialClient } from "@/utils/supabase/financial";
import type {
  MarketIndex,
  MeanReversionAnalysis,
  MeanReversionOverview,
  ModelStats,
  ETLJobLog,
  AdjustmentType,
  TreasuryRate,
  DataInventoryRow,
  AssetClass,
  AssetClassSnapshot,
  AssetClassTimeSeriesPoint,
} from "@/lib/types/financial";
import { annualizedGrowth } from "@/lib/financial/regression";

export async function getFinancialOverview(): Promise<MeanReversionOverview[]> {
  const supabase = await createFinancialClient();

  const { data, error } = await supabase
    .from("mean_reversion_analysis")
    .select(`
      *,
      index:market_indexes!inner(*)
    `)
    .eq("adjustment_type", "nominal")
    .eq("index.is_deflator", false)
    .order("computed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as MeanReversionOverview[];
}

export async function getIndexAnalysis(
  symbol: string,
  adjustmentType: AdjustmentType = "nominal"
): Promise<(MeanReversionAnalysis & { index: MarketIndex }) | null> {
  const supabase = await createFinancialClient();

  const { data: idx } = await supabase
    .from("market_indexes")
    .select("id")
    .eq("symbol", symbol)
    .single();

  if (!idx) return null;

  const { data, error } = await supabase
    .from("mean_reversion_analysis")
    .select(`
      *,
      index:market_indexes(*)
    `)
    .eq("index_id", idx.id)
    .eq("adjustment_type", adjustmentType)
    .single();

  if (error) return null;
  return data as unknown as MeanReversionAnalysis & { index: MarketIndex };
}

export async function getAllIndexes(): Promise<MarketIndex[]> {
  const supabase = await createFinancialClient();
  const { data, error } = await supabase
    .from("market_indexes")
    .select("*")
    .order("market", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as MarketIndex[];
}

export async function getModelStats(): Promise<ModelStats[]> {
  const supabase = await createFinancialClient();

  const { data, error } = await supabase
    .from("mean_reversion_analysis")
    .select(`
      *,
      index:market_indexes!inner(*)
    `)
    .eq("index.is_deflator", false)
    .order("index_id", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as MeanReversionOverview[]).map((row) => ({
    index: row.index,
    adjustment_type: row.adjustment_type,
    data_start: row.data_start,
    data_points: row.data_points,
    r_squared: row.r_squared,
    std_deviation: row.std_deviation,
    reg_a: row.reg_a,
    reg_b: row.reg_b,
    annual_growth: annualizedGrowth(row.reg_b),
    current_sigma: row.deviation_sigma,
    valuation_zone: row.valuation_zone,
    computed_at: row.computed_at,
  }));
}

export async function getETLStatus(): Promise<ETLJobLog[]> {
  const supabase = await createFinancialClient();

  const { data, error } = await supabase
    .from("etl_job_log")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);
  return (data ?? []) as ETLJobLog[];
}

export async function getDataInventory(): Promise<DataInventoryRow[]> {
  const supabase = await createFinancialClient();
  const rows: DataInventoryRow[] = [];

  // Market indexes — fetch all indexes with their price stats via analysis table
  const { data: indexes } = await supabase
    .from("market_indexes")
    .select("id, symbol, name, is_deflator")
    .eq("is_active", true)
    .order("market");

  if (indexes) {
    const priceStats = await Promise.all(
      indexes.map(async (idx) => {
        const [{ count }, { data: earliest }, { data: latest }] = await Promise.all([
          supabase.from("market_prices").select("*", { count: "exact", head: true }).eq("index_id", idx.id),
          supabase.from("market_prices").select("date").eq("index_id", idx.id).order("date", { ascending: true }).limit(1).single(),
          supabase.from("market_prices").select("date").eq("index_id", idx.id).order("date", { ascending: false }).limit(1).single(),
        ]);
        return {
          source: idx.is_deflator ? "Deflator" : "Market Index",
          name: `${idx.name} (${idx.symbol})`,
          rows: count ?? 0,
          earliest: earliest?.date ?? null,
          latest: latest?.date ?? null,
        };
      })
    );
    rows.push(...priceStats);
  }

  // Treasury rates
  const maturities = ["3m", "1y", "2y", "5y", "10y", "30y", "10y2y", "10y3m"];
  const treasuryStats = await Promise.all(
    maturities.map(async (m) => {
      const [{ count }, { data: earliest }, { data: latest }] = await Promise.all([
        supabase.from("treasury_rates").select("*", { count: "exact", head: true }).eq("maturity", m),
        supabase.from("treasury_rates").select("date").eq("maturity", m).order("date", { ascending: true }).limit(1).single(),
        supabase.from("treasury_rates").select("date").eq("maturity", m).order("date", { ascending: false }).limit(1).single(),
      ]);
      return {
        source: "Treasury",
        name: m.toUpperCase(),
        rows: count ?? 0,
        earliest: earliest?.date ?? null,
        latest: latest?.date ?? null,
      };
    })
  );
  rows.push(...treasuryStats);

  // CPI data
  const cpiStats = await Promise.all(
    ["us", "au", "cn"].map(async (country) => {
      const [{ count }, { data: earliest }, { data: latest }] = await Promise.all([
        supabase.from("cpi_data").select("*", { count: "exact", head: true }).eq("country", country),
        supabase.from("cpi_data").select("date").eq("country", country).order("date", { ascending: true }).limit(1).single(),
        supabase.from("cpi_data").select("date").eq("country", country).order("date", { ascending: false }).limit(1).single(),
      ]);
      return {
        source: "CPI",
        name: country.toUpperCase(),
        rows: count ?? 0,
        earliest: earliest?.date ?? null,
        latest: latest?.date ?? null,
      };
    })
  );
  rows.push(...cpiStats);

  // Liquidity rates
  const liquidityRateSeries = ["sofr", "effr", "iorb", "fed_upper", "fed_lower", "obfr", "dpcredit"];
  const liquidityRateStats = await Promise.all(
    liquidityRateSeries.map(async (s) => {
      const [{ count }, { data: earliest }, { data: latest }] = await Promise.all([
        supabase.from("liquidity_rates").select("*", { count: "exact", head: true }).eq("series", s),
        supabase.from("liquidity_rates").select("date").eq("series", s).order("date", { ascending: true }).limit(1).single(),
        supabase.from("liquidity_rates").select("date").eq("series", s).order("date", { ascending: false }).limit(1).single(),
      ]);
      return {
        source: "Liquidity Rate",
        name: s.toUpperCase(),
        rows: count ?? 0,
        earliest: earliest?.date ?? null,
        latest: latest?.date ?? null,
      };
    })
  );
  rows.push(...liquidityRateStats);

  // Liquidity reserves
  const liquidityReserveSeries = ["rrp", "reserves", "tga", "fed_assets", "repo_treasury", "repo_agency"];
  const liquidityReserveStats = await Promise.all(
    liquidityReserveSeries.map(async (s) => {
      const [{ count }, { data: earliest }, { data: latest }] = await Promise.all([
        supabase.from("liquidity_reserves").select("*", { count: "exact", head: true }).eq("series", s),
        supabase.from("liquidity_reserves").select("date").eq("series", s).order("date", { ascending: true }).limit(1).single(),
        supabase.from("liquidity_reserves").select("date").eq("series", s).order("date", { ascending: false }).limit(1).single(),
      ]);
      return {
        source: "Liquidity Reserve",
        name: s.toUpperCase(),
        rows: count ?? 0,
        earliest: earliest?.date ?? null,
        latest: latest?.date ?? null,
      };
    })
  );
  rows.push(...liquidityReserveStats);

  // Asset class market caps
  const { data: assetClasses } = await supabase
    .from("asset_classes")
    .select("id, slug, name, source_description")
    .eq("is_active", true)
    .order("sort_order");

  if (assetClasses) {
    const acStats = await Promise.all(
      assetClasses.map(async (ac) => {
        const [{ count }, { data: earliest }, { data: latest }] = await Promise.all([
          supabase.from("asset_class_market_cap").select("*", { count: "exact", head: true }).eq("asset_class_id", ac.id),
          supabase.from("asset_class_market_cap").select("date").eq("asset_class_id", ac.id).order("date", { ascending: true }).limit(1).single(),
          supabase.from("asset_class_market_cap").select("date").eq("asset_class_id", ac.id).order("date", { ascending: false }).limit(1).single(),
        ]);
        return {
          source: "Asset Class",
          name: `${ac.name}`,
          rows: count ?? 0,
          earliest: earliest?.date ?? null,
          latest: latest?.date ?? null,
          description: ac.source_description ?? undefined,
        };
      })
    );
    rows.push(...acStats);
  }

  return rows;
}

export async function getCurrentYieldCurve(): Promise<TreasuryRate[]> {
  const supabase = await createFinancialClient();
  const maturities = ["3m", "1y", "2y", "5y", "10y", "30y"];
  const results: TreasuryRate[] = [];

  for (const m of maturities) {
    const { data } = await supabase
      .from("treasury_rates")
      .select("date, maturity, rate")
      .eq("maturity", m)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (data) results.push(data as TreasuryRate);
  }

  return results;
}

export async function getHistoricalYieldCurve(date: string): Promise<TreasuryRate[]> {
  const supabase = await createFinancialClient();
  const maturities = ["3m", "1y", "2y", "5y", "10y", "30y"];
  const results: TreasuryRate[] = [];

  for (const m of maturities) {
    const { data } = await supabase
      .from("treasury_rates")
      .select("date, maturity, rate")
      .eq("maturity", m)
      .lte("date", date)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (data) results.push(data as TreasuryRate);
  }

  return results;
}

export async function getSpreadHistory(
  spread: "10y2y" | "10y3m"
): Promise<TreasuryRate[]> {
  const supabase = await createFinancialClient();
  const allRows: TreasuryRate[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("treasury_rates")
      .select("date, maturity, rate")
      .eq("maturity", spread)
      .order("date", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;

    allRows.push(...(data as TreasuryRate[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  // Downsample to weekly
  return allRows.filter((_, i) => i % 5 === 0);
}

export async function getRateTimeSeries(): Promise<{
  dates: string[];
  short: (number | null)[];
  mid: (number | null)[];
  long: (number | null)[];
}> {
  const supabase = await createFinancialClient();

  async function loadMaturity(maturity: string): Promise<TreasuryRate[]> {
    const allRows: TreasuryRate[] = [];
    const pageSize = 1000;
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("treasury_rates")
        .select("date, maturity, rate")
        .eq("maturity", maturity)
        .order("date", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) break;

      allRows.push(...(data as TreasuryRate[]));
      if (data.length < pageSize) break;
      from += pageSize;
    }

    return allRows;
  }

  const [r2y, r10y, r30y] = await Promise.all([
    loadMaturity("2y"),
    loadMaturity("10y"),
    loadMaturity("30y"),
  ]);

  // Build unified date index from 10y (longest series)
  const dateSet = new Set<string>();
  r2y.forEach((r) => dateSet.add(r.date));
  r10y.forEach((r) => dateSet.add(r.date));
  r30y.forEach((r) => dateSet.add(r.date));

  const allDates = [...dateSet].sort();
  // Downsample to weekly
  const dates = allDates.filter((_, i) => i % 5 === 0);

  const map2y = new Map(r2y.map((r) => [r.date, r.rate]));
  const map10y = new Map(r10y.map((r) => [r.date, r.rate]));
  const map30y = new Map(r30y.map((r) => [r.date, r.rate]));

  return {
    dates,
    short: dates.map((d) => map2y.get(d) ?? null),
    mid: dates.map((d) => map10y.get(d) ?? null),
    long: dates.map((d) => map30y.get(d) ?? null),
  };
}

export interface LiquidityPoint {
  date: string;
  series: string;
  value: number;
}

export async function getLiquidityRates(): Promise<{
  dates: string[];
  sofr: (number | null)[];
  effr: (number | null)[];
  iorb: (number | null)[];
  fed_upper: (number | null)[];
  fed_lower: (number | null)[];
  obfr: (number | null)[];
}> {
  const supabase = await createFinancialClient();
  const series = ["sofr", "effr", "iorb", "fed_upper", "fed_lower", "obfr"];

  const allData = await Promise.all(
    series.map(async (s) => {
      const allRows: LiquidityPoint[] = [];
      const pageSize = 1000;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("liquidity_rates")
          .select("date, series, value")
          .eq("series", s)
          .order("date", { ascending: true })
          .range(from, from + pageSize - 1);
        if (error) throw new Error(error.message);
        if (!data || data.length === 0) break;
        allRows.push(...(data as LiquidityPoint[]));
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return { series: s, rows: allRows };
    })
  );

  const dateSet = new Set<string>();
  allData.forEach((d) => d.rows.forEach((r) => dateSet.add(r.date)));
  const allDates = [...dateSet].sort();
  const dates = allDates.filter((_, i) => i % 5 === 0);

  const maps = Object.fromEntries(
    allData.map((d) => [d.series, new Map(d.rows.map((r) => [r.date, r.value]))])
  );

  return {
    dates,
    sofr: dates.map((d) => maps.sofr?.get(d) ?? null),
    effr: dates.map((d) => maps.effr?.get(d) ?? null),
    iorb: dates.map((d) => maps.iorb?.get(d) ?? null),
    fed_upper: dates.map((d) => maps.fed_upper?.get(d) ?? null),
    fed_lower: dates.map((d) => maps.fed_lower?.get(d) ?? null),
    obfr: dates.map((d) => maps.obfr?.get(d) ?? null),
  };
}

export async function getLiquidityReserves(): Promise<{
  dates: string[];
  rrp: (number | null)[];
  reserves: (number | null)[];
  tga: (number | null)[];
  fed_assets: (number | null)[];
  repo_treasury: (number | null)[];
  repo_agency: (number | null)[];
}> {
  const supabase = await createFinancialClient();
  const series = ["rrp", "reserves", "tga", "fed_assets", "repo_treasury", "repo_agency"];

  const allData = await Promise.all(
    series.map(async (s) => {
      const allRows: LiquidityPoint[] = [];
      const pageSize = 1000;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("liquidity_reserves")
          .select("date, series, value")
          .eq("series", s)
          .order("date", { ascending: true })
          .range(from, from + pageSize - 1);
        if (error) throw new Error(error.message);
        if (!data || data.length === 0) break;
        allRows.push(...(data as LiquidityPoint[]));
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return { series: s, rows: allRows };
    })
  );

  const dateSet = new Set<string>();
  allData.forEach((d) => d.rows.forEach((r) => dateSet.add(r.date)));
  const allDates = [...dateSet].sort();
  const dates = allDates.filter((_, i) => i % 5 === 0);

  const maps = Object.fromEntries(
    allData.map((d) => [d.series, new Map(d.rows.map((r) => [r.date, r.value]))])
  );

  return {
    dates,
    rrp: dates.map((d) => maps.rrp?.get(d) ?? null),
    reserves: dates.map((d) => maps.reserves?.get(d) ?? null),
    tga: dates.map((d) => maps.tga?.get(d) ?? null),
    fed_assets: dates.map((d) => maps.fed_assets?.get(d) ?? null),
    repo_treasury: dates.map((d) => maps.repo_treasury?.get(d) ?? null),
    repo_agency: dates.map((d) => maps.repo_agency?.get(d) ?? null),
  };
}

export async function getLiquidityLatest(): Promise<Record<string, number | null>> {
  const supabase = await createFinancialClient();
  const result: Record<string, number | null> = {};

  const rateSeries = ["sofr", "effr", "iorb", "fed_upper", "fed_lower"];
  for (const s of rateSeries) {
    const { data } = await supabase
      .from("liquidity_rates")
      .select("value")
      .eq("series", s)
      .order("date", { ascending: false })
      .limit(1)
      .single();
    result[s] = data?.value ?? null;
  }

  const reserveSeries = ["rrp", "reserves", "tga", "fed_assets"];
  for (const s of reserveSeries) {
    const { data } = await supabase
      .from("liquidity_reserves")
      .select("value")
      .eq("series", s)
      .order("date", { ascending: false })
      .limit(1)
      .single();
    result[s] = data?.value ?? null;
  }

  return result;
}

export async function triggerETL(): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : ""}${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/admin/financial-etl`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const body = await response.json();
    return { success: false, error: body.error || "ETL trigger failed" };
  }

  return { success: true };
}

// --- Asset Class Market Cap ---

const GLOBAL_TOTAL_BASE_YEAR = 2024;
const GLOBAL_TOTAL_BASE_VALUE_T = 900;
const GLOBAL_TOTAL_GROWTH_RATE = 0.05;

function getGlobalTotalEstimate(date: string): number {
  const year = new Date(date).getFullYear();
  const yearFrac = (new Date(date).getMonth()) / 12;
  const yearsSince = (year - GLOBAL_TOTAL_BASE_YEAR) + yearFrac;
  return GLOBAL_TOTAL_BASE_VALUE_T * Math.pow(1 + GLOBAL_TOTAL_GROWTH_RATE, yearsSince);
}

export async function getAssetClassSnapshots(): Promise<AssetClassSnapshot[]> {
  const supabase = await createFinancialClient();

  const { data: assetClasses } = await supabase
    .from("asset_classes")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (!assetClasses || assetClasses.length === 0) return [];

  const snapshots: AssetClassSnapshot[] = [];

  for (const ac of assetClasses as AssetClass[]) {
    const { data: latest } = await supabase
      .from("asset_class_market_cap")
      .select("date, market_cap_t")
      .eq("asset_class_id", ac.id)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (!latest) continue;

    // Get value from ~1 year ago for YoY
    const oneYearAgo = new Date(latest.date);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const targetDate = oneYearAgo.toISOString().split("T")[0];

    const { data: yearAgo } = await supabase
      .from("asset_class_market_cap")
      .select("market_cap_t")
      .eq("asset_class_id", ac.id)
      .lte("date", targetDate)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    const change1y = yearAgo
      ? ((latest.market_cap_t - yearAgo.market_cap_t) / yearAgo.market_cap_t) * 100
      : null;

    snapshots.push({
      asset_class: ac,
      latest_value: latest.market_cap_t,
      latest_date: latest.date,
      change_1y_pct: change1y,
    });
  }

  return snapshots;
}

export async function getAssetClassTimeSeries(
  timeframe: "1y" | "5y" | "10y" | "all" = "all"
): Promise<AssetClassTimeSeriesPoint[]> {
  const supabase = await createFinancialClient();

  const { data: assetClasses } = await supabase
    .from("asset_classes")
    .select("id, slug")
    .eq("is_active", true)
    .order("sort_order");

  if (!assetClasses || assetClasses.length === 0) return [];

  // Determine start date based on timeframe
  let startDate = "2000-01-01";
  if (timeframe !== "all") {
    const now = new Date();
    const years = timeframe === "1y" ? 1 : timeframe === "5y" ? 5 : 10;
    now.setFullYear(now.getFullYear() - years);
    startDate = now.toISOString().split("T")[0];
  }

  // Fetch all market cap data for all classes
  const allData: Array<{ slug: string; date: string; value: number }> = [];

  for (const ac of assetClasses) {
    const pageSize = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from("asset_class_market_cap")
        .select("date, market_cap_t")
        .eq("asset_class_id", ac.id)
        .gte("date", startDate)
        .order("date", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) break;
      if (!data || data.length === 0) break;

      for (const row of data) {
        allData.push({ slug: ac.slug, date: row.date, value: row.market_cap_t });
      }

      if (data.length < pageSize) break;
      from += pageSize;
    }
  }

  // Build unified date index
  const dateSet = new Set<string>();
  allData.forEach((d) => dateSet.add(d.date));
  const allDates = [...dateSet].sort();

  // Downsample: keep every Nth point depending on total dates
  const maxPoints = 200;
  const step = Math.max(1, Math.floor(allDates.length / maxPoints));
  const dates = allDates.filter((_, i) => i % step === 0);

  // Build lookup maps per slug
  const slugs = assetClasses.map((ac) => ac.slug);
  const maps: Record<string, Map<string, number>> = {};
  for (const slug of slugs) {
    maps[slug] = new Map();
  }
  for (const row of allData) {
    maps[row.slug]?.set(row.date, row.value);
  }

  // Forward-fill: for each date, use last known value
  const lastKnown: Record<string, number | null> = {};
  slugs.forEach((s) => { lastKnown[s] = null; });

  const result: AssetClassTimeSeriesPoint[] = [];

  for (const date of dates) {
    const values: Record<string, number | null> = {};

    for (const slug of slugs) {
      const val = maps[slug].get(date);
      if (val !== undefined) {
        lastKnown[slug] = val;
      }
      values[slug] = lastKnown[slug];
    }

    // Compute "other" as residual
    const tracked = Object.values(values).reduce<number>((sum, v) => sum + (v ?? 0), 0);
    const globalTotal = getGlobalTotalEstimate(date);
    values["other"] = Math.max(0, globalTotal - tracked);

    result.push({ date, values });
  }

  return result;
}

export async function getAssetClassBreakdown(): Promise<{
  total_estimated: number;
  tracked_total: number;
  classes: Array<{
    slug: string;
    name: string;
    color: string;
    market_cap_t: number;
    pct_of_total: number;
    date: string;
  }>;
}> {
  const snapshots = await getAssetClassSnapshots();
  const today = new Date().toISOString().split("T")[0];
  const totalEstimated = getGlobalTotalEstimate(today);
  const trackedTotal = snapshots.reduce((sum, s) => sum + s.latest_value, 0);

  const classes = snapshots.map((s) => ({
    slug: s.asset_class.slug,
    name: s.asset_class.name,
    color: s.asset_class.color,
    market_cap_t: s.latest_value,
    pct_of_total: (s.latest_value / totalEstimated) * 100,
    date: s.latest_date,
  }));

  // Add "other" residual
  const otherValue = Math.max(0, totalEstimated - trackedTotal);
  classes.push({
    slug: "other",
    name: "Other",
    color: "#525252",
    market_cap_t: otherValue,
    pct_of_total: (otherValue / totalEstimated) * 100,
    date: today,
  });

  return { total_estimated: totalEstimated, tracked_total: trackedTotal, classes };
}

export interface RawAssetClassDataPoint {
  slug: string;
  date: string;
  market_cap_t: number;
  raw_value: number | null;
}

export async function getAssetClassRawTimeSeries(
  timeframe: "1y" | "5y" | "10y" | "all" = "all"
): Promise<{
  points: RawAssetClassDataPoint[];
  classes: Array<{ slug: string; estimation_method: string; multiplier: number | null }>;
}> {
  const supabase = await createFinancialClient();

  const { data: assetClasses } = await supabase
    .from("asset_classes")
    .select("id, slug, estimation_method, multiplier")
    .eq("is_active", true)
    .order("sort_order");

  if (!assetClasses || assetClasses.length === 0) return { points: [], classes: [] };

  let startDate = "2000-01-01";
  if (timeframe !== "all") {
    const now = new Date();
    const years = timeframe === "1y" ? 1 : timeframe === "5y" ? 5 : 10;
    now.setFullYear(now.getFullYear() - years);
    startDate = now.toISOString().split("T")[0];
  }

  const allPoints: RawAssetClassDataPoint[] = [];

  for (const ac of assetClasses) {
    const pageSize = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from("asset_class_market_cap")
        .select("date, market_cap_t, raw_value")
        .eq("asset_class_id", ac.id)
        .gte("date", startDate)
        .order("date", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) break;
      if (!data || data.length === 0) break;

      for (const row of data) {
        allPoints.push({
          slug: ac.slug,
          date: row.date,
          market_cap_t: row.market_cap_t,
          raw_value: row.raw_value,
        });
      }

      if (data.length < pageSize) break;
      from += pageSize;
    }
  }

  return {
    points: allPoints,
    classes: assetClasses.map((ac) => ({
      slug: ac.slug,
      estimation_method: ac.estimation_method,
      multiplier: ac.multiplier,
    })),
  };
}
