import YahooFinance from "yahoo-finance2";
import { createServiceClient } from "@/utils/supabase/service";
import type { MarketIndex } from "@/lib/types/financial";

const yahooFinance = new YahooFinance();

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

const CPI_SERIES: Record<string, string> = {
  us: "CPIAUCSL",
  au: "AUSCPIALLQINMEI",
  cn: "CHNCPIALLMINMEI",
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
  const supabase = createServiceClient();

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

  const supabase = createServiceClient();

  // Find last stored CPI date
  const { data: lastRow } = await supabase
    .from("cpi_data")
    .select("date")
    .eq("country", country)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  const startDate = lastRow ? lastRow.date : "2000-01-01";

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
 * Fetch all active market indexes from the database.
 */
export async function getActiveIndexes(): Promise<MarketIndex[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("market_indexes")
    .select("*")
    .eq("is_active", true)
    .order("market", { ascending: true });

  if (error) throw new Error(`Failed to fetch indexes: ${error.message}`);
  return data as MarketIndex[];
}
