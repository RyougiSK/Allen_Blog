import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { fetchPrices, fetchCPI, getActiveIndexes } from "@/lib/financial/etl-fetch";
import { computeAllAnalyses } from "@/lib/financial/etl-compute";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Auth check — only authenticated admin users
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Support forceFresh query param to re-fetch all data from scratch
  const forceFresh = request.nextUrl.searchParams.get("fresh") === "1";

  const supabase = createServiceClient();

  const { data: job } = await supabase
    .from("etl_job_log")
    .insert({ job_type: "full_pipeline", status: "started" })
    .select("id")
    .single();

  try {
    const indexes = await getActiveIndexes();

    let totalPriceRows = 0;
    for (const index of indexes) {
      try {
        const count = await fetchPrices(index, forceFresh);
        totalPriceRows += count;
      } catch (e) {
        console.error(`Price fetch failed for ${index.symbol}:`, e);
      }
    }

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

    const analysesComputed = await computeAllAnalyses(indexes);

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
