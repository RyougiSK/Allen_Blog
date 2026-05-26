"use client";

import Link from "next/link";
import type { MeanReversionOverview } from "@/lib/types/financial";
import { ValuationBadge } from "./valuation-badge";

const marketLabels: Record<string, string> = {
  us: "US",
  au: "Australia",
  cn: "China",
  commodity: "Commodity",
};

export function MarketOverviewCard({ data }: { data: MeanReversionOverview }) {
  const { index, deviation_pct, deviation_sigma, current_price, valuation_zone } = data;

  return (
    <Link
      href={`/admin/financial/markets/${index.symbol}`}
      className="block p-4 rounded-lg border border-border bg-surface/30 hover:bg-surface/60 transition-colors duration-[var(--duration-fast)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-text-quaternary uppercase tracking-wide">
            {marketLabels[index.market]}
          </div>
          <div className="text-sm font-medium text-text-primary mt-0.5">
            {index.name}
          </div>
        </div>
        <ValuationBadge zone={valuation_zone} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] text-text-quaternary uppercase">Price</div>
          <div className="text-sm text-text-primary font-mono">
            {current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-text-quaternary uppercase">Deviation</div>
          <div className={`text-sm font-mono ${deviation_pct > 0 ? "text-red-400" : "text-green-400"}`}>
            {deviation_pct > 0 ? "+" : ""}{deviation_pct.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-[10px] text-text-quaternary uppercase">Sigma</div>
          <div className={`text-sm font-mono ${deviation_sigma > 0 ? "text-red-400" : "text-green-400"}`}>
            {deviation_sigma > 0 ? "+" : ""}{deviation_sigma.toFixed(2)}σ
          </div>
        </div>
      </div>
    </Link>
  );
}
