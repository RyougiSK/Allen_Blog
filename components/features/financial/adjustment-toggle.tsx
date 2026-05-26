"use client";

import type { AdjustmentType } from "@/lib/types/financial";

const adjustments: { value: AdjustmentType; label: string }[] = [
  { value: "nominal", label: "Nominal" },
  { value: "cpi", label: "CPI-Adjusted" },
  { value: "gold", label: "Gold-Adjusted" },
  { value: "oil", label: "Oil-Adjusted" },
];

export function AdjustmentToggle({
  value,
  onChange,
}: {
  value: AdjustmentType;
  onChange: (v: AdjustmentType) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border overflow-hidden">
      {adjustments.map((adj) => (
        <button
          key={adj.value}
          onClick={() => onChange(adj.value)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors duration-[var(--duration-fast)] ${
            value === adj.value
              ? "bg-surface text-text-primary"
              : "text-text-tertiary hover:text-text-secondary hover:bg-surface/30"
          }`}
        >
          {adj.label}
        </button>
      ))}
    </div>
  );
}
