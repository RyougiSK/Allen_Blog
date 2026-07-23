import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";
import { createFinancialServiceClient } from "@/utils/supabase/financial";
import type { AssetClass } from "@/lib/types/financial";

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

const GOLD_STOCK_BASE_YEAR = 2024;
const GOLD_STOCK_BASE_TONNES = 215000;
const GOLD_STOCK_ANNUAL_GROWTH_TONNES = 3300;
const TROY_OZ_PER_TONNE = 32150.7;

const CRYPTO_MILESTONES: Array<{ date: string; market_cap_t: number }> = [
  { date: "2017-01-01", market_cap_t: 0.018 },
  { date: "2017-12-17", market_cap_t: 0.6 },
  { date: "2018-01-07", market_cap_t: 0.83 },
  { date: "2019-01-01", market_cap_t: 0.13 },
  { date: "2020-01-01", market_cap_t: 0.19 },
  { date: "2021-01-01", market_cap_t: 1.0 },
  { date: "2021-11-10", market_cap_t: 3.0 },
  { date: "2022-06-18", market_cap_t: 0.9 },
  { date: "2023-01-01", market_cap_t: 1.07 },
  { date: "2024-01-01", market_cap_t: 1.72 },
  { date: "2024-12-01", market_cap_t: 3.3 },
];

export async function fetchAssetClassMarketCaps(): Promise<number> {
  const supabase = createFinancialServiceClient();

  const { data: assetClasses } = await supabase
    .from("asset_classes")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (!assetClasses || assetClasses.length === 0) return 0;

  let totalInserted = 0;
  const classMap = new Map(assetClasses.map((ac: AssetClass) => [ac.slug, ac]));

  const fetchers: Array<{ slug: string; fn: (ac: AssetClass) => Promise<number> }> = [
    { slug: "global_equities", fn: fetchEquityMarketCap },
    { slug: "global_bonds", fn: fetchBondMarketCap },
    { slug: "real_estate", fn: fetchRealEstateMarketCap },
    { slug: "gold", fn: fetchGoldMarketCap },
    { slug: "crypto", fn: async (ac) => {
      const rows = await fetchCryptoMarketCap(ac);
      const seeded = await seedCryptoMilestones(ac);
      return rows + seeded;
    }},
    { slug: "derivatives", fn: fetchDerivativesMarketCap },
  ];

  for (const { slug, fn } of fetchers) {
    const ac = classMap.get(slug);
    if (!ac) continue;
    try {
      totalInserted += await fn(ac);
    } catch (e) {
      console.error(`[ETL] Asset class "${slug}" fetch failed:`, e);
    }
  }

  console.log(`[ETL] Asset class market caps: ${totalInserted} total rows inserted/updated`);
  return totalInserted;
}

async function fetchFredSeries(seriesId: string, startDate: string): Promise<Array<{ date: string; value: number }>> {
  const apiKey = process.env.FRED_API_KEY || "DEMO_KEY";
  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&observation_start=${startDate}&sort_order=asc`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`FRED API error for ${seriesId}: ${response.status}`);

  const data = await response.json();
  const observations = data.observations as Array<{ date: string; value: string }>;
  if (!observations) return [];

  return observations
    .filter((o) => o.value !== ".")
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));
}

async function getLastStoredDate(assetClassId: string): Promise<string | null> {
  const supabase = createFinancialServiceClient();
  const { data } = await supabase
    .from("asset_class_market_cap")
    .select("date")
    .eq("asset_class_id", assetClassId)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  return data?.date ?? null;
}

async function upsertMarketCaps(
  rows: Array<{ asset_class_id: string; date: string; market_cap_t: number; source: string; raw_value?: number; metadata?: Record<string, unknown> }>
): Promise<number> {
  if (rows.length === 0) return 0;
  const supabase = createFinancialServiceClient();

  const batchSize = 200;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from("asset_class_market_cap")
      .upsert(batch, { onConflict: "asset_class_id,date" });

    if (error) throw new Error(`Failed to upsert asset class market cap: ${error.message}`);
  }

  return rows.length;
}

async function fetchEquityMarketCap(assetClass: AssetClass): Promise<number> {
  const lastDate = await getLastStoredDate(assetClass.id);
  const startDate = lastDate ?? "1945-01-01";
  const multiplier = assetClass.multiplier ?? 2.22;

  // NCBEILQ027S: Corporate Equities; Liability (quarterly, in millions USD)
  const observations = await fetchFredSeries("NCBEILQ027S", startDate);
  if (observations.length === 0) return 0;

  const rows = observations.map((o) => ({
    asset_class_id: assetClass.id,
    date: o.date,
    market_cap_t: (o.value / 1_000_000) * multiplier,
    source: "fred",
    raw_value: o.value,
    metadata: { series: "NCBEILQ027S", multiplier } as Record<string, unknown>,
  }));

  console.log(`[ETL] Global Equities: ${rows.length} quarterly observations from FRED`);
  return upsertMarketCaps(rows);
}

async function fetchBondMarketCap(assetClass: AssetClass): Promise<number> {
  const lastDate = await getLastStoredDate(assetClass.id);
  const startDate = lastDate ?? "1952-01-01";
  const multiplier = assetClass.multiplier ?? 2.5;

  // TCMDO: Total Credit Market Debt Outstanding (quarterly, in millions USD)
  const observations = await fetchFredSeries("TCMDO", startDate);
  if (observations.length === 0) return 0;

  const rows = observations.map((o) => ({
    asset_class_id: assetClass.id,
    date: o.date,
    market_cap_t: (o.value / 1_000_000) * multiplier,
    source: "fred",
    raw_value: o.value,
    metadata: { series: "TCMDO", multiplier } as Record<string, unknown>,
  }));

  console.log(`[ETL] Global Bonds: ${rows.length} quarterly observations from FRED`);
  return upsertMarketCaps(rows);
}

async function fetchRealEstateMarketCap(assetClass: AssetClass): Promise<number> {
  const lastDate = await getLastStoredDate(assetClass.id);
  const startDate = lastDate ?? "1945-01-01";
  const multiplier = assetClass.multiplier ?? 3.0;

  // HNOREMV: Households & Nonprofits; Real Estate at Market Value (quarterly, in millions USD)
  const observations = await fetchFredSeries("HNOREMV", startDate);
  if (observations.length === 0) return 0;

  const rows = observations.map((o) => ({
    asset_class_id: assetClass.id,
    date: o.date,
    market_cap_t: (o.value / 1_000_000) * multiplier,
    source: "fred",
    raw_value: o.value,
    metadata: { series: "HNOREMV", multiplier } as Record<string, unknown>,
  }));

  console.log(`[ETL] Global Real Estate: ${rows.length} quarterly observations from FRED`);
  return upsertMarketCaps(rows);
}

async function fetchGoldMarketCap(assetClass: AssetClass): Promise<number> {
  const supabase = createFinancialServiceClient();
  const lastDate = await getLastStoredDate(assetClass.id);

  // Get gold index ID
  const { data: goldIndex } = await supabase
    .from("market_indexes")
    .select("id")
    .eq("symbol", "GOLD")
    .single();

  if (!goldIndex) {
    console.warn("[ETL] Gold index not found in market_indexes");
    return 0;
  }

  // Fetch gold prices since last stored date (paginated)
  const allPrices: Array<{ date: string; close_price: number }> = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    let query = supabase
      .from("market_prices")
      .select("date, close_price")
      .eq("index_id", goldIndex.id)
      .order("date", { ascending: true })
      .range(from, from + pageSize - 1);

    if (lastDate) {
      query = query.gt("date", lastDate);
    }

    const { data: prices } = await query;
    if (!prices || prices.length === 0) break;
    allPrices.push(...prices);
    if (prices.length < pageSize) break;
    from += pageSize;
  }

  if (allPrices.length === 0) return 0;

  const rows = allPrices.map((p) => {
    const date = new Date(p.date);
    const yearsSince2024 = (date.getFullYear() - GOLD_STOCK_BASE_YEAR) +
      (date.getMonth() / 12);
    const estimatedTonnes = GOLD_STOCK_BASE_TONNES + (yearsSince2024 * GOLD_STOCK_ANNUAL_GROWTH_TONNES);
    const totalOz = estimatedTonnes * TROY_OZ_PER_TONNE;
    const marketCapT = (totalOz * p.close_price) / 1e12;

    return {
      asset_class_id: assetClass.id,
      date: p.date,
      market_cap_t: marketCapT,
      source: "calculated",
      raw_value: p.close_price,
      metadata: { estimated_tonnes: estimatedTonnes, gold_price_usd: p.close_price } as Record<string, unknown>,
    };
  });

  console.log(`[ETL] Gold: ${rows.length} daily calculations`);
  return upsertMarketCaps(rows);
}

async function fetchCryptoMarketCap(assetClass: AssetClass): Promise<number> {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/global");
    if (!response.ok) {
      console.warn(`[ETL] CoinGecko API error: ${response.status} — skipping crypto`);
      return 0;
    }

    const data = await response.json();
    const totalMarketCap = data?.data?.total_market_cap?.usd;
    if (!totalMarketCap) {
      console.warn("[ETL] CoinGecko: no total_market_cap.usd in response");
      return 0;
    }

    const today = new Date().toISOString().split("T")[0];
    const marketCapT = totalMarketCap / 1e12;

    const rows = [{
      asset_class_id: assetClass.id,
      date: today,
      market_cap_t: marketCapT,
      source: "coingecko",
      raw_value: totalMarketCap,
      metadata: {
        btc_dominance: data.data.market_cap_percentage?.btc,
        eth_dominance: data.data.market_cap_percentage?.eth,
        active_cryptocurrencies: data.data.active_cryptocurrencies,
      } as Record<string, unknown>,
    }];

    console.log(`[ETL] Crypto: $${marketCapT.toFixed(2)}T (BTC dominance: ${data.data.market_cap_percentage?.btc?.toFixed(1)}%)`);
    return upsertMarketCaps(rows);
  } catch (err) {
    console.warn("[ETL] CoinGecko fetch failed:", err);
    return 0;
  }
}

async function seedCryptoMilestones(assetClass: AssetClass): Promise<number> {
  const supabase = createFinancialServiceClient();

  // Check if milestones already seeded
  const { count } = await supabase
    .from("asset_class_market_cap")
    .select("*", { count: "exact", head: true })
    .eq("asset_class_id", assetClass.id)
    .eq("source", "milestone");

  if (count && count >= CRYPTO_MILESTONES.length) return 0;

  const rows = CRYPTO_MILESTONES.map((m) => ({
    asset_class_id: assetClass.id,
    date: m.date,
    market_cap_t: m.market_cap_t,
    source: "milestone",
    metadata: { note: "Historical milestone from public sources" } as Record<string, unknown>,
  }));

  console.log(`[ETL] Crypto milestones: seeding ${rows.length} historical data points`);
  return upsertMarketCaps(rows);
}

const BIS_BULK_CSV_URL = "https://data.bis.org/static/bulk/WS_OTC_DERIV2_csv_col.zip";

async function fetchDerivativesMarketCap(assetClass: AssetClass): Promise<number> {
  // Download BIS OTC derivatives bulk CSV (zipped, ~4.5MB)
  const response = await fetch(BIS_BULK_CSV_URL);
  if (!response.ok) {
    console.warn(`[ETL] BIS bulk download failed: ${response.status}`);
    return 0;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  const csvEntry = entries.find((e) => e.entryName.endsWith(".csv"));
  if (!csvEntry) {
    console.warn("[ETL] BIS: no CSV file found in zip archive");
    return 0;
  }

  const csvContent = csvEntry.getData().toString("utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Array<Record<string, string>>;

  // Find the grand total row for gross market value:
  // DER_TYPE=D (gross market values), DER_INSTR=A (all instruments),
  // DER_RISK=A (all risk categories), DER_SECTOR_CPY=A (all counterparties),
  // DER_CPC=5J (all countries), DER_REP_CTY=5J (all reporting countries),
  // DER_CURR_LEG1=TO1, DER_CURR_LEG2=TO1 (all currencies),
  // DER_ISSUE_MAT=A (all maturities), DER_BASIS=C (net-net, adjusted for dealer double-counting)
  const totalRow = records.find((row) =>
    row["DER_TYPE"] === "D" &&
    row["DER_INSTR"] === "A" &&
    row["DER_RISK"] === "A" &&
    row["DER_SECTOR_CPY"] === "A" &&
    row["DER_CPC"] === "5J" &&
    row["DER_REP_CTY"] === "5J" &&
    row["DER_CURR_LEG1"] === "TO1" &&
    row["DER_CURR_LEG2"] === "TO1" &&
    row["DER_ISSUE_MAT"] === "A" &&
    row["DER_BASIS"] === "C"
  );

  if (!totalRow) {
    console.warn("[ETL] BIS: grand total row not found in CSV");
    if (records.length > 0) {
      console.warn("[ETL] BIS CSV columns:", Object.keys(records[0]).slice(0, 20).join(", "));
    }
    return 0;
  }

  // Wide-format: time period columns are like "1998-S1", "1998-S2", ..., "2025-S2"
  // Values are in millions USD
  const lastDate = await getLastStoredDate(assetClass.id);
  const timeCols = Object.keys(totalRow).filter((k) => /^\d{4}-S[12]$/.test(k));

  const rows: Array<{
    asset_class_id: string;
    date: string;
    market_cap_t: number;
    source: string;
    raw_value: number;
    metadata: Record<string, unknown>;
  }> = [];

  for (const col of timeCols) {
    const rawValue = totalRow[col];
    if (!rawValue || rawValue === "") continue;

    const value = parseFloat(rawValue);
    if (isNaN(value) || value === 0) continue;

    // Convert "2023-S1" → "2023-06-30", "2023-S2" → "2023-12-31"
    const year = col.substring(0, 4);
    const half = col.substring(5);
    const date = half === "S1" ? `${year}-06-30` : `${year}-12-31`;

    if (lastDate && date <= lastDate) continue;

    rows.push({
      asset_class_id: assetClass.id,
      date,
      market_cap_t: value / 1_000_000,
      source: "bis_bulk",
      raw_value: value,
      metadata: { time_period: col, measure: "gross_market_value", basis: "net-net" },
    });
  }

  if (rows.length > 0) {
    console.log(`[ETL] Derivatives (BIS bulk): ${rows.length} semi-annual observations`);
  } else {
    console.log("[ETL] Derivatives: no new data since last fetch");
  }
  return upsertMarketCaps(rows);
}
