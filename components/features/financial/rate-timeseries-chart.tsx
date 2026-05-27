"use client";

import { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";

const TIMEFRAMES = [
  { label: "1Y", years: 1 },
  { label: "3Y", years: 3 },
  { label: "5Y", years: 5 },
  { label: "10Y", years: 10 },
  { label: "30Y", years: 30 },
  { label: "All", years: 0 },
] as const;

const COLORS = {
  short: "rgba(251, 191, 36, 0.85)",
  mid: "#C9B79C",
  long: "rgba(239, 68, 68, 0.75)",
};

export function RateTimeseriesChart({
  dates,
  short,
  mid,
  long,
}: {
  dates: string[];
  short: (number | null)[];
  mid: (number | null)[];
  long: (number | null)[];
}) {
  const [timeframe, setTimeframe] = useState<string>("All");

  const filtered = useMemo(() => {
    if (dates.length === 0) return { dates: [], short: [], mid: [], long: [] };

    const selected = TIMEFRAMES.find((t) => t.label === timeframe);
    if (!selected || selected.years === 0) {
      return { dates, short, mid, long };
    }

    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - selected.years);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const startIdx = dates.findIndex((d) => d >= cutoffStr);
    if (startIdx === -1) return { dates: [], short: [], mid: [], long: [] };

    return {
      dates: dates.slice(startIdx),
      short: short.slice(startIdx),
      mid: mid.slice(startIdx),
      long: long.slice(startIdx),
    };
  }, [dates, short, mid, long, timeframe]);

  if (dates.length === 0) return null;

  const option = {
    backgroundColor: "transparent",
    grid: { top: 40, right: 30, bottom: 50, left: 50 },
    legend: {
      show: true,
      top: 8,
      right: 30,
      textStyle: { color: "#999", fontSize: 10 },
      data: [
        { name: "2Y", itemStyle: { color: COLORS.short } },
        { name: "10Y", itemStyle: { color: COLORS.mid } },
        { name: "30Y", itemStyle: { color: COLORS.long } },
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
      axisLabel: { color: "#999", fontSize: 10, formatter: "{value}%" },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
    },
    series: [
      {
        name: "2Y",
        type: "line",
        data: filtered.short,
        symbol: "none",
        lineStyle: { width: 1.5, color: COLORS.short },
        itemStyle: { color: COLORS.short },
        connectNulls: true,
      },
      {
        name: "10Y",
        type: "line",
        data: filtered.mid,
        symbol: "none",
        lineStyle: { width: 2, color: COLORS.mid },
        itemStyle: { color: COLORS.mid },
        connectNulls: true,
      },
      {
        name: "30Y",
        type: "line",
        data: filtered.long,
        symbol: "none",
        lineStyle: { width: 1.5, color: COLORS.long },
        itemStyle: { color: COLORS.long },
        connectNulls: true,
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
