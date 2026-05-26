"use client";

import type { ValuationZone } from "@/lib/types/financial";

const zoneConfig: Record<ValuationZone, { label: string; className: string }> = {
  strongly_undervalued: {
    label: "Strongly Undervalued",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  undervalued: {
    label: "Undervalued",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  fair_value: {
    label: "Fair Value",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  overvalued: {
    label: "Overvalued",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  strongly_overvalued: {
    label: "Strongly Overvalued",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

export function ValuationBadge({ zone }: { zone: ValuationZone }) {
  const config = zoneConfig[zone];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
