"use server";

import { createClient } from "@/utils/supabase/server";
import type {
  MarketIndex,
  MeanReversionAnalysis,
  MeanReversionOverview,
  ModelStats,
  ETLJobLog,
  AdjustmentType,
} from "@/lib/types/financial";
import { annualizedGrowth } from "@/lib/financial/regression";

export async function getFinancialOverview(): Promise<MeanReversionOverview[]> {
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("market_indexes")
    .select("*")
    .order("market", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as MarketIndex[];
}

export async function getModelStats(): Promise<ModelStats[]> {
  const supabase = await createClient();

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
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("etl_job_log")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);
  return (data ?? []) as ETLJobLog[];
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
