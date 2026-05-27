"use client";

import ReactECharts from "echarts-for-react";
import type { TreasuryRate } from "@/lib/types/financial";

const MATURITY_ORDER = ["3m", "1y", "2y", "5y", "10y", "30y"];
const MATURITY_LABELS = ["3M", "1Y", "2Y", "5Y", "10Y", "30Y"];

function toSeries(rates: TreasuryRate[]): (number | null)[] {
  return MATURITY_ORDER.map((m) => {
    const r = rates.find((x) => x.maturity === m);
    return r ? r.rate : null;
  });
}

export function YieldCurveChart({
  current,
  oneYearAgo,
  fiveYearsAgo,
}: {
  current: TreasuryRate[];
  oneYearAgo: TreasuryRate[];
  fiveYearsAgo: TreasuryRate[];
}) {
  const option = {
    backgroundColor: "transparent",
    grid: { top: 40, right: 30, bottom: 40, left: 50 },
    legend: {
      show: true,
      top: 8,
      right: 30,
      textStyle: { color: "#999", fontSize: 10 },
      data: ["Current", "1 Year Ago", "5 Years Ago"],
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(18, 18, 18, 0.95)",
      borderColor: "rgba(255,255,255,0.1)",
      textStyle: { color: "#e0e0e0", fontSize: 11 },
    },
    xAxis: {
      type: "category",
      data: MATURITY_LABELS,
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } },
      axisLabel: { color: "#999", fontSize: 11 },
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
        name: "Current",
        type: "line",
        data: toSeries(current),
        lineStyle: { width: 3, color: "#C9B79C" },
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#C9B79C" },
      },
      {
        name: "1 Year Ago",
        type: "line",
        data: toSeries(oneYearAgo),
        lineStyle: { width: 2, color: "rgba(251, 191, 36, 0.6)", type: "dashed" },
        symbol: "circle",
        symbolSize: 5,
        itemStyle: { color: "rgba(251, 191, 36, 0.6)" },
      },
      {
        name: "5 Years Ago",
        type: "line",
        data: toSeries(fiveYearsAgo),
        lineStyle: { width: 2, color: "rgba(148, 163, 184, 0.5)", type: "dotted" },
        symbol: "circle",
        symbolSize: 5,
        itemStyle: { color: "rgba(148, 163, 184, 0.5)" },
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
