"use client";

import ReactECharts from "echarts-for-react";

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
  if (dates.length === 0) return null;

  const option = {
    backgroundColor: "transparent",
    grid: { top: 40, right: 30, bottom: 50, left: 50 },
    legend: {
      show: true,
      top: 8,
      right: 30,
      textStyle: { color: "#999", fontSize: 10 },
      data: ["2Y", "10Y", "30Y"],
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
        name: "2Y",
        type: "line",
        data: short,
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(251, 191, 36, 0.8)" },
        connectNulls: true,
      },
      {
        name: "10Y",
        type: "line",
        data: mid,
        symbol: "none",
        lineStyle: { width: 2, color: "#C9B79C" },
        connectNulls: true,
      },
      {
        name: "30Y",
        type: "line",
        data: long,
        symbol: "none",
        lineStyle: { width: 1.5, color: "rgba(239, 68, 68, 0.7)" },
        connectNulls: true,
      },
    ],
  };

  return (
    <div className="w-full rounded-lg border border-border bg-bg-primary/50 overflow-hidden">
      <ReactECharts
        option={option}
        style={{ height: "360px", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
