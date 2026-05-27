CREATE TABLE treasury_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  maturity TEXT NOT NULL,
  rate REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, maturity)
);

CREATE INDEX idx_treasury_rates_maturity_date ON treasury_rates(maturity, date);

ALTER TABLE treasury_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read treasury_rates"
  ON treasury_rates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access to treasury_rates"
  ON treasury_rates FOR ALL TO service_role USING (true);
