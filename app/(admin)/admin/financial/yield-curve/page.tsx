"use client";

import { useState, useEffect } from "react";
import { getCurrentYieldCurve, getHistoricalYieldCurve } from "@/lib/actions/financial";
import type { TreasuryRate } from "@/lib/types/financial";
import { YieldCurveChart } from "@/components/features/financial/yield-curve-chart";

export default function YieldCurvePage() {
  const [current, setCurrent] = useState<TreasuryRate[]>([]);
  const [oneYearAgo, setOneYearAgo] = useState<TreasuryRate[]>([]);
  const [fiveYearsAgo, setFiveYearsAgo] = useState<TreasuryRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const y1 = new Date(now);
    y1.setFullYear(y1.getFullYear() - 1);
    const y5 = new Date(now);
    y5.setFullYear(y5.getFullYear() - 5);

    Promise.all([
      getCurrentYieldCurve(),
      getHistoricalYieldCurve(y1.toISOString().split("T")[0]),
      getHistoricalYieldCurve(y5.toISOString().split("T")[0]),
    ]).then(([c, h1, h5]) => {
      setCurrent(c);
      setOneYearAgo(h1);
      setFiveYearsAgo(h5);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-sm text-text-tertiary animate-pulse">Loading yield curve...</div>
      </div>
    );
  }

  if (current.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-tertiary text-sm">
          No treasury rate data yet. Run the ETL pipeline from the Overview tab first.
        </p>
      </div>
    );
  }

  const isInverted = current.length >= 2 && current[0].rate > current[current.length - 1].rate;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-display text-text-primary">US Treasury Yield Curve</h2>
          {isInverted && (
            <span className="px-2 py-0.5 text-[10px] font-medium uppercase rounded bg-red-500/15 text-red-400 border border-red-500/20">
              Inverted
            </span>
          )}
        </div>
        <p className="text-sm text-text-tertiary mt-0.5">
          Current curve vs historical snapshots — inversion signals potential recession
        </p>
      </div>

      <YieldCurveChart
        current={current}
        oneYearAgo={oneYearAgo}
        fiveYearsAgo={fiveYearsAgo}
      />

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {current.map((r) => (
          <div key={r.maturity} className="p-3 rounded-lg border border-border bg-surface/30">
            <div className="text-[10px] text-text-quaternary uppercase">{r.maturity}</div>
            <div className="text-lg font-mono text-text-primary mt-0.5">{r.rate.toFixed(2)}%</div>
            <div className="text-[10px] text-text-quaternary mt-0.5">{r.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
