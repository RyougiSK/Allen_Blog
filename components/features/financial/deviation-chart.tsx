"use client";

import ReactECharts from "echarts-for-react";
import type { DeviationPoint } from "@/lib/types/financial";

export function DeviationChart({ data }: { data: DeviationPoint[] }) {
  if (data.length === 0) return null;

  const dates = data.map((d) => d.date);

  const option = {
    backgroundColor: "transparent",
    grid: {
      top: 20,
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
        const sigmaColor = d.deviation_sigma > 1 ? "#f87171" : d.deviation_sigma < -1 ? "#4ade80" : "#fbbf24";
        return `
          <div style="font-size:11px;line-height:1.6">
            <div style="margin-bottom:4px;font-weight:600;color:#C9B79C">${d.date}</div>
            <div>Sigma: <b style="color:${sigmaColor}">${d.deviation_sigma > 0 ? "+" : ""}${d.deviation_sigma.toFixed(2)}σ</b></div>
            <div>Deviation: ${d.deviation_pct > 0 ? "+" : ""}${d.deviation_pct.toFixed(1)}%</div>
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
      type: "value",
      axisLine: { show: false },
      axisLabel: {
        color: "#999",
        fontSize: 10,
        formatter: (v: number) => `${v}σ`,
      },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
    },
    series: [
      {
        name: "+2σ",
        type: "line",
        data: dates.map(() => 2),
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(239, 68, 68, 0.6)", type: "dotted" },
        silent: true,
      },
      {
        name: "+1σ",
        type: "line",
        data: dates.map(() => 1),
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(251, 191, 36, 0.5)", type: "dashed" },
        silent: true,
      },
      {
        name: "Mean",
        type: "line",
        data: dates.map(() => 0),
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(201, 183, 156, 0.5)" },
        silent: true,
      },
      {
        name: "-1σ",
        type: "line",
        data: dates.map(() => -1),
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(74, 222, 128, 0.5)", type: "dashed" },
        silent: true,
      },
      {
        name: "-2σ",
        type: "line",
        data: dates.map(() => -2),
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(34, 197, 94, 0.6)", type: "dotted" },
        silent: true,
      },
      {
        name: "Deviation",
        type: "line",
        data: data.map((d) => d.deviation_sigma),
        symbol: "none",
        lineStyle: { width: 2, color: "#C9B79C" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(239, 68, 68, 0.18)" },
              { offset: 0.5, color: "rgba(201, 183, 156, 0.04)" },
              { offset: 1, color: "rgba(34, 197, 94, 0.18)" },
            ],
          },
          origin: 0,
        },
      },
    ],
  };

  return (
    <div className="w-full rounded-lg border border-border bg-bg-primary/50 overflow-hidden">
      <ReactECharts
        option={option}
        style={{ height: "260px", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
