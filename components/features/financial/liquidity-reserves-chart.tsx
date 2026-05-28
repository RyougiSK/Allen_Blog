"use client";

import { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";

const TIMEFRAMES = [
  { label: "1Y", years: 1 },
  { label: "3Y", years: 3 },
  { label: "5Y", years: 5 },
  { label: "All", years: 0 },
] as const;

export function LiquidityReservesChart({
  dates,
  rrp,
  reserves,
  tga,
  fed_assets,
}: {
  dates: string[];
  rrp: (number | null)[];
  reserves: (number | null)[];
  tga: (number | null)[];
  fed_assets: (number | null)[];
}) {
  const [timeframe, setTimeframe] = useState<string>("5Y");

  const filtered = useMemo(() => {
    if (dates.length === 0) return { dates: [], rrp: [], reserves: [], tga: [], fed_assets: [] };
    const selected = TIMEFRAMES.find((t) => t.label === timeframe);
    if (!selected || selected.years === 0) return { dates, rrp, reserves, tga, fed_assets };

    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - selected.years);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    const startIdx = dates.findIndex((d) => d >= cutoffStr);
    if (startIdx === -1) return { dates: [], rrp: [], reserves: [], tga: [], fed_assets: [] };

    return {
      dates: dates.slice(startIdx),
      rrp: rrp.slice(startIdx),
      reserves: reserves.slice(startIdx),
      tga: tga.slice(startIdx),
      fed_assets: fed_assets.slice(startIdx),
    };
  }, [dates, rrp, reserves, tga, fed_assets, timeframe]);

  if (dates.length === 0) return null;

  const option = {
    backgroundColor: "transparent",
    grid: { top: 50, right: 30, bottom: 50, left: 60 },
    legend: {
      show: true,
      top: 8,
      right: 30,
      textStyle: { color: "#999", fontSize: 10 },
      data: [
        { name: "Fed Assets", itemStyle: { color: "rgba(148, 163, 184, 0.6)" } },
        { name: "Reserves", itemStyle: { color: "rgba(99, 102, 241, 0.8)" } },
        { name: "RRP", itemStyle: { color: "#C9B79C" } },
        { name: "TGA", itemStyle: { color: "rgba(251, 191, 36, 0.85)" } },
      ],
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(18, 18, 18, 0.95)",
      borderColor: "rgba(255,255,255,0.1)",
      textStyle: { color: "#e0e0e0", fontSize: 11 },
      axisPointer: { lineStyle: { color: "rgba(201, 183, 156, 0.3)" } },
    },
    xAxis: {
      type: "category",
      data: filtered.dates,
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } },
      axisLabel: { color: "#999", fontSize: 10, showMinLabel: true, showMaxLabel: true },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisLabel: { color: "#999", fontSize: 10, formatter: (v: number) => `$${v >= 1000 ? (v / 1000).toFixed(1) + "T" : v.toFixed(0) + "B"}` },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
    },
    series: [
      {
        name: "Fed Assets",
        type: "line",
        data: filtered.fed_assets,
        symbol: "none",
        lineStyle: { width: 2, color: "rgba(148, 163, 184, 0.6)" },
        itemStyle: { color: "rgba(148, 163, 184, 0.6)" },
        areaStyle: { color: "rgba(148, 163, 184, 0.05)" },
        connectNulls: true,
        z: 1,
      },
      {
        name: "Reserves",
        type: "line",
        data: filtered.reserves,
        symbol: "none",
        lineStyle: { width: 2, color: "rgba(99, 102, 241, 0.8)" },
        itemStyle: { color: "rgba(99, 102, 241, 0.8)" },
        connectNulls: true,
        z: 3,
      },
      {
        name: "RRP",
        type: "line",
        data: filtered.rrp,
        symbol: "none",
        lineStyle: { width: 2, color: "#C9B79C" },
        itemStyle: { color: "#C9B79C" },
        connectNulls: true,
        z: 4,
      },
      {
        name: "TGA",
        type: "line",
        data: filtered.tga,
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(251, 191, 36, 0.85)" },
        itemStyle: { color: "rgba(251, 191, 36, 0.85)" },
        connectNulls: true,
        z: 2,
      },
    ],
  };

  return (
    <div className="w-full rounded-lg border border-border bg-bg-primary/50 overflow-hidden">
      <div className="flex items-center gap-1 px-4 pt-3">
        {TIMEFRAMES.map((t) => (
          <button
            key={t.label}
            onClick={() => setTimeframe(t.label)}
            className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
              timeframe === t.label
                ? "bg-accent-living/20 text-accent-living border border-accent-living/30"
                : "text-text-tertiary hover:text-text-secondary hover:bg-surface/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ReactECharts
        option={option}
        style={{ height: "360px", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
