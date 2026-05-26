import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { fetchPrices, fetchCPI, getActiveIndexes } from "@/lib/financial/etl-fetch";
import { computeAllAnalyses } from "@/lib/financial/etl-compute";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this automatically)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runPipeline();
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runPipeline();
}

async function runPipeline() {
  const supabase = createServiceClient();

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
        const count = await fetchPrices(index);
        totalPriceRows += count;
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

    // Stage 3: Compute analysis
    const analysesComputed = await computeAllAnalyses(indexes);

    // Log completion
    if (job) {
      await supabase
        .from("etl_job_log")
        .update({
          status: "completed",
          indexes_processed: indexes.length,
          completed_at: new Date().toISOString(),
          metadata: { totalPriceRows, analysesComputed },
        })
        .eq("id", job.id);
    }

    return NextResponse.json({
      success: true,
      indexes: indexes.length,
      priceRows: totalPriceRows,
      analyses: analysesComputed,
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
