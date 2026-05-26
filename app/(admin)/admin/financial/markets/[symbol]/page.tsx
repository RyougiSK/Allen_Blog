"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getIndexAnalysis } from "@/lib/actions/financial";
import type { AdjustmentType, MeanReversionAnalysis, MarketIndex } from "@/lib/types/financial";
import { TrendChart } from "@/components/features/financial/trend-chart";
import { DeviationChart } from "@/components/features/financial/deviation-chart";
import { AdjustmentToggle } from "@/components/features/financial/adjustment-toggle";
import { ValuationBadge } from "@/components/features/financial/valuation-badge";

type AnalysisData = MeanReversionAnalysis & { index: MarketIndex };

export default function MarketDetailPage() {
  const params = useParams<{ symbol: string }>();
  const symbol = params.symbol;

  const [adjustment, setAdjustment] = useState<AdjustmentType>("nominal");
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getIndexAnalysis(symbol, adjustment).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [symbol, adjustment]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-sm text-text-tertiary animate-pulse">Loading analysis...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-text-tertiary text-sm">
          No analysis data found for {symbol}. Ensure the ETL pipeline has been run.
        </p>
        <Link
          href="/admin/financial/markets"
          className="text-sm text-accent-warm hover:underline mt-2 inline-block"
        >
          Back to Markets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Adjustment Toggle (sticky) */}
      <div className="sticky top-0 z-10 -mx-8 px-8 py-3 bg-bg-primary/90 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <nav className="flex items-center gap-1.5 text-sm">
            <Link
              href="/admin/financial"
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              Financial
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-text-quaternary" />
            <Link
              href="/admin/financial/markets"
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              Markets
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-text-quaternary" />
            <span className="text-text-primary font-medium">{data.index.name}</span>
          </nav>
          <AdjustmentToggle value={adjustment} onChange={setAdjustment} />
        </div>
      </div>

      {/* Index header */}
      <div>
        <h2 className="text-xl font-display text-text-primary">
          {data.index.name}
        </h2>
        <p className="text-sm text-text-tertiary mt-0.5">
          {data.index.yahoo_symbol} — {data.data_points.toLocaleString()} data points since {data.data_start}
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Current Price"
          value={data.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        />
        <MetricCard
          label="Trend Value"
          value={data.trend_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        />
        <MetricCard
          label="Deviation"
          value={`${data.deviation_pct > 0 ? "+" : ""}${data.deviation_pct.toFixed(1)}%`}
          color={data.deviation_pct > 0 ? "red" : "green"}
        />
        <MetricCard
          label="Sigma"
          value={`${data.deviation_sigma > 0 ? "+" : ""}${data.deviation_sigma.toFixed(2)}σ`}
          color={data.deviation_sigma > 0 ? "red" : "green"}
          badge={<ValuationBadge zone={data.valuation_zone} />}
        />
      </div>

      {/* Trend chart */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3">
          Price vs Exponential Trend
        </h3>
        {data.price_series && data.price_series.length > 0 ? (
          <TrendChart data={data.price_series} />
        ) : (
          <div className="h-[420px] flex items-center justify-center border border-border rounded-lg">
            <p className="text-sm text-text-quaternary">No chart data available</p>
          </div>
        )}
      </div>

      {/* Deviation chart */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3">
          Standard Deviation from Mean
        </h3>
        {data.deviation_series && data.deviation_series.length > 0 ? (
          <DeviationChart data={data.deviation_series} />
        ) : (
          <div className="h-[260px] flex items-center justify-center border border-border rounded-lg">
            <p className="text-sm text-text-quaternary">No deviation data available</p>
          </div>
        )}
      </div>

      {/* Model info */}
      <div className="p-5 rounded-lg border border-border bg-surface/30">
        <h3 className="text-sm font-medium text-text-secondary mb-3">
          Regression Parameters
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-text-quaternary">R²</span>
            <div className="text-text-primary font-mono mt-0.5">{data.r_squared.toFixed(4)}</div>
          </div>
          <div>
            <span className="text-text-quaternary">Std Dev (σ)</span>
            <div className="text-text-primary font-mono mt-0.5">{data.std_deviation.toFixed(4)}</div>
          </div>
          <div>
            <span className="text-text-quaternary">Coefficient a</span>
            <div className="text-text-primary font-mono mt-0.5">{data.reg_a.toExponential(4)}</div>
          </div>
          <div>
            <span className="text-text-quaternary">Growth rate b</span>
            <div className="text-text-primary font-mono mt-0.5">{data.reg_b.toExponential(4)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  badge,
}: {
  label: string;
  value: string;
  color?: "red" | "green";
  badge?: React.ReactNode;
}) {
  const colorClass =
    color === "red"
      ? "text-red-400"
      : color === "green"
        ? "text-green-400"
        : "text-text-primary";

  return (
    <div className="p-3 rounded-lg border border-border bg-surface/30">
      <div className="text-[10px] text-text-quaternary uppercase tracking-wide">
        {label}
      </div>
      <div className={`text-lg font-mono mt-1 ${colorClass}`}>{value}</div>
      {badge && <div className="mt-1.5">{badge}</div>}
    </div>
  );
}
