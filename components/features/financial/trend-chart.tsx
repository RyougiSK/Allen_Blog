"use client";

import ReactECharts from "echarts-for-react";
import type { TrendPoint } from "@/lib/types/financial";

export function TrendChart({ data }: { data: TrendPoint[] }) {
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
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisLabel: { color: "#666", fontSize: 10, showMinLabel: true, showMaxLabel: true },
      axisTick: { show: false },
    },
    yAxis: {
      type: "log",
      axisLine: { show: false },
      axisLabel: { color: "#666", fontSize: 10 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    },
    series: [
      // Lower 2σ (base for green zone)
      {
        name: "-2σ base",
        type: "line",
        data: data.map((d) => d.lower2),
        symbol: "none",
        lineStyle: { width: 0 },
        areaStyle: { color: "transparent" },
        stack: "band",
        silent: true,
        z: 1,
      },
      // Fill from -2σ to -1σ (green zone)
      {
        name: "Undervalued",
        type: "line",
        data: data.map((d) => d.lower1 - d.lower2),
        symbol: "none",
        lineStyle: { width: 0 },
        areaStyle: { color: "rgba(34, 197, 94, 0.08)" },
        stack: "band",
        silent: true,
        z: 1,
      },
      // Fill from -1σ to +1σ (fair value zone)
      {
        name: "Fair Value",
        type: "line",
        data: data.map((d) => d.upper1 - d.lower1),
        symbol: "none",
        lineStyle: { width: 0 },
        areaStyle: { color: "rgba(251, 191, 36, 0.04)" },
        stack: "band",
        silent: true,
        z: 1,
      },
      // Fill from +1σ to +2σ (red zone)
      {
        name: "Overvalued",
        type: "line",
        data: data.map((d) => d.upper2 - d.upper1),
        symbol: "none",
        lineStyle: { width: 0 },
        areaStyle: { color: "rgba(239, 68, 68, 0.08)" },
        stack: "band",
        silent: true,
        z: 1,
      },
      // Band boundary lines (drawn on top of fills)
      {
        name: "+2σ",
        type: "line",
        data: data.map((d) => d.upper2),
        symbol: "none",
        lineStyle: { width: 1, color: "rgba(239, 68, 68, 0.25)", type: "dotted" },
        silent: true,
        z: 2,
      },
      {
        name: "+1σ",
        type: "line",
        data: data.map((d) => d.upper1),
        symbol: "none",
        lineStyle: { width: 1, color: "rgba(251, 191, 36, 0.25)", type: "dashed" },
        silent: true,
        z: 2,
      },
      {
        name: "-1σ",
        type: "line",
        data: data.map((d) => d.lower1),
        symbol: "none",
        lineStyle: { width: 1, color: "rgba(251, 191, 36, 0.25)", type: "dashed" },
        silent: true,
        z: 2,
      },
      {
        name: "-2σ",
        type: "line",
        data: data.map((d) => d.lower2),
        symbol: "none",
        lineStyle: { width: 1, color: "rgba(34, 197, 94, 0.25)", type: "dotted" },
        silent: true,
        z: 2,
      },
      // Trend line
      {
        name: "Trend",
        type: "line",
        data: data.map((d) => d.trend),
        symbol: "none",
        lineStyle: { width: 2, color: "rgba(201, 183, 156, 0.4)", type: "dashed" },
        silent: true,
        z: 3,
      },
      // Actual price (topmost)
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
      <ReactECharts
        option={option}
        style={{ height: "420px", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
