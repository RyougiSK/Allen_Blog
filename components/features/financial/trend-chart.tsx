"use client";

import { useState } from "react";
import ReactECharts from "echarts-for-react";
import type { TrendPoint } from "@/lib/types/financial";

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const [scale, setScale] = useState<"log" | "linear">("log");

  if (data.length === 0) return null;

  const dates = data.map((d) => d.date);

  const option = {
    backgroundColor: "transparent",
    grid: {
      top: 30,
      right: 70,
      bottom: 50,
      left: 70,
    },
    legend: {
      show: true,
      top: 4,
      right: 70,
      textStyle: { color: "#999", fontSize: 10 },
      itemWidth: 16,
      itemHeight: 2,
      data: ["Price", "Trend", "+2σ", "+1σ", "-1σ", "-2σ"],
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(18, 18, 18, 0.95)",
      borderColor: "rgba(255,255,255,0.1)",
      textStyle: { color: "#e0e0e0", fontSize: 11 },
      axisPointer: { lineStyle: { color: "rgba(201, 183, 156, 0.3)" } },
      formatter: (params: Array<{ dataIndex: number }>) => {
        const idx = params[0]?.dataIndex;
        if (idx == null) return "";
        const d = data[idx];
        const devPct = ((d.actual - d.trend) / d.trend) * 100;
        return `
          <div style="font-size:11px;line-height:1.6">
            <div style="margin-bottom:4px;font-weight:600;color:#C9B79C">${d.date}</div>
            <div>Price: <b style="color:#C9B79C">${d.actual.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></div>
            <div>Trend: ${d.trend.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <div>Deviation: <span style="color:${devPct > 0 ? "#f87171" : "#4ade80"}">${devPct > 0 ? "+" : ""}${devPct.toFixed(1)}%</span></div>
            <div style="color:#888;margin-top:4px;font-size:10px">+2σ: ${d.upper2.toLocaleString(undefined, { maximumFractionDigits: 0 })} &nbsp; +1σ: ${d.upper1.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div style="color:#888;font-size:10px">−1σ: ${d.lower1.toLocaleString(undefined, { maximumFractionDigits: 0 })} &nbsp; −2σ: ${d.lower2.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        `;
      },
    },
    xAxis: {
      type: "category",
      data: dates,
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } },
      axisLabel: { color: "#999", fontSize: 10, showMinLabel: true, showMaxLabel: true },
      axisTick: { show: false },
    },
    yAxis: {
      type: scale === "log" ? "log" : "value",
      axisLine: { show: false },
      axisLabel: { color: "#999", fontSize: 10 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
    },
    series: [
      {
        name: "+2σ",
        type: "line",
        data: data.map((d) => d.upper2),
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(239, 68, 68, 0.6)", type: "dotted" },
        silent: true,
        z: 2,
      },
      {
        name: "+1σ",
        type: "line",
        data: data.map((d) => d.upper1),
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(251, 191, 36, 0.5)", type: "dashed" },
        silent: true,
        z: 2,
      },
      {
        name: "-1σ",
        type: "line",
        data: data.map((d) => d.lower1),
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(74, 222, 128, 0.5)", type: "dashed" },
        silent: true,
        z: 2,
      },
      {
        name: "-2σ",
        type: "line",
        data: data.map((d) => d.lower2),
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(34, 197, 94, 0.6)", type: "dotted" },
        silent: true,
        z: 2,
      },
      {
        name: "Trend",
        type: "line",
        data: data.map((d) => d.trend),
        symbol: "none",
        lineStyle: { width: 2, color: "rgba(201, 183, 156, 0.6)", type: "dashed" },
        silent: true,
        z: 3,
      },
      {
        name: "Price",
        type: "line",
        data: data.map((d) => d.actual),
        symbol: "none",
        lineStyle: { width: 2.5, color: "#C9B79C" },
        z: 4,
      },
    ],
  };

  return (
    <div className="w-full rounded-lg border border-border bg-bg-primary/50 overflow-hidden">
      <div className="flex items-center gap-1 px-4 pt-3">
        {(["log", "linear"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScale(s)}
            className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
              scale === s
                ? "bg-accent-living/20 text-accent-living border border-accent-living/30"
                : "text-text-tertiary hover:text-text-secondary hover:bg-surface/50"
            }`}
          >
            {s === "log" ? "Log" : "Linear"}
          </button>
        ))}
      </div>
      <ReactECharts
        option={option}
        style={{ height: "420px", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
