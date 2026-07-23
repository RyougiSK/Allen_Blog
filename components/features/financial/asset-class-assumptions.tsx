"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

export interface AssumptionParams {
  equityMultiplier: number;
  bondMultiplier: number;
  realEstateMultiplier: number;
  goldBaseTonnes: number;
  goldAnnualGrowthTonnes: number;
  globalTotalBaseT: number;
  globalTotalGrowthRate: number;
}

export const DEFAULT_ASSUMPTIONS: AssumptionParams = {
  equityMultiplier: 2.22,
  bondMultiplier: 2.5,
  realEstateMultiplier: 3.0,
  goldBaseTonnes: 215000,
  goldAnnualGrowthTonnes: 3300,
  globalTotalBaseT: 900,
  globalTotalGrowthRate: 0.05,
};

interface AssumptionDef {
  key: keyof AssumptionParams;
  label: string;
  unit: string;
  step: number;
  min: number;
  max: number;
  rationale: string;
  source: string;
  sourceUrl?: string;
}

const ASSUMPTIONS: AssumptionDef[] = [
  {
    key: "equityMultiplier",
    label: "US → Global Equity Multiplier",
    unit: "×",
    step: 0.01,
    min: 1.5,
    max: 4.0,
    rationale: "US share of global equity market cap is ~45% (2024). Multiplier = 1/0.45 ≈ 2.22.",
    source: "SIFMA Capital Markets Fact Book 2024",
    sourceUrl: "https://www.sifma.org/resources/research/fact-book/",
  },
  {
    key: "bondMultiplier",
    label: "US → Global Bond Multiplier",
    unit: "×",
    step: 0.01,
    min: 1.5,
    max: 4.0,
    rationale: "US share of global fixed income is ~40% (2024). Multiplier = 1/0.40 = 2.5.",
    source: "BIS Quarterly Review, Dec 2024",
    sourceUrl: "https://www.bis.org/publ/qtrpdf/r_qt2412.htm",
  },
  {
    key: "realEstateMultiplier",
    label: "US → Global Real Estate Multiplier",
    unit: "×",
    step: 0.01,
    min: 2.0,
    max: 5.0,
    rationale: "US share of global real estate value is ~33% (2024). Multiplier = 1/0.33 ≈ 3.0.",
    source: "Savills World Research: The Value of Global Real Estate (2024)",
    sourceUrl: "https://www.savills.com/impacts/market-trends/the-total-value-of-global-real-estate.html",
  },
  {
    key: "goldBaseTonnes",
    label: "Above-Ground Gold Stock (2024 base)",
    unit: "tonnes",
    step: 1000,
    min: 200000,
    max: 230000,
    rationale: "World Gold Council estimates 212,582 tonnes mined as of end-2023, growing ~3,300t/year.",
    source: "World Gold Council: How much gold has been mined?",
    sourceUrl: "https://www.gold.org/goldhub/data/how-much-gold",
  },
  {
    key: "goldAnnualGrowthTonnes",
    label: "Gold Mining Output (annual)",
    unit: "tonnes/yr",
    step: 100,
    min: 2500,
    max: 4500,
    rationale: "Annual mine production has averaged ~3,300 tonnes over the past decade.",
    source: "World Gold Council: Gold Supply & Demand Data",
    sourceUrl: "https://www.gold.org/goldhub/data/gold-supply-and-demand-statistics",
  },
  {
    key: "globalTotalBaseT",
    label: "Global Total Asset Value (2024 base)",
    unit: "$T",
    step: 10,
    min: 700,
    max: 1200,
    rationale: "McKinsey Global Institute estimates ~$900T in global financial and real assets (2024).",
    source: "McKinsey: The rise and rise of the global balance sheet (2021, updated 2024)",
    sourceUrl: "https://www.mckinsey.com/industries/financial-services/our-insights/the-rise-and-rise-of-the-global-balance-sheet-how-productively-are-we-using-our-wealth",
  },
  {
    key: "globalTotalGrowthRate",
    label: "Global Total Annual Growth Rate",
    unit: "%/yr",
    step: 0.005,
    min: 0.02,
    max: 0.10,
    rationale: "Long-run global wealth has grown ~5% annually (nominal) since 2000.",
    source: "Credit Suisse Global Wealth Report 2024",
    sourceUrl: "https://www.ubs.com/global/en/family-office-uhnw/reports/global-wealth-report.html",
  },
];

export function AssetClassAssumptions({
  params,
  onChange,
}: {
  params: AssumptionParams;
  onChange: (params: AssumptionParams) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasChanges = Object.keys(DEFAULT_ASSUMPTIONS).some(
    (k) => params[k as keyof AssumptionParams] !== DEFAULT_ASSUMPTIONS[k as keyof AssumptionParams]
  );

  return (
    <div className="rounded-lg border border-border bg-bg-primary/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-text-secondary">
            Model Assumptions & Parameters
          </h3>
          {hasChanges && (
            <span className="px-1.5 py-0.5 text-[9px] rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Modified
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-text-tertiary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-tertiary" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50">
          <p className="text-[10px] text-text-tertiary mt-3 mb-4">
            These parameters convert US-only data to global estimates. Adjust to test sensitivity. Changes apply client-side only and do not modify stored data.
          </p>

          <div className="space-y-3">
            {ASSUMPTIONS.map((a) => (
              <div key={a.key} className="grid grid-cols-[1fr_auto] gap-3 items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-text-primary font-medium">
                      {a.label}
                    </label>
                  </div>
                  <p className="text-[10px] text-text-tertiary mt-0.5 leading-relaxed">
                    {a.rationale}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] text-text-quaternary">Source:</span>
                    {a.sourceUrl ? (
                      <a
                        href={a.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                      >
                        {a.source}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <span className="text-[9px] text-text-quaternary">{a.source}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={a.key === "globalTotalGrowthRate" ? (params[a.key] * 100).toFixed(1) : params[a.key]}
                    onChange={(e) => {
                      let val = parseFloat(e.target.value);
                      if (isNaN(val)) return;
                      if (a.key === "globalTotalGrowthRate") val = val / 100;
                      onChange({ ...params, [a.key]: val });
                    }}
                    step={a.key === "globalTotalGrowthRate" ? 0.5 : a.step}
                    min={a.key === "globalTotalGrowthRate" ? a.min * 100 : a.min}
                    max={a.key === "globalTotalGrowthRate" ? a.max * 100 : a.max}
                    className="w-20 px-2 py-1 text-xs font-mono text-right bg-surface border border-border rounded text-text-primary focus:border-accent-warm/50 focus:outline-none"
                  />
                  <span className="text-[10px] text-text-tertiary w-12">
                    {a.key === "globalTotalGrowthRate" ? "%/yr" : a.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {hasChanges && (
            <button
              onClick={() => onChange({ ...DEFAULT_ASSUMPTIONS })}
              className="mt-4 px-3 py-1.5 text-[11px] rounded border border-border text-text-tertiary hover:text-text-primary hover:border-border/80 transition-colors"
            >
              Reset to defaults
            </button>
          )}
        </div>
      )}
    </div>
  );
}
