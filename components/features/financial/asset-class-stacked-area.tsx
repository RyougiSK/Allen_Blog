"use client";

import { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Loader2 } from "lucide-react";
import type { AssetClassTimeSeriesPoint } from "@/lib/types/financial";

const TIMEFRAMES = [
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
  { label: "10Y", value: "10y" },
  { label: "All", value: "all" },
] as const;

const SERIES_CONFIG: Array<{ slug: string; name: string; color: string }> = [
  { slug: "real_estate", name: "Real Estate", color: "#8B5CF6" },
  { slug: "global_bonds", name: "Bonds", color: "#6366F1" },
  { slug: "global_equities", name: "Equities", color: "#C9B79C" },
  { slug: "gold", name: "Gold", color: "#EAB308" },
  { slug: "derivatives", name: "Derivatives", color: "#14B8A6" },
  { slug: "crypto", name: "Crypto", color: "#F59E0B" },
  { slug: "other", name: "Other", color: "#525252" },
];

export function AssetClassStackedArea({
  data,
  onTimeframeChange,
  activeTimeframe = "all",
  showOther = true,
  loading = false,
}: {
  data: AssetClassTimeSeriesPoint[];
  onTimeframeChange: (tf: "1y" | "5y" | "10y" | "all") => void;
  activeTimeframe?: string;
  showOther?: boolean;
  loading?: boolean;
}) {
  const [logScale, setLogScale] = useState(false);

  const chartData = useMemo(() => {
    if (data.length === 0) return { dates: [], series: [] };

    const configs = showOther ? SERIES_CONFIG : SERIES_CONFIG.filter((c) => c.slug !== "other");
    const dates = data.map((d) => d.date);
    const series = configs.map((cfg) => ({
      ...cfg,
      data: data.map((d) => d.values[cfg.slug] ?? null),
    }));

    return { dates, series };
  }, [data, showOther]);

  if (data.length === 0 && !loading) {
    return (
      <div className="w-full rounded-lg border border-border bg-bg-primary/50 p-8 text-center text-text-tertiary text-sm">
        No asset class data available. Run the ETL pipeline to populate.
      </div>
    );
  }

  const option = {
    backgroundColor: "transparent",
    grid: { top: 40, right: 30, bottom: 40, left: 70 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(18, 18, 18, 0.95)",
      borderColor: "rgba(255,255,255,0.1)",
      textStyle: { color: "#e0e0e0", fontSize: 11 },
      axisPointer: { lineStyle: { color: "rgba(201, 183, 156, 0.3)" } },
      formatter: (params: Array<{ seriesName: string; value: number | null; color: string }>) => {
        const date = params[0] && "axisValue" in params[0] ? (params[0] as unknown as { axisValue: string }).axisValue : "";
        let total = 0;
        const lines = params
          .filter((p) => p.value != null)
          .map((p) => {
            total += p.value!;
            return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: <b>$${p.value!.toFixed(1)}T</b>`;
          });
        lines.push(`<br/><span style="color:#999">Total: <b>$${total.toFixed(0)}T</b></span>`);
        return `<div style="font-size:11px"><div style="color:#999;margin-bottom:4px">${date}</div>${lines.join("<br/>")}</div>`;
      },
    },
    legend: {
      show: true,
      bottom: 4,
      textStyle: { color: "#999", fontSize: 10 },
      itemWidth: 12,
      itemHeight: 8,
      icon: "roundRect",
    },
    xAxis: {
      type: "category",
      data: chartData.dates,
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } },
      axisLabel: { color: "#999", fontSize: 10, showMinLabel: true, showMaxLabel: true },
      axisTick: { show: false },
    },
    yAxis: {
      type: logScale ? "log" : "value",
      axisLine: { show: false },
      axisLabel: {
        color: "#999",
        fontSize: 10,
        formatter: (v: number) => `$${v.toFixed(0)}T`,
      },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
    },
    series: chartData.series.map((s) => ({
      name: s.name,
      type: "line",
      stack: "total",
      data: s.data,
      symbol: "none",
      lineStyle: { width: 0 },
      areaStyle: { opacity: 0.75 },
      itemStyle: { color: s.color },
      connectNulls: true,
    })),
  };

  return (
    <div className="w-full rounded-lg border border-border bg-bg-primary/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3">
        <h3 className="text-sm font-medium text-text-secondary">
          Global Asset Classes — Stacked Market Cap ($T)
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogScale(!logScale)}
            className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
              logScale
                ? "border-accent-warm/40 text-accent-warm bg-accent-warm/10"
                : "border-border text-text-tertiary hover:text-text-secondary"
            }`}
          >
            Log
          </button>
          <div className="flex items-center gap-1">
            {TIMEFRAMES.map((t) => (
              <button
                key={t.value}
                onClick={() => onTimeframeChange(t.value)}
                className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                  activeTimeframe === t.value
                    ? "bg-accent-living/20 text-accent-living border border-accent-living/30"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-surface/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-primary/60 backdrop-blur-[1px]">
            <Loader2 className="h-5 w-5 text-text-tertiary animate-spin" />
          </div>
        )}
        <ReactECharts option={option} notMerge={true} style={{ height: 380 }} />
      </div>
    </div>
  );
}
