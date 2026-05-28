"use client";

import { useState, useEffect } from "react";
import { getLiquidityRates, getLiquidityReserves, getLiquidityLatest } from "@/lib/actions/financial";
import { LiquidityRatesChart } from "@/components/features/financial/liquidity-rates-chart";
import { LiquidityReservesChart } from "@/components/features/financial/liquidity-reserves-chart";

type RatesData = Awaited<ReturnType<typeof getLiquidityRates>>;
type ReservesData = Awaited<ReturnType<typeof getLiquidityReserves>>;

function StressBadge({ label, level }: { label: string; level: "green" | "amber" | "red" }) {
  const colors = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`px-2.5 py-1 text-[11px] font-medium rounded border ${colors[level]}`}>
      {label}
    </span>
  );
}

function computeStress(latest: Record<string, number | null>) {
  const badges: { label: string; level: "green" | "amber" | "red" }[] = [];

  const sofr = latest.sofr;
  const iorb = latest.iorb;
  const fedUpper = latest.fed_upper;
  const rrp = latest.rrp;

  if (sofr != null && iorb != null && sofr > iorb) {
    badges.push({ label: "Funding Stress: SOFR > IORB", level: "red" });
  }
  if (sofr != null && fedUpper != null && sofr > fedUpper) {
    badges.push({ label: "Rate Breach: SOFR > Target", level: "red" });
  }
  if (rrp != null && rrp < 100) {
    badges.push({ label: "RRP Depleting", level: "amber" });
  }

  if (badges.length === 0) {
    badges.push({ label: "Normal Conditions", level: "green" });
  }

  return badges;
}

export default function LiquidityPage() {
  const [rates, setRates] = useState<RatesData | null>(null);
  const [reserves, setReserves] = useState<ReservesData | null>(null);
  const [latest, setLatest] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getLiquidityRates(),
      getLiquidityReserves(),
      getLiquidityLatest(),
    ]).then(([r, res, lat]) => {
      setRates(r);
      setReserves(res);
      setLatest(lat);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-sm text-text-tertiary animate-pulse">Loading liquidity data...</div>
      </div>
    );
  }

  if (!rates || rates.dates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-tertiary text-sm">
          No liquidity data yet. Run the ETL pipeline from the Overview tab first.
        </p>
      </div>
    );
  }

  const badges = computeStress(latest);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-display text-text-primary">Liquidity Monitor</h2>
        <p className="text-sm text-text-tertiary mt-0.5">
          Shadow banking liquidity indicators — Pozsar framework
        </p>
      </div>

      {/* Stress badges */}
      <div className="flex flex-wrap items-center gap-2">
        {badges.map((b, i) => (
          <StressBadge key={i} label={b.label} level={b.level} />
        ))}
        {latest.sofr != null && (
          <span className="ml-auto text-xs text-text-quaternary font-mono">
            SOFR: {latest.sofr.toFixed(2)}% | EFFR: {latest.effr?.toFixed(2) ?? "—"}% | IORB: {latest.iorb?.toFixed(2) ?? "—"}%
          </span>
        )}
      </div>

      {/* Panel 1: Key Rates */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-text-secondary">Key Overnight Rates</h3>
          <p className="text-xs text-text-tertiary mt-0.5">
            SOFR, EFFR, IORB, OBFR with Fed Funds target band
          </p>
        </div>
        <LiquidityRatesChart
          dates={rates.dates}
          sofr={rates.sofr}
          effr={rates.effr}
          iorb={rates.iorb}
          fed_upper={rates.fed_upper}
          fed_lower={rates.fed_lower}
          obfr={rates.obfr}
        />
      </section>

      {/* Panel 2: Reserves & Balance Sheet */}
      {reserves && reserves.dates.length > 0 && (
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-text-secondary">Reserves & Balance Sheet</h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              Fed assets, bank reserves, ON RRP facility, Treasury General Account
            </p>
          </div>
          <LiquidityReservesChart
            dates={reserves.dates}
            rrp={reserves.rrp}
            reserves={reserves.reserves}
            tga={reserves.tga}
            fed_assets={reserves.fed_assets}
          />
        </section>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "RRP", value: latest.rrp, unit: "B" },
          { label: "Reserves", value: latest.reserves, unit: "B" },
          { label: "TGA", value: latest.tga, unit: "B" },
          { label: "Fed Assets", value: latest.fed_assets, unit: "B" },
        ].map((card) => (
          <div key={card.label} className="p-3 rounded-lg border border-border bg-surface/30">
            <div className="text-[10px] text-text-quaternary uppercase">{card.label}</div>
            <div className="text-lg font-mono text-text-primary mt-0.5">
              {card.value != null
                ? `$${card.value >= 1000 ? (card.value / 1000).toFixed(2) + "T" : card.value.toFixed(0) + card.unit}`
                : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
