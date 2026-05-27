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
