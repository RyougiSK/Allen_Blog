"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import type { AssetClassTimeSeriesPoint } from "@/lib/types/financial";

interface KPIDef {
  id: string;
  name: string;
  compute: (latest: Record<string, number | null>, globalTotal: number) => number | null;
  format: (v: number) => string;
  interpret: (v: number) => string;
  zones: Array<{ max: number; color: string; label: string }>;
  source: string;
  rationale: string;
}

const KPIS: KPIDef[] = [
  {
    id: "gold_anchor",
    name: "Gold Monetary Anchor",
    compute: (v, total) => {
      const gold = v.gold ?? 0;
      return total > 0 ? (gold / total) * 100 : null;
    },
    format: (v) => `${v.toFixed(1)}%`,
    interpret: (v) => {
      const ratio = Math.round(100 / v);
      return `$${ratio} of claims per $1 gold backing`;
    },
    zones: [
      { max: 4, color: "#EF4444", label: "Excessive expansion" },
      { max: 6, color: "#F59E0B", label: "Below anchor" },
      { max: 10, color: "#22C55E", label: "Adequate" },
      { max: 100, color: "#3B82F6", label: "Flight to safety" },
    ],
    source: "Dalio, All Weather (7.5% allocation); Lyn Alden, gold/M2 framework; World Gold Council",
    rationale: "Gold is no one's liability. Its share of total assets represents hard backing. Below 5% signals excessive financial expansion relative to monetary anchor.",
  },
  {
    id: "financialization",
    name: "Financialization Index",
    compute: (v) => {
      const securities = (v.global_equities ?? 0) + (v.global_bonds ?? 0);
      const real = (v.real_estate ?? 0) + (v.gold ?? 0);
      return real > 0 ? securities / real : null;
    },
    format: (v) => `${v.toFixed(2)}×`,
    interpret: (v) => `$${v.toFixed(1)} in paper claims per $1 real asset`,
    zones: [
      { max: 1.5, color: "#3B82F6", label: "Under-financialized" },
      { max: 2.0, color: "#22C55E", label: "Balanced" },
      { max: 2.5, color: "#F59E0B", label: "Elevated" },
      { max: 100, color: "#EF4444", label: "Over-financialized" },
    ],
    source: "Philippon (2015, QJE); Kevin Phillips, 'Bad Money'; Minsky, Financial Instability Hypothesis",
    rationale: "When financial claims (equities + bonds) grow far beyond tangible wealth (RE + gold), the system becomes fragile. More claims chasing less substance.",
  },
  {
    id: "debt_dominance",
    name: "Debt Dominance",
    compute: (v) => {
      const bonds = v.global_bonds ?? 0;
      const equities = v.global_equities ?? 0;
      return equities > 0 ? bonds / equities : null;
    },
    format: (v) => `${v.toFixed(2)}:1`,
    interpret: (v) => `$${v.toFixed(2)} of debt per $1 of equity`,
    zones: [
      { max: 1.0, color: "#3B82F6", label: "Equity-dominant" },
      { max: 1.5, color: "#22C55E", label: "Balanced" },
      { max: 2.0, color: "#F59E0B", label: "Debt-heavy" },
      { max: 100, color: "#EF4444", label: "Debt overhang" },
    ],
    source: "Dalio, 'Big Debt Crises' (2018); Grantham, GMO Quarterly; BIS credit/GDP thresholds",
    rationale: "Bonds must be repaid or default. Equities absorb losses flexibly. High debt/equity = growth funded by borrowing, fragile to rate shocks.",
  },
  {
    id: "derivatives_complexity",
    name: "Derivatives Complexity",
    compute: (v) => {
      const deriv = v.derivatives ?? 0;
      const underlying = (v.global_equities ?? 0) + (v.global_bonds ?? 0);
      return underlying > 0 ? (deriv / underlying) * 100 : null;
    },
    format: (v) => `${v.toFixed(1)}%`,
    interpret: (v) => `GMV is ${v.toFixed(1)}% of underlying securities`,
    zones: [
      { max: 3, color: "#22C55E", label: "Low complexity" },
      { max: 6, color: "#F59E0B", label: "Moderate" },
      { max: 10, color: "#EF4444", label: "High leverage" },
      { max: 100, color: "#EF4444", label: "Extreme" },
    ],
    source: "BIS Quarterly Review, OTC Statistics; FSB OTC Derivatives Reforms; BIS WP 457",
    rationale: "Derivatives GMV relative to underlying assets measures hedging complexity and hidden leverage. Pre-2008 this exceeded 10%, signaling systemic risk.",
  },
  {
    id: "crypto_gold",
    name: "Digital Gold Displacement",
    compute: (v) => {
      const crypto = v.crypto ?? 0;
      const gold = v.gold ?? 0;
      return gold > 0 ? (crypto / gold) * 100 : null;
    },
    format: (v) => `${v.toFixed(1)}%`,
    interpret: (v) => `Crypto is ${v.toFixed(1)}% of gold's market cap`,
    zones: [
      { max: 5, color: "#22C55E", label: "Nascent" },
      { max: 15, color: "#F59E0B", label: "Emerging" },
      { max: 30, color: "#3B82F6", label: "Material" },
      { max: 100, color: "#8B5CF6", label: "Approaching parity" },
    ],
    source: "ARK Invest, 'Big Ideas 2024'; Fidelity Digital Assets Research (2023)",
    rationale: "Tracks generational displacement of physical scarcity by digital scarcity. Rising trough-to-trough signals structural reallocation from physical to digital hard assets.",
  },
  {
    id: "tangible_backing",
    name: "Real Asset Backing",
    compute: (v, total) => {
      const real = (v.real_estate ?? 0) + (v.gold ?? 0);
      return total > 0 ? (real / total) * 100 : null;
    },
    format: (v) => `${v.toFixed(1)}%`,
    interpret: (v) => `${v.toFixed(0)}% of global assets are tangible`,
    zones: [
      { max: 15, color: "#EF4444", label: "Overwhelmingly paper" },
      { max: 25, color: "#F59E0B", label: "Low tangibility" },
      { max: 35, color: "#22C55E", label: "Healthy" },
      { max: 100, color: "#3B82F6", label: "Tangible-dominant" },
    ],
    source: "McKinsey Global Institute, 'Rise of the Global Balance Sheet' (2021); Savills World Research",
    rationale: "RE + gold represent physically-existing wealth. A declining share means the system is increasingly built on financial abstractions, vulnerable to confidence shocks.",
  },
];

function getZone(value: number, zones: KPIDef["zones"]) {
  for (const zone of zones) {
    if (value <= zone.max) return zone;
  }
  return zones[zones.length - 1];
}

function getZonePosition(value: number, zones: KPIDef["zones"]): number {
  let prevMax = 0;
  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    if (value <= zone.max) {
      const segmentWidth = 100 / zones.length;
      const withinSegment = (value - prevMax) / (zone.max - prevMax);
      return (i * segmentWidth) + (withinSegment * segmentWidth);
    }
    prevMax = zone.max;
  }
  return 100;
}

function InfoTooltip({ source, rationale }: { source: string; rationale: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-0.5 text-text-quaternary hover:text-text-tertiary transition-colors"
      >
        <Info className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-5 z-50 w-72 p-3 rounded-lg border border-border bg-bg-secondary shadow-lg">
            <p className="text-[10px] text-text-tertiary leading-relaxed mb-2">
              {rationale}
            </p>
            <p className="text-[9px] text-text-quaternary">
              <span className="text-text-tertiary font-medium">Sources:</span> {source}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export function AssetClassKPIPanel({
  timeSeries,
  globalTotal,
}: {
  timeSeries: AssetClassTimeSeriesPoint[];
  globalTotal: number;
}) {
  const kpiValues = useMemo(() => {
    if (timeSeries.length === 0) return null;
    const latest = timeSeries[timeSeries.length - 1].values;
    return KPIS.map((kpi) => ({
      ...kpi,
      value: kpi.compute(latest, globalTotal),
    }));
  }, [timeSeries, globalTotal]);

  if (!kpiValues) return null;

  return (
    <div className="rounded-lg border border-border bg-bg-primary/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50">
        <h3 className="text-sm font-medium text-text-secondary">
          Structural Indicators
        </h3>
        <p className="text-[10px] text-text-tertiary mt-0.5">
          Ratios grounded in economic logic — what the composition signals about systemic health
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30">
        {kpiValues.map((kpi) => {
          if (kpi.value == null) return null;
          const zone = getZone(kpi.value, kpi.zones);
          const position = getZonePosition(kpi.value, kpi.zones);

          return (
            <div key={kpi.id} className="bg-bg-primary/80 p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[11px] text-text-tertiary font-medium">
                  {kpi.name}
                </span>
                <InfoTooltip source={kpi.source} rationale={kpi.rationale} />
              </div>

              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-lg font-mono text-text-primary font-medium">
                  {kpi.format(kpi.value)}
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: `${zone.color}20`,
                    color: zone.color,
                  }}
                >
                  {zone.label}
                </span>
              </div>

              {/* Zone bar */}
              <div className="relative h-1.5 rounded-full overflow-hidden mb-2">
                <div className="absolute inset-0 flex">
                  {kpi.zones.map((z, i) => (
                    <div
                      key={i}
                      className="h-full"
                      style={{
                        width: `${100 / kpi.zones.length}%`,
                        backgroundColor: `${z.color}30`,
                      }}
                    />
                  ))}
                </div>
                <div
                  className="absolute top-0 h-full w-1 rounded-full"
                  style={{
                    left: `${Math.min(position, 98)}%`,
                    backgroundColor: zone.color,
                  }}
                />
              </div>

              <p className="text-[10px] text-text-tertiary">
                {kpi.interpret(kpi.value)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
