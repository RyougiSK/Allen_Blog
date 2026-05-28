"use client";

import { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";

const TIMEFRAMES = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
  { label: "3Y", days: 365 * 3 },
  { label: "5Y", days: 365 * 5 },
  { label: "All", days: 0 },
] as const;

interface SeriesConfig {
  key: string;
  label: string;
  color: string;
  unit: "B" | "T";
  benchmarks: { value: number; label: string; color: string }[];
  description: string;
}

const SERIES_OPTIONS: SeriesConfig[] = [
  {
    key: "rrp",
    label: "ON RRP",
    color: "#C9B79C",
    unit: "B",
    benchmarks: [
      { value: 200, label: "Warning $200B", color: "rgba(251, 191, 36, 0.6)" },
      { value: 100, label: "Critical $100B", color: "rgba(239, 68, 68, 0.7)" },
    ],
    description: "Overnight Reverse Repo — excess liquidity buffer. Below $100B signals scarcity (Sept 2019 repo spike).",
  },
  {
    key: "reserves",
    label: "Bank Reserves",
    color: "rgba(99, 102, 241, 0.85)",
    unit: "B",
    benchmarks: [
      { value: 3000, label: "Caution $3.0T", color: "rgba(251, 191, 36, 0.6)" },
      { value: 2500, label: "LCLoR $2.5T", color: "rgba(239, 68, 68, 0.7)" },
    ],
    description: "Aggregate bank reserves at the Fed. Below $2.5T is the Lowest Comfortable Level (LCLoR).",
  },
  {
    key: "tga",
    label: "Treasury General Account",
    color: "rgba(251, 191, 36, 0.85)",
    unit: "B",
    benchmarks: [
      { value: 800, label: "Drain Risk $800B", color: "rgba(251, 191, 36, 0.6)" },
      { value: 900, label: "High Drain $900B", color: "rgba(239, 68, 68, 0.7)" },
    ],
    description: "Treasury cash balance. High TGA rapidly drains reserves (tax season, debt ceiling rebuilds).",
  },
  {
    key: "fed_assets",
    label: "Fed Total Assets",
    color: "rgba(148, 163, 184, 0.7)",
    unit: "B",
    benchmarks: [],
    description: "Federal Reserve balance sheet size. Directional indicator — QT pace matters more than level.",
  },
];

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
  const [timeframe, setTimeframe] = useState<string>("3Y");
  const [activeSeries, setActiveSeries] = useState<string>("rrp");

  const dataMap: Record<string, (number | null)[]> = { rrp, reserves, tga, fed_assets };
  const config = SERIES_OPTIONS.find((s) => s.key === activeSeries)!;
  const seriesData = dataMap[activeSeries];

  const filtered = useMemo(() => {
    if (dates.length === 0) return { dates: [] as string[], values: [] as (number | null)[] };
    const selected = TIMEFRAMES.find((t) => t.label === timeframe);
    if (!selected || selected.days === 0) return { dates, values: seriesData };

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - selected.days);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    const startIdx = dates.findIndex((d) => d >= cutoffStr);
    if (startIdx === -1) return { dates: [] as string[], values: [] as (number | null)[] };

    return {
      dates: dates.slice(startIdx),
      values: seriesData.slice(startIdx),
    };
  }, [dates, seriesData, timeframe]);

  if (dates.length === 0) return null;

  const option = {
    backgroundColor: "transparent",
    grid: { top: 30, right: 30, bottom: 40, left: 60 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(18, 18, 18, 0.95)",
      borderColor: "rgba(255,255,255,0.1)",
      textStyle: { color: "#e0e0e0", fontSize: 11 },
      axisPointer: { lineStyle: { color: "rgba(201, 183, 156, 0.3)" } },
      formatter: (params: { value: number | null; axisValue: string }[]) => {
        const p = params[0];
        if (!p || p.value == null) return "";
        const v = p.value;
        const formatted = v >= 1000 ? `$${(v / 1000).toFixed(2)}T` : `$${v.toFixed(0)}B`;
        return `<span style="font-weight:600;color:${config.color}">${formatted}</span><br/><span style="color:#999;font-size:10px">${p.axisValue}</span>`;
      },
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
      axisLabel: {
        color: "#999",
        fontSize: 10,
        formatter: (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}T` : `$${v.toFixed(0)}B`,
      },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
    },
    series: [
      {
        name: config.label,
        type: "line",
        data: filtered.values,
        symbol: "none",
        lineStyle: { width: 2, color: config.color },
        itemStyle: { color: config.color },
        areaStyle: { color: config.color.replace(/[\d.]+\)$/, "0.08)") },
        connectNulls: true,
        markLine: config.benchmarks.length > 0
          ? {
              silent: true,
              symbol: "none",
              lineStyle: { type: "dashed", width: 1 },
              label: { fontSize: 9, position: "insideEndTop" },
              data: config.benchmarks.map((b) => ({
                yAxis: b.value,
                lineStyle: { color: b.color },
                label: { formatter: b.label, color: b.color },
              })),
            }
          : undefined,
      },
    ],
  };

  return (
    <div className="w-full rounded-lg border border-border bg-bg-primary/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-1">
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
        <select
          value={activeSeries}
          onChange={(e) => setActiveSeries(e.target.value)}
          className="text-[11px] bg-surface/50 border border-border rounded px-2 py-1 text-text-secondary outline-none focus:border-accent-living/50"
        >
          {SERIES_OPTIONS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <ReactECharts
        option={option}
        style={{ height: "320px", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
      <div className="px-4 pb-3">
        <p className="text-[10px] text-text-quaternary">{config.description}</p>
      </div>
    </div>
  );
}
