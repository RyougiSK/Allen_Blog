-- Liquidity monitoring tables (Pozsar framework)

CREATE TABLE financial.liquidity_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  series TEXT NOT NULL,
  value REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, series)
);
CREATE INDEX idx_liquidity_rates_series_date ON financial.liquidity_rates(series, date);

CREATE TABLE financial.liquidity_reserves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  series TEXT NOT NULL,
  value REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, series)
);
CREATE INDEX idx_liquidity_reserves_series_date ON financial.liquidity_reserves(series, date);

-- Grant access
GRANT ALL ON financial.liquidity_rates TO service_role;
GRANT SELECT ON financial.liquidity_rates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON financial.liquidity_rates TO authenticated;

GRANT ALL ON financial.liquidity_reserves TO service_role;
GRANT SELECT ON financial.liquidity_reserves TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON financial.liquidity_reserves TO authenticated;
