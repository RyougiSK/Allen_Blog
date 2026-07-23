"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import {
  getAssetClassSnapshots,
  getAssetClassRawTimeSeries,
  getAssetClassBreakdown,
} from "@/lib/actions/financial";
import { AssetClassStackedArea } from "@/components/features/financial/asset-class-stacked-area";
import { AssetClassPercentArea } from "@/components/features/financial/asset-class-percent-area";
import { AssetClassSummaryCards } from "@/components/features/financial/asset-class-summary-cards";
import {
  AssetClassAssumptions,
  DEFAULT_ASSUMPTIONS,
  type AssumptionParams,
} from "@/components/features/financial/asset-class-assumptions";
import type {
  AssetClassSnapshot,
  AssetClassTimeSeriesPoint,
  RawAssetClassDataPoint,
} from "@/lib/types/financial";

const GOLD_STOCK_BASE_YEAR = 2024;
const TROY_OZ_PER_TONNE = 32150.7;

function computeGlobalTotal(date: string, params: AssumptionParams): number {
  const d = new Date(date);
  const yearsSince = (d.getFullYear() - 2024) + d.getMonth() / 12;
  return params.globalTotalBaseT * Math.pow(1 + params.globalTotalGrowthRate, yearsSince);
}

function computeGoldMarketCapT(
  rawValue: number,
  date: string,
  params: AssumptionParams
): number {
  const d = new Date(date);
  const yearsSince = d.getFullYear() - GOLD_STOCK_BASE_YEAR + d.getMonth() / 12;
  const tonnes = params.goldBaseTonnes + params.goldAnnualGrowthTonnes * yearsSince;
  const totalOz = tonnes * TROY_OZ_PER_TONNE;
  return (totalOz * rawValue) / 1e12;
}

function getMultiplierForSlug(slug: string, params: AssumptionParams): number {
  switch (slug) {
    case "global_equities": return params.equityMultiplier;
    case "global_bonds": return params.bondMultiplier;
    case "real_estate": return params.realEstateMultiplier;
    default: return 1;
  }
}

export default function AssetClassesPage() {
  const [snapshots, setSnapshots] = useState<AssetClassSnapshot[]>([]);
  const [rawPoints, setRawPoints] = useState<RawAssetClassDataPoint[]>([]);
  const [classMeta, setClassMeta] = useState<
    Array<{ slug: string; estimation_method: string; multiplier: number | null }>
  >([]);
  const [totalEstimated, setTotalEstimated] = useState(0);
  const [timeframe, setTimeframe] = useState<"1y" | "5y" | "10y" | "all">("all");
  const [loading, setLoading] = useState(true);
  const [tsLoading, setTsLoading] = useState(true);
  const [assumptions, setAssumptions] = useState<AssumptionParams>(DEFAULT_ASSUMPTIONS);
  const [showOther, setShowOther] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [snapshotData, breakdownData] = await Promise.all([
          getAssetClassSnapshots(),
          getAssetClassBreakdown(),
        ]);
        setSnapshots(snapshotData);
        setTotalEstimated(breakdownData.total_estimated);
      } catch (e) {
        console.error("Failed to load asset class data:", e);
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    async function loadRaw() {
      setTsLoading(true);
      try {
        const { points, classes } = await getAssetClassRawTimeSeries(timeframe);
        setRawPoints(points);
        setClassMeta(classes);
      } catch (e) {
        console.error("Failed to load raw time series:", e);
      }
      setTsLoading(false);
    }
    loadRaw();
  }, [timeframe]);

  const timeSeries = useMemo<AssetClassTimeSeriesPoint[]>(() => {
    if (rawPoints.length === 0) return [];

    const dateSet = new Set<string>();
    rawPoints.forEach((p) => dateSet.add(p.date));
    const allDates = [...dateSet].sort();

    const slugs = classMeta.map((c) => c.slug);
    const methodMap = new Map(classMeta.map((c) => [c.slug, c.estimation_method]));

    // Build raw lookup maps per slug
    const maps: Record<string, Map<string, { market_cap_t: number; raw_value: number | null }>> = {};
    for (const slug of slugs) {
      maps[slug] = new Map();
    }
    for (const p of rawPoints) {
      if (maps[p.slug]) {
        maps[p.slug].set(p.date, { market_cap_t: p.market_cap_t, raw_value: p.raw_value });
      }
    }

    // Phase 1: Forward-fill across ALL dates for every slug
    const forwardFilled: Record<string, Map<string, { market_cap_t: number; raw_value: number | null }>> = {};
    for (const slug of slugs) {
      forwardFilled[slug] = new Map();
      let last: { market_cap_t: number; raw_value: number | null } | null = null;
      for (const date of allDates) {
        const entry = maps[slug].get(date);
        if (entry !== undefined) last = entry;
        if (last) forwardFilled[slug].set(date, last);
      }
    }

    // Phase 2: Downsample
    const maxPoints = 400;
    const step = Math.max(1, Math.floor(allDates.length / maxPoints));
    const dates = allDates.filter((_, i) => i % step === 0);

    // Phase 3: Build result from forward-filled data
    const result: AssetClassTimeSeriesPoint[] = [];

    for (const date of dates) {
      const values: Record<string, number | null> = {};

      for (const slug of slugs) {
        const known = forwardFilled[slug].get(date) ?? null;
        if (!known) {
          values[slug] = null;
          continue;
        }

        const method = methodMap.get(slug);
        if (method === "multiplier" && known.raw_value != null) {
          const rawT = known.raw_value / 1_000_000;
          values[slug] = rawT * getMultiplierForSlug(slug, assumptions);
        } else if (method === "calculated" && slug === "gold" && known.raw_value != null) {
          values[slug] = computeGoldMarketCapT(known.raw_value, date, assumptions);
        } else {
          values[slug] = known.market_cap_t;
        }
      }

      // Phase 4: Compute "Other" residual
      const tracked = Object.values(values).reduce<number>((sum, v) => sum + (v ?? 0), 0);
      const globalTotal = computeGlobalTotal(date, assumptions);
      values["other"] = Math.max(0, globalTotal - tracked);

      result.push({ date, values });
    }

    return result;
  }, [rawPoints, classMeta, assumptions]);

  const adjustedTotalEstimated = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return computeGlobalTotal(today, assumptions);
  }, [assumptions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-6 w-6 text-text-tertiary animate-spin" />
        <p className="text-sm text-text-tertiary">Loading asset class data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AssetClassAssumptions params={assumptions} onChange={setAssumptions} />

      <AssetClassSummaryCards
        snapshots={snapshots}
        totalEstimated={adjustedTotalEstimated}
      />

      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowOther(!showOther)}
          className={`px-3 py-1.5 text-[11px] rounded border transition-colors ${
            showOther
              ? "border-border text-text-tertiary hover:text-text-secondary"
              : "border-amber-500/40 text-amber-400 bg-amber-500/10"
          }`}
        >
          {showOther ? "Hide \"Other\" Residual" : "Show \"Other\" Residual"}
        </button>
      </div>

      <AssetClassStackedArea
        data={timeSeries}
        onTimeframeChange={setTimeframe}
        activeTimeframe={timeframe}
        showOther={showOther}
        loading={tsLoading}
      />

      <AssetClassPercentArea data={timeSeries} showOther={showOther} />

      <div className="rounded-lg border border-border bg-bg-primary/50 p-4">
        <h4 className="text-xs font-medium text-text-secondary mb-2">
          Methodology & Sources
        </h4>
        <div className="text-[10px] text-text-tertiary space-y-1 leading-relaxed">
          <p>
            <span className="text-text-secondary">Equities:</span> FRED NCBEILQ027S (US corporate equities liability, quarterly) × {assumptions.equityMultiplier.toFixed(2)} global multiplier.
          </p>
          <p>
            <span className="text-text-secondary">Bonds:</span> FRED TCMDO (US total credit market debt, quarterly) × {assumptions.bondMultiplier.toFixed(2)} global multiplier.
          </p>
          <p>
            <span className="text-text-secondary">Real Estate:</span> FRED HNOREMV (US household real estate, quarterly) × {assumptions.realEstateMultiplier.toFixed(2)} global multiplier.
          </p>
          <p>
            <span className="text-text-secondary">Gold:</span> Estimated above-ground stock (~{assumptions.goldBaseTonnes.toLocaleString()}t in 2024, +{assumptions.goldAnnualGrowthTonnes.toLocaleString()}t/yr) × spot price.
          </p>
          <p>
            <span className="text-text-secondary">Crypto:</span> CoinGecko total market cap (daily) + historical milestones.
          </p>
          <p>
            <span className="text-text-secondary">Derivatives:</span> BIS OTC derivatives gross market value (semi-annual).
          </p>
          <p>
            <span className="text-text-secondary">Other:</span> Residual from ~${assumptions.globalTotalBaseT}T global total (McKinsey, 2024 base, +{(assumptions.globalTotalGrowthRate * 100).toFixed(0)}%/yr).
          </p>
        </div>
      </div>
    </div>
  );
}
