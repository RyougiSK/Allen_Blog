"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { AssetClassSnapshot } from "@/lib/types/financial";

export function AssetClassSummaryCards({
  snapshots,
  totalEstimated,
}: {
  snapshots: AssetClassSnapshot[];
  totalEstimated: number;
}) {
  const trackedTotal = snapshots.reduce((sum, s) => sum + s.latest_value, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {/* Total card */}
      <div className="rounded-lg border border-border bg-bg-primary/50 p-4">
        <div className="text-[10px] uppercase tracking-wider text-text-tertiary mb-1">
          Estimated Global Total
        </div>
        <div className="text-xl font-display text-text-primary">
          ${totalEstimated.toFixed(0)}T
        </div>
        <div className="text-[10px] text-text-tertiary mt-1">
          Tracked: ${trackedTotal.toFixed(0)}T ({((trackedTotal / totalEstimated) * 100).toFixed(0)}%)
        </div>
      </div>

      {/* Per-class cards */}
      {snapshots.map((s) => (
        <div
          key={s.asset_class.slug}
          className="rounded-lg border border-border bg-bg-primary/50 p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: s.asset_class.color }}
            />
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
              {s.asset_class.name}
            </span>
          </div>
          <div className="text-xl font-display text-text-primary">
            ${s.latest_value.toFixed(1)}T
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {s.change_1y_pct != null ? (
              <>
                {s.change_1y_pct >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span
                  className={`text-[11px] font-medium ${
                    s.change_1y_pct >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {s.change_1y_pct >= 0 ? "+" : ""}
                  {s.change_1y_pct.toFixed(1)}% YoY
                </span>
              </>
            ) : (
              <span className="text-[10px] text-text-tertiary">No YoY data</span>
            )}
          </div>
          <div className="text-[9px] text-text-tertiary mt-1">
            as of {s.latest_date}
          </div>
        </div>
      ))}
    </div>
  );
}
