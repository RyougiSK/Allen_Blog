export type Market = "us" | "au" | "cn" | "commodity";
export type AssetType = "index" | "commodity";
export type AdjustmentType = "cpi" | "gold" | "oil" | "nominal";
export type ValuationZone =
  | "strongly_undervalued"
  | "undervalued"
  | "fair_value"
  | "overvalued"
  | "strongly_overvalued";
export type ETLJobType = "price_fetch" | "cpi_fetch" | "analysis_compute" | "full_pipeline";
export type ETLJobStatus = "started" | "completed" | "failed";

export interface MarketIndex {
  id: string;
  symbol: string;
  name: string;
  market: Market;
  asset_type: AssetType;
  is_deflator: boolean;
  yahoo_symbol: string;
  data_start_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MarketPrice {
  id: string;
  index_id: string;
  date: string;
  close_price: number;
  adjusted_close: number | null;
  volume: number | null;
}

export interface CPIData {
  id: string;
  date: string;
  country: string;
  cpi_value: number;
}

export interface RegressionResult {
  a: number;
  b: number;
  rSquared: number;
  residualStdDev: number;
}

export interface MeanReversionAnalysis {
  id: string;
  index_id: string;
  adjustment_type: AdjustmentType;
  computed_at: string;
  reg_a: number;
  reg_b: number;
  r_squared: number;
  std_deviation: number;
  data_points: number;
  data_start: string | null;
  data_end: string | null;
  current_price: number;
  trend_value: number;
  deviation_pct: number;
  deviation_sigma: number;
  valuation_zone: ValuationZone;
  price_series: TrendPoint[] | null;
  deviation_series: DeviationPoint[] | null;
}

export interface MeanReversionOverview extends MeanReversionAnalysis {
  index: MarketIndex;
}

export interface TrendPoint {
  date: string;
  actual: number;
  trend: number;
  upper1: number;
  lower1: number;
  upper2: number;
  lower2: number;
}

export interface DeviationPoint {
  date: string;
  deviation_pct: number;
  deviation_sigma: number;
}

export interface ETLJobLog {
  id: string;
  job_type: ETLJobType;
  status: ETLJobStatus;
  indexes_processed: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface ModelStats {
  index: MarketIndex;
  adjustment_type: AdjustmentType;
  data_start: string | null;
  data_points: number;
  r_squared: number;
  std_deviation: number;
  reg_a: number;
  reg_b: number;
  annual_growth: number;
  current_sigma: number;
  valuation_zone: ValuationZone;
  computed_at: string;
}
