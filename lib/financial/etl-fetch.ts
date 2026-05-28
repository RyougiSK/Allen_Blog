import YahooFinance from "yahoo-finance2";
import { createFinancialServiceClient } from "@/utils/supabase/financial";
import type { MarketIndex } from "@/lib/types/financial";

const yahooFinance = new YahooFinance();

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

const CPI_SERIES: Record<string, string> = {
  us: "CPIAUCSL",
  au: "AUSCPIALLQINMEI",
  cn: "CHNCPIALLMINMEI",
};

const CPI_EARLIEST: Record<string, string> = {
  us: "1947-01-01",
  au: "1974-01-01",
  cn: "1978-01-01",
};

/**
 * Fetch daily prices from Yahoo Finance and upsert into market_prices.
 * Uses delta loading: only fetches data since the last stored date.
 * If forceFresh is true, deletes existing data and fetches from scratch.
 */
export async function fetchPrices(
  index: MarketIndex,
  forceFresh = false
): Promise<number> {
  const supabase = createFinancialServiceClient();

  if (forceFresh) {
    await supabase
      .from("market_prices")
      .delete()
      .eq("index_id", index.id);
  }

  // Find the last stored date for this index
  const { data: lastRow } = await supabase
    .from("market_prices")
    .select("date")
    .eq("index_id", index.id)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  const startDate = lastRow
    ? new Date(new Date(lastRow.date).getTime() + 86400000)
    : new Date(index.data_start_date ?? "2000-01-01");

  const endDate = new Date();
  if (startDate >= endDate) return 0;

  // Use string dates for reliable cross-symbol behavior
  const period1 = startDate.toISOString().split("T")[0];
  const period2 = endDate.toISOString().split("T")[0];

  const result = await yahooFinance.chart(index.yahoo_symbol, {
    period1,
    period2,
    interval: "1d",
  });

  if (!result.quotes || result.quotes.length === 0) return 0;

  const rows = result.quotes
    .filter((q) => q.close != null && q.date != null)
    .map((q) => ({
      index_id: index.id,
      date: q.date!.toISOString().split("T")[0],
      close_price: q.close!,
      adjusted_close: q.adjclose ?? q.close!,
      volume: q.volume ?? null,
    }));

  // Log data range for debugging
  if (rows.length > 0) {
    console.log(
      `[ETL] ${index.symbol}: fetched ${rows.length} rows from ${rows[0].date} to ${rows[rows.length - 1].date}`
    );
  }

  // Upsert in batches of 500
  const batchSize = 500;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from("market_prices")
      .upsert(batch, { onConflict: "index_id,date" });

    if (error) throw new Error(`Failed to upsert prices for ${index.symbol}: ${error.message}`);
  }

  return rows.length;
}

/**
 * Fetch CPI data from FRED API and upsert into cpi_data.
 */
export async function fetchCPI(country: string): Promise<number> {
  const seriesId = CPI_SERIES[country];
  if (!seriesId) throw new Error(`No CPI series configured for country: ${country}`);

  const supabase = createFinancialServiceClient();

  // Find last stored CPI date
  const { data: lastRow } = await supabase
    .from("cpi_data")
    .select("date")
    .eq("country", country)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  const startDate = lastRow ? lastRow.date : (CPI_EARLIEST[country] ?? "1947-01-01");

  const apiKey = process.env.FRED_API_KEY || "DEMO_KEY";
  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&observation_start=${startDate}&sort_order=asc`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`FRED API error: ${response.status}`);

  const data = await response.json();
  const observations = data.observations as Array<{
    date: string;
    value: string;
  }>;

  if (!observations || observations.length === 0) return 0;

  const rows = observations
    .filter((o) => o.value !== ".")
    .map((o) => ({
      date: o.date,
      country,
      cpi_value: parseFloat(o.value),
    }));

  // Upsert in batches
  const batchSize = 200;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from("cpi_data")
      .upsert(batch, { onConflict: "date,country" });

    if (error) throw new Error(`Failed to upsert CPI for ${country}: ${error.message}`);
  }

  return rows.length;
}

/**
 * Fetch WTI Oil prices from FRED (DCOILWTICO) and store into market_prices.
 * Replaces Yahoo Finance for Oil since FRED has data from 1986.
 */
export async function fetchOilFromFRED(forceFresh = false): Promise<number> {
  const supabase = createFinancialServiceClient();
  const apiKey = process.env.FRED_API_KEY || "DEMO_KEY";

  // Get the OIL index record
  const { data: oilIndex } = await supabase
    .from("market_indexes")
    .select("id, data_start_date")
    .eq("symbol", "OIL")
    .single();

  if (!oilIndex) return 0;

  if (forceFresh) {
    await supabase.from("market_prices").delete().eq("index_id", oilIndex.id);
  }

  // Find last stored date
  const { data: lastRow } = await supabase
    .from("market_prices")
    .select("date")
    .eq("index_id", oilIndex.id)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  const startDate = lastRow ? lastRow.date : (oilIndex.data_start_date ?? "1986-01-01");

  const url = `${FRED_BASE}?series_id=DCOILWTICO&api_key=${apiKey}&file_type=json&observation_start=${startDate}&sort_order=asc`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`FRED API error for DCOILWTICO: ${response.status}`);

  const data = await response.json();
  const observations = data.observations as Array<{ date: string; value: string }>;
  if (!observations || observations.length === 0) return 0;

  const rows = observations
    .filter((o) => o.value !== ".")
    .map((o) => ({
      index_id: oilIndex.id,
      date: o.date,
      close_price: parseFloat(o.value),
      adjusted_close: parseFloat(o.value),
      volume: null,
    }));

  if (rows.length > 0) {
    console.log(`[ETL] OIL (FRED): fetched ${rows.length} rows from ${rows[0].date} to ${rows[rows.length - 1].date}`);
  }

  const batchSize = 500;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from("market_prices")
      .upsert(batch, { onConflict: "index_id,date" });

    if (error) throw new Error(`Failed to upsert Oil FRED prices: ${error.message}`);
  }

  return rows.length;
}

const TREASURY_SERIES: Record<string, string> = {
  "3m": "DGS3MO",
  "1y": "DGS1",
  "2y": "DGS2",
  "5y": "DGS5",
  "10y": "DGS10",
  "30y": "DGS30",
  "10y2y": "T10Y2Y",
  "10y3m": "T10Y3M",
};

/**
 * Fetch all treasury rate series from FRED and upsert into treasury_rates.
 */
export async function fetchTreasuryRates(): Promise<number> {
  const supabase = createFinancialServiceClient();
  const apiKey = process.env.FRED_API_KEY || "DEMO_KEY";
  let totalRows = 0;

  for (const [maturity, seriesId] of Object.entries(TREASURY_SERIES)) {
    const { data: lastRow } = await supabase
      .from("treasury_rates")
      .select("date")
      .eq("maturity", maturity)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    const startDate = lastRow ? lastRow.date : "1962-01-01";
    const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&observation_start=${startDate}&sort_order=asc`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`FRED API error for ${seriesId}: ${response.status}`);
      continue;
    }

    const data = await response.json();
    const observations = data.observations as Array<{
      date: string;
      value: string;
    }>;

    if (!observations || observations.length === 0) continue;

    const rows = observations
      .filter((o) => o.value !== ".")
      .map((o) => ({
        date: o.date,
        maturity,
        rate: parseFloat(o.value),
      }));

    const batchSize = 500;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase
        .from("treasury_rates")
        .upsert(batch, { onConflict: "date,maturity" });

      if (error) {
        console.error(`Failed to upsert treasury ${maturity}: ${error.message}`);
        break;
      }
    }

    totalRows += rows.length;
  }

  return totalRows;
}

const LIQUIDITY_RATE_SERIES: Record<string, string> = {
  sofr: "SOFR",
  effr: "EFFR",
  iorb: "IORB",
  fed_upper: "DFEDTARU",
  fed_lower: "DFEDTARL",
  obfr: "OBFR",
  dpcredit: "DPCREDIT",
};

const LIQUIDITY_RESERVE_SERIES: Record<string, string> = {
  rrp: "RRPONTSYD",
  reserves: "WRESBAL",
  tga: "WTREGEN",
  fed_assets: "WALCL",
  repo_treasury: "RPONTSYD",
  repo_agency: "RPONAGYD",
};

// Series reported in millions by FRED — convert to billions
const MILLIONS_TO_BILLIONS = new Set(["WRESBAL", "WTREGEN", "WALCL", "RRPONTSYD", "RPONTSYD", "RPONAGYD"]);

/**
 * Fetch liquidity monitoring data from FRED (rates + reserves).
 */
export async function fetchLiquidityData(): Promise<number> {
  const supabase = createFinancialServiceClient();
  const apiKey = process.env.FRED_API_KEY || "DEMO_KEY";
  let totalRows = 0;

  // Fetch rate series
  for (const [series, seriesId] of Object.entries(LIQUIDITY_RATE_SERIES)) {
    const { data: lastRow } = await supabase
      .from("liquidity_rates")
      .select("date")
      .eq("series", series)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    const startDate = lastRow ? lastRow.date : "2000-01-01";
    const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&observation_start=${startDate}&sort_order=asc`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`FRED API error for ${seriesId}: ${response.status}`);
      continue;
    }

    const data = await response.json();
    const observations = data.observations as Array<{ date: string; value: string }>;
    if (!observations || observations.length === 0) continue;

    const rows = observations
      .filter((o) => o.value !== ".")
      .map((o) => ({ date: o.date, series, value: parseFloat(o.value) }));

    const batchSize = 500;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase
        .from("liquidity_rates")
        .upsert(batch, { onConflict: "date,series" });
      if (error) {
        console.error(`Failed to upsert liquidity rate ${series}: ${error.message}`);
        break;
      }
    }
    totalRows += rows.length;
  }

  // Fetch reserve series
  for (const [series, seriesId] of Object.entries(LIQUIDITY_RESERVE_SERIES)) {
    const { data: lastRow } = await supabase
      .from("liquidity_reserves")
      .select("date")
      .eq("series", series)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    const startDate = lastRow ? lastRow.date : "2000-01-01";
    const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&observation_start=${startDate}&sort_order=asc`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`FRED API error for ${seriesId}: ${response.status}`);
      continue;
    }

    const data = await response.json();
    const observations = data.observations as Array<{ date: string; value: string }>;
    if (!observations || observations.length === 0) continue;

    const toB = MILLIONS_TO_BILLIONS.has(seriesId);
    const rows = observations
      .filter((o) => o.value !== ".")
      .map((o) => ({
        date: o.date,
        series,
        value: toB ? parseFloat(o.value) / 1000 : parseFloat(o.value),
      }));

    const batchSize = 500;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase
        .from("liquidity_reserves")
        .upsert(batch, { onConflict: "date,series" });
      if (error) {
        console.error(`Failed to upsert liquidity reserve ${series}: ${error.message}`);
        break;
      }
    }
    totalRows += rows.length;
  }

  return totalRows;
}

/**
 * Fetch all active market indexes from the database.
 */
export async function getActiveIndexes(): Promise<MarketIndex[]> {
  const supabase = createFinancialServiceClient();
  const { data, error } = await supabase
    .from("market_indexes")
    .select("*")
    .eq("is_active", true)
    .order("market", { ascending: true });

  if (error) throw new Error(`Failed to fetch indexes: ${error.message}`);
  return data as MarketIndex[];
}
