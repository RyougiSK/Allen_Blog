import type { RegressionResult, ValuationZone } from "@/lib/types/financial";

/**
 * Exponential regression via log-linear OLS.
 * Fits y = a * e^(b*x) by solving ln(y) = ln(a) + b*x
 */
export function exponentialRegression(
  x: number[],
  y: number[]
): RegressionResult {
  const n = x.length;
  if (n < 2) throw new Error("Need at least 2 data points");

  const lnY = y.map((v) => Math.log(v));

  let sumX = 0;
  let sumLnY = 0;
  let sumXLnY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumLnY += lnY[i];
    sumXLnY += x[i] * lnY[i];
    sumX2 += x[i] * x[i];
  }

  const denominator = n * sumX2 - sumX * sumX;
  const bSlope = (n * sumXLnY - sumX * sumLnY) / denominator;
  const lnA = (sumLnY - bSlope * sumX) / n;
  const a = Math.exp(lnA);

  // R-squared calculation
  const meanLnY = sumLnY / n;
  let ssTot = 0;
  let ssRes = 0;

  for (let i = 0; i < n; i++) {
    const predicted = lnA + bSlope * x[i];
    ssTot += (lnY[i] - meanLnY) ** 2;
    ssRes += (lnY[i] - predicted) ** 2;
  }

  const rSquared = 1 - ssRes / ssTot;

  // Standard deviation of residuals (in log space, then converted to % deviation)
  const residualStdDev = Math.sqrt(ssRes / (n - 2));

  return { a, b: bSlope, rSquared, residualStdDev };
}

/**
 * Calculate % deviation from exponential trend at a given x.
 */
export function calculateDeviation(
  actual: number,
  a: number,
  b: number,
  x: number
): { deviationPct: number; trendValue: number } {
  const trendValue = a * Math.exp(b * x);
  const deviationPct = ((actual - trendValue) / trendValue) * 100;
  return { deviationPct, trendValue };
}

/**
 * Convert a % deviation to standard deviations (sigma).
 * Uses the residual std dev from log-space regression.
 */
export function deviationToSigma(
  deviationPct: number,
  residualStdDev: number
): number {
  // Convert % deviation to log-space deviation, then normalize
  const logDeviation = Math.log(1 + deviationPct / 100);
  return logDeviation / residualStdDev;
}

/**
 * Classify sigma into valuation zones.
 */
export function classifyValuation(sigma: number): ValuationZone {
  if (sigma < -2) return "strongly_undervalued";
  if (sigma < -1) return "undervalued";
  if (sigma <= 1) return "fair_value";
  if (sigma <= 2) return "overvalued";
  return "strongly_overvalued";
}

/**
 * Convert days-based b coefficient to annualized growth rate.
 */
export function annualizedGrowth(b: number): number {
  return Math.exp(b * 365.25) - 1;
}

/**
 * Calculate sigma bands at a given x value.
 */
export function sigmaBands(
  a: number,
  b: number,
  residualStdDev: number,
  x: number
): { trend: number; upper1: number; lower1: number; upper2: number; lower2: number } {
  const lnTrend = Math.log(a) + b * x;
  return {
    trend: Math.exp(lnTrend),
    upper1: Math.exp(lnTrend + residualStdDev),
    lower1: Math.exp(lnTrend - residualStdDev),
    upper2: Math.exp(lnTrend + 2 * residualStdDev),
    lower2: Math.exp(lnTrend - 2 * residualStdDev),
  };
}
