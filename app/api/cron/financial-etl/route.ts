import { NextRequest, NextResponse } from "next/server";
import { createFinancialServiceClient } from "@/utils/supabase/financial";
import { fetchPrices, fetchCPI, fetchTreasuryRates, fetchOilFromFRED, fetchLiquidityData, getActiveIndexes } from "@/lib/financial/etl-fetch";
import { computeAllAnalyses } from "@/lib/financial/etl-compute";
import { fetchAssetClassMarketCaps } from "@/lib/financial/etl-asset-class";

export const maxDuration = 300;

function verifyCronAuth(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET env var is not configured");
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;
  return runPipeline();
}

export async function POST(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;
  return runPipeline();
}

async function runPipeline() {
  const supabase = createFinancialServiceClient();

  // Log job start
  const { data: job } = await supabase
    .from("etl_job_log")
    .insert({ job_type: "full_pipeline", status: "started" })
    .select("id")
    .single();

  try {
    const indexes = await getActiveIndexes();

    // Stage 1: Fetch prices for all indexes
    let totalPriceRows = 0;
    for (const index of indexes) {
      try {
        if (index.symbol === "OIL") {
          const count = await fetchOilFromFRED();
          totalPriceRows += count;
        } else if (index.symbol === "GOLD") {
          continue;
        } else {
          const count = await fetchPrices(index);
          totalPriceRows += count;
        }
      } catch (e) {
        console.error(`Price fetch failed for ${index.symbol}:`, e);
      }
    }

    // Stage 2: Fetch CPI data (for all relevant countries)
    const countries = [...new Set(indexes.map((i) => {
      if (i.market === "au") return "au";
      if (i.market === "cn") return "cn";
      return "us";
    }))];

    for (const country of countries) {
      try {
        await fetchCPI(country);
      } catch (e) {
        console.error(`CPI fetch failed for ${country}:`, e);
      }
    }

    // Stage 2b: Fetch treasury rates
    try {
      await fetchTreasuryRates();
    } catch (e) {
      console.error("Treasury rates fetch failed:", e);
    }

    // Stage 2c: Fetch liquidity data
    try {
      await fetchLiquidityData();
    } catch (e) {
      console.error("Liquidity data fetch failed:", e);
    }

    // Stage 3: Compute analysis
    const analysesComputed = await computeAllAnalyses(indexes);

    // Stage 4: Asset class market caps
    let assetClassRows = 0;
    try {
      assetClassRows = await fetchAssetClassMarketCaps();
    } catch (e) {
      console.error("Asset class market cap fetch failed:", e);
    }

    // Log completion
    if (job) {
      await supabase
        .from("etl_job_log")
        .update({
          status: "completed",
          indexes_processed: indexes.length,
          completed_at: new Date().toISOString(),
          metadata: { totalPriceRows, analysesComputed, assetClassRows },
        })
        .eq("id", job.id);
    }

    return NextResponse.json({
      success: true,
      indexes: indexes.length,
      priceRows: totalPriceRows,
      analyses: analysesComputed,
      assetClassRows,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (job) {
      await supabase
        .from("etl_job_log")
        .update({
          status: "failed",
          error_message: message,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    }

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
