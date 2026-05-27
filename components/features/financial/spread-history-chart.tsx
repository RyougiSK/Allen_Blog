"use client";

import ReactECharts from "echarts-for-react";
import type { TreasuryRate } from "@/lib/types/financial";

export function SpreadHistoryChart({
  data,
  label,
}: {
  data: TreasuryRate[];
  label: string;
}) {
  if (data.length === 0) return null;

  const dates = data.map((d) => d.date);
  const values = data.map((d) => d.rate);

  const option = {
    backgroundColor: "transparent",
    grid: { top: 20, right: 30, bottom: 50, left: 60 },
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
        const color = d.rate < 0 ? "#f87171" : "#4ade80";
        return `
          <div style="font-size:11px;line-height:1.6">
            <div style="font-weight:600;color:#C9B79C">${d.date}</div>
            <div>${label}: <b style="color:${color}">${d.rate > 0 ? "+" : ""}${d.rate.toFixed(2)}%</b></div>
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
      axisLabel: { color: "#999", fontSize: 10, formatter: "{value}%" },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
    },
    series: [
      {
        name: label,
        type: "line",
        data: values,
        symbol: "none",
        lineStyle: { width: 1.5, color: "#C9B79C" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(74, 222, 128, 0.15)" },
              { offset: 0.5, color: "rgba(18, 18, 18, 0)" },
              { offset: 1, color: "rgba(239, 68, 68, 0.15)" },
            ],
          },
          origin: 0,
        },
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: { color: "rgba(201, 183, 156, 0.5)", width: 1.5 },
          data: [{ yAxis: 0 }],
          label: { show: false },
        },
      },
    ],
  };

  return (
    <div className="w-full rounded-lg border border-border bg-bg-primary/50 overflow-hidden">
      <ReactECharts
        option={option}
        style={{ height: "300px", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
