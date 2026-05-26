"use client";

import type { ModelStats } from "@/lib/types/financial";
import { ValuationBadge } from "./valuation-badge";

export function ModelStatsTable({ stats }: { stats: ModelStats[] }) {
  if (stats.length === 0) {
    return (
      <p className="text-sm text-text-tertiary py-8 text-center">
        No analysis data yet. Run the ETL pipeline to compute model statistics.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-surface/30">
            <th className="text-left px-3 py-2 font-medium text-text-secondary">Index</th>
            <th className="text-left px-3 py-2 font-medium text-text-secondary">Adjustment</th>
            <th className="text-left px-3 py-2 font-medium text-text-secondary">Data Start</th>
            <th className="text-right px-3 py-2 font-medium text-text-secondary">Points</th>
            <th className="text-right px-3 py-2 font-medium text-text-secondary">R²</th>
            <th className="text-right px-3 py-2 font-medium text-text-secondary">Std Dev</th>
            <th className="text-right px-3 py-2 font-medium text-text-secondary">Annual Growth</th>
            <th className="text-right px-3 py-2 font-medium text-text-secondary">Current σ</th>
            <th className="text-left px-3 py-2 font-medium text-text-secondary">Zone</th>
            <th className="text-left px-3 py-2 font-medium text-text-secondary">Computed</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border/50 hover:bg-surface/20 transition-colors"
            >
              <td className="px-3 py-2 text-text-primary font-medium">
                {row.index.name}
              </td>
              <td className="px-3 py-2 text-text-tertiary capitalize">
                {row.adjustment_type}
              </td>
              <td className="px-3 py-2 text-text-tertiary font-mono">
                {row.data_start ?? "—"}
              </td>
              <td className="px-3 py-2 text-text-secondary text-right font-mono">
                {row.data_points.toLocaleString()}
              </td>
              <td className="px-3 py-2 text-text-secondary text-right font-mono">
                {row.r_squared.toFixed(4)}
              </td>
              <td className="px-3 py-2 text-text-secondary text-right font-mono">
                {row.std_deviation.toFixed(4)}
              </td>
              <td className="px-3 py-2 text-text-secondary text-right font-mono">
                {(row.annual_growth * 100).toFixed(2)}%
              </td>
              <td className={`px-3 py-2 text-right font-mono ${row.current_sigma > 0 ? "text-red-400" : "text-green-400"}`}>
                {row.current_sigma > 0 ? "+" : ""}{row.current_sigma.toFixed(2)}σ
              </td>
              <td className="px-3 py-2">
                <ValuationBadge zone={row.valuation_zone} />
              </td>
              <td className="px-3 py-2 text-text-quaternary">
                {new Date(row.computed_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
