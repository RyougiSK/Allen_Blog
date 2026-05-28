"use client";

import { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";

const TIMEFRAMES = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
  { label: "3Y", days: 365 * 3 },
  { label: "All", days: 0 },
] as const;

export function LiquidityRatesChart({
  dates,
  sofr,
  effr,
  iorb,
  fed_upper,
  fed_lower,
  obfr,
}: {
  dates: string[];
  sofr: (number | null)[];
  effr: (number | null)[];
  iorb: (number | null)[];
  fed_upper: (number | null)[];
  fed_lower: (number | null)[];
  obfr: (number | null)[];
}) {
  const [timeframe, setTimeframe] = useState<string>("1M");

  const filtered = useMemo(() => {
    if (dates.length === 0) return { dates: [], sofr: [], effr: [], iorb: [], fed_upper: [], fed_lower: [], obfr: [] };
    const selected = TIMEFRAMES.find((t) => t.label === timeframe);
    if (!selected || selected.days === 0) return { dates, sofr, effr, iorb, fed_upper, fed_lower, obfr };

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - selected.days);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    const startIdx = dates.findIndex((d) => d >= cutoffStr);
    if (startIdx === -1) return { dates: [], sofr: [], effr: [], iorb: [], fed_upper: [], fed_lower: [], obfr: [] };

    return {
      dates: dates.slice(startIdx),
      sofr: sofr.slice(startIdx),
      effr: effr.slice(startIdx),
      iorb: iorb.slice(startIdx),
      fed_upper: fed_upper.slice(startIdx),
      fed_lower: fed_lower.slice(startIdx),
      obfr: obfr.slice(startIdx),
    };
  }, [dates, sofr, effr, iorb, fed_upper, fed_lower, obfr, timeframe]);

  const { yMin, yMax } = useMemo(() => {
    const allVals = [
      ...filtered.sofr,
      ...filtered.effr,
      ...filtered.iorb,
      ...filtered.fed_upper,
      ...filtered.fed_lower,
      ...filtered.obfr,
    ].filter((v): v is number => v != null);
    if (allVals.length === 0) return { yMin: 0, yMax: 6 };
    const min = Math.min(...allVals);
    const max = Math.max(...allVals);
    const padding = Math.max((max - min) * 0.15, 0.1);
    return {
      yMin: Math.floor((min - padding) * 20) / 20,
      yMax: Math.ceil((max + padding) * 20) / 20,
    };
  }, [filtered]);

  const stressAreas = useMemo(() => {
    const areas: [{ xAxis: string; itemStyle: { color: string } }, { xAxis: string }][] = [];
    let inStress = false;
    let stressStart = "";

    for (let i = 0; i < filtered.dates.length; i++) {
      const s = filtered.sofr[i];
      const ir = filtered.iorb[i];
      const fu = filtered.fed_upper[i];
      const e = filtered.effr[i];

      const isStress =
        (s != null && ir != null && s > ir) ||
        (s != null && fu != null && s > fu) ||
        (e != null && s != null && Math.abs(e - s) > 0.05);

      if (isStress && !inStress) {
        stressStart = filtered.dates[i];
        inStress = true;
      } else if (!isStress && inStress) {
        areas.push([
          { xAxis: stressStart, itemStyle: { color: "rgba(239, 68, 68, 0.1)" } },
          { xAxis: filtered.dates[i - 1] },
        ]);
        inStress = false;
      }
    }
    if (inStress) {
      areas.push([
        { xAxis: stressStart, itemStyle: { color: "rgba(239, 68, 68, 0.1)" } },
        { xAxis: filtered.dates[filtered.dates.length - 1] },
      ]);
    }
    return areas;
  }, [filtered]);

  if (dates.length === 0) return null;

  const option = {
    backgroundColor: "transparent",
    grid: { top: 50, right: 30, bottom: 50, left: 50 },
    legend: {
      show: true,
      top: 8,
      right: 30,
      textStyle: { color: "#999", fontSize: 10 },
      data: [
        { name: "SOFR", itemStyle: { color: "#C9B79C" } },
        { name: "EFFR", itemStyle: { color: "rgba(251, 191, 36, 0.85)" } },
        { name: "IORB", itemStyle: { color: "rgba(99, 102, 241, 0.85)" } },
        { name: "OBFR", itemStyle: { color: "rgba(148, 163, 184, 0.7)" } },
        { name: "Fed Band", itemStyle: { color: "rgba(239, 68, 68, 0.3)" } },
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
      min: yMin,
      max: yMax,
      axisLine: { show: false },
      axisLabel: { color: "#999", fontSize: 10, formatter: "{value}%" },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
    },
    series: [
      {
        name: "Fed Band",
        type: "line",
        data: filtered.fed_upper,
        symbol: "none",
        lineStyle: { width: 0 },
        areaStyle: { color: "rgba(239, 68, 68, 0.08)", origin: "start" },
        stack: "band",
        connectNulls: true,
        silent: true,
        z: 1,
      },
      {
        name: "Fed Lower",
        type: "line",
        data: filtered.fed_lower,
        symbol: "none",
        lineStyle: { width: 1, color: "rgba(239, 68, 68, 0.3)", type: "dashed" },
        connectNulls: true,
        silent: true,
        z: 1,
      },
      {
        name: "Fed Upper",
        type: "line",
        data: filtered.fed_upper,
        symbol: "none",
        lineStyle: { width: 1, color: "rgba(239, 68, 68, 0.3)", type: "dashed" },
        connectNulls: true,
        silent: true,
        z: 1,
      },
      {
        name: "SOFR",
        type: "line",
        data: filtered.sofr,
        symbol: "none",
        lineStyle: { width: 2, color: "#C9B79C" },
        itemStyle: { color: "#C9B79C" },
        connectNulls: true,
        z: 4,
        markArea: stressAreas.length > 0
          ? { silent: true, data: stressAreas }
          : undefined,
      },
      {
        name: "EFFR",
        type: "line",
        data: filtered.effr,
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(251, 191, 36, 0.85)" },
        itemStyle: { color: "rgba(251, 191, 36, 0.85)" },
        connectNulls: true,
        z: 3,
      },
      {
        name: "IORB",
        type: "line",
        data: filtered.iorb,
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(99, 102, 241, 0.85)" },
        itemStyle: { color: "rgba(99, 102, 241, 0.85)" },
        connectNulls: true,
        z: 3,
      },
      {
        name: "OBFR",
        type: "line",
        data: filtered.obfr,
        symbol: "none",
        lineStyle: { width: 1, color: "rgba(148, 163, 184, 0.7)" },
        itemStyle: { color: "rgba(148, 163, 184, 0.7)" },
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
