"use client";

import { useState, useEffect } from "react";
import { getSpreadHistory } from "@/lib/actions/financial";
import type { TreasuryRate } from "@/lib/types/financial";
import { SpreadHistoryChart } from "@/components/features/financial/spread-history-chart";

export default function SpreadPage() {
  const [spread10y2y, setSpread10y2y] = useState<TreasuryRate[]>([]);
  const [spread10y3m, setSpread10y3m] = useState<TreasuryRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSpreadHistory("10y2y"),
      getSpreadHistory("10y3m"),
    ]).then(([s1, s2]) => {
      setSpread10y2y(s1);
      setSpread10y3m(s2);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-sm text-text-tertiary animate-pulse">Loading spread data...</div>
      </div>
    );
  }

  if (spread10y2y.length === 0 && spread10y3m.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-tertiary text-sm">
          No treasury spread data yet. Run the ETL pipeline from the Overview tab first.
        </p>
      </div>
    );
  }

  const latest10y2y = spread10y2y[spread10y2y.length - 1];
  const latest10y3m = spread10y3m[spread10y3m.length - 1];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-display text-text-primary">Treasury Spread History</h2>
        <p className="text-sm text-text-tertiary mt-0.5">
          Negative spread (inversion) has preceded every US recession since 1970
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-secondary">10-Year minus 2-Year</h3>
          {latest10y2y && (
            <span className={`text-sm font-mono ${latest10y2y.rate < 0 ? "text-red-400" : "text-green-400"}`}>
              {latest10y2y.rate > 0 ? "+" : ""}{latest10y2y.rate.toFixed(2)}% ({latest10y2y.date})
            </span>
          )}
        </div>
        <SpreadHistoryChart data={spread10y2y} label="10Y-2Y Spread" />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-secondary">10-Year minus 3-Month</h3>
          {latest10y3m && (
            <span className={`text-sm font-mono ${latest10y3m.rate < 0 ? "text-red-400" : "text-green-400"}`}>
              {latest10y3m.rate > 0 ? "+" : ""}{latest10y3m.rate.toFixed(2)}% ({latest10y3m.date})
            </span>
          )}
        </div>
        <SpreadHistoryChart data={spread10y3m} label="10Y-3M Spread" />
      </section>
    </div>
  );
}
