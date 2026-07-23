"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { AssetClassTimeSeriesPoint } from "@/lib/types/financial";

const SERIES_CONFIG: Array<{ slug: string; name: string; color: string }> = [
  { slug: "real_estate", name: "Real Estate", color: "#8B5CF6" },
  { slug: "global_bonds", name: "Bonds", color: "#6366F1" },
  { slug: "global_equities", name: "Equities", color: "#C9B79C" },
  { slug: "gold", name: "Gold", color: "#EAB308" },
  { slug: "derivatives", name: "Derivatives", color: "#14B8A6" },
  { slug: "crypto", name: "Crypto", color: "#F59E0B" },
  { slug: "other", name: "Other", color: "#525252" },
];

export function AssetClassPercentArea({
  data,
  showOther = true,
}: {
  data: AssetClassTimeSeriesPoint[];
  showOther?: boolean;
}) {
  const chartData = useMemo(() => {
    if (data.length === 0) return { dates: [], series: [] };

    const configs = showOther ? SERIES_CONFIG : SERIES_CONFIG.filter((c) => c.slug !== "other");
    const dates = data.map((d) => d.date);

    const series = configs.map((cfg) => ({
      ...cfg,
      data: data.map((d) => {
        const total = showOther
          ? Object.values(d.values).reduce<number>((sum, v) => sum + (v ?? 0), 0)
          : Object.entries(d.values).reduce<number>((sum, [k, v]) => k === "other" ? sum : sum + (v ?? 0), 0);
        if (total === 0) return null;
        return ((d.values[cfg.slug] ?? 0) / total) * 100;
      }),
    }));

    return { dates, series };
  }, [data, showOther]);

  if (data.length === 0) return null;

  const option = {
    backgroundColor: "transparent",
    grid: { top: 40, right: 30, bottom: 40, left: 60 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(18, 18, 18, 0.95)",
      borderColor: "rgba(255,255,255,0.1)",
      textStyle: { color: "#e0e0e0", fontSize: 11 },
      axisPointer: { lineStyle: { color: "rgba(201, 183, 156, 0.3)" } },
      formatter: (params: Array<{ seriesName: string; value: number | null; color: string }>) => {
        const date = params[0] && "axisValue" in params[0] ? (params[0] as unknown as { axisValue: string }).axisValue : "";
        const lines = params
          .filter((p) => p.value != null && p.value > 0.1)
          .map((p) =>
            `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: <b>${p.value!.toFixed(1)}%</b>`
          );
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
      type: "value",
      min: 0,
      max: 100,
      axisLine: { show: false },
      axisLabel: {
        color: "#999",
        fontSize: 10,
        formatter: (v: number) => `${v}%`,
      },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
    },
    series: chartData.series.map((s) => ({
      name: s.name,
      type: "line",
      stack: "percent",
      data: s.data,
      symbol: "none",
      lineStyle: { width: 0 },
      areaStyle: { opacity: 0.8 },
      itemStyle: { color: s.color },
      connectNulls: true,
    })),
  };

  return (
    <div className="w-full rounded-lg border border-border bg-bg-primary/50 overflow-hidden">
      <div className="px-4 pt-3">
        <h3 className="text-sm font-medium text-text-secondary">
          {showOther
            ? "% of Estimated Global Total (~$900T+)"
            : "% of Tracked Asset Classes"}
        </h3>
        <p className="text-[10px] text-text-tertiary mt-0.5">
          {showOther
            ? "Includes “Other” residual (private equity, deposits, insurance, etc.)"
            : "Relative share among the 6 tracked asset classes only"}
        </p>
      </div>
      <ReactECharts option={option} notMerge={true} style={{ height: 340 }} />
    </div>
  );
}
