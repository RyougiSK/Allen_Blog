-- Financial Monitor: Mean Reversion Analysis
-- Tracks global market indexes and computes exponential trend analysis

-- Registry of tracked market indexes and commodities
CREATE TABLE market_indexes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  market TEXT NOT NULL CHECK (market IN ('us', 'au', 'cn', 'commodity')),
  asset_type TEXT NOT NULL DEFAULT 'index' CHECK (asset_type IN ('index', 'commodity')),
  is_deflator BOOLEAN NOT NULL DEFAULT false,
  yahoo_symbol TEXT NOT NULL,
  data_start_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Raw daily price data
CREATE TABLE market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_id UUID NOT NULL REFERENCES market_indexes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  close_price NUMERIC(18, 6) NOT NULL,
  adjusted_close NUMERIC(18, 6),
  volume BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(index_id, date)
);

CREATE INDEX idx_market_prices_index_date ON market_prices(index_id, date DESC);
CREATE INDEX idx_market_prices_date ON market_prices(date DESC);

-- Monthly CPI data per country
CREATE TABLE cpi_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('us', 'au', 'cn')),
  cpi_value NUMERIC(12, 4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, country)
);

CREATE INDEX idx_cpi_data_country_date ON cpi_data(country, date DESC);

-- Computed mean reversion analysis results
CREATE TABLE mean_reversion_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_id UUID NOT NULL REFERENCES market_indexes(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL DEFAULT 'nominal'
    CHECK (adjustment_type IN ('cpi', 'gold', 'oil', 'nominal')),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Regression parameters: y = a * e^(b*x)
  reg_a NUMERIC(20, 10) NOT NULL,
  reg_b NUMERIC(20, 10) NOT NULL,
  r_squared NUMERIC(8, 6) NOT NULL,
  std_deviation NUMERIC(12, 6) NOT NULL,
  data_points INTEGER NOT NULL DEFAULT 0,
  data_start DATE,

  -- Current state
  current_price NUMERIC(18, 6) NOT NULL,
  trend_value NUMERIC(18, 6) NOT NULL,
  deviation_pct NUMERIC(10, 4) NOT NULL,
  deviation_sigma NUMERIC(8, 4) NOT NULL,
  valuation_zone TEXT NOT NULL CHECK (valuation_zone IN (
    'strongly_undervalued', 'undervalued', 'fair_value', 'overvalued', 'strongly_overvalued'
  )),

  -- Time series for charts (JSONB, weekly-sampled)
  price_series JSONB,
  deviation_series JSONB,

  UNIQUE(index_id, adjustment_type)
);

CREATE INDEX idx_mra_index ON mean_reversion_analysis(index_id);
CREATE INDEX idx_mra_computed ON mean_reversion_analysis(computed_at DESC);

-- ETL job audit log
CREATE TABLE etl_job_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN ('price_fetch', 'cpi_fetch', 'analysis_compute', 'full_pipeline')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  indexes_processed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB
);

CREATE INDEX idx_etl_log_type_date ON etl_job_log(job_type, started_at DESC);

-- RLS policies (authenticated users only)
ALTER TABLE market_indexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpi_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE mean_reversion_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE etl_job_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read market_indexes"
  ON market_indexes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage market_indexes"
  ON market_indexes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read market_prices"
  ON market_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage market_prices"
  ON market_prices FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read cpi_data"
  ON cpi_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage cpi_data"
  ON cpi_data FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read mean_reversion_analysis"
  ON mean_reversion_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage mean_reversion_analysis"
  ON mean_reversion_analysis FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read etl_job_log"
  ON etl_job_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage etl_job_log"
  ON etl_job_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service role bypass for cron jobs
CREATE POLICY "Service role full access market_prices"
  ON market_prices FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cpi_data"
  ON cpi_data FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access mean_reversion_analysis"
  ON mean_reversion_analysis FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access etl_job_log"
  ON etl_job_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed initial market indexes
INSERT INTO market_indexes (symbol, name, market, asset_type, is_deflator, yahoo_symbol) VALUES
  ('SPX',      'S&P 500',              'us',        'index',     false, '^GSPC'),
  ('IXIC',     'Nasdaq Composite',     'us',        'index',     false, '^IXIC'),
  ('DJI',      'Dow Jones Industrial',  'us',        'index',     false, '^DJI'),
  ('AXJO',     'ASX 200',              'au',        'index',     false, '^AXJO'),
  ('CSI300',   'CSI 300',              'cn',        'index',     false, '000300.SS'),
  ('SSEC',     'Shanghai Composite',   'cn',        'index',     false, '000001.SS'),
  ('GOLD',     'Gold Futures',         'commodity', 'commodity', true,  'GC=F'),
  ('OIL',      'Crude Oil Futures',    'commodity', 'commodity', true,  'CL=F');
