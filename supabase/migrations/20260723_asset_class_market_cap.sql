-- Asset Class Market Cap tracking
-- Tracks total market cap by global asset class (equities, bonds, real estate, gold, crypto, derivatives)

CREATE TABLE financial.asset_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  estimation_method TEXT NOT NULL CHECK (estimation_method IN ('direct', 'multiplier', 'calculated')),
  multiplier NUMERIC(8, 4),
  source_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE financial.asset_class_market_cap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_class_id UUID NOT NULL REFERENCES financial.asset_classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  market_cap_t NUMERIC(16, 4) NOT NULL,
  source TEXT NOT NULL,
  raw_value NUMERIC(20, 6),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(asset_class_id, date)
);

CREATE INDEX idx_acmc_class_date ON financial.asset_class_market_cap(asset_class_id, date DESC);
CREATE INDEX idx_acmc_date ON financial.asset_class_market_cap(date DESC);

-- Grants (required for tables created after the schema-level GRANT ALL)
GRANT ALL ON financial.asset_classes TO service_role;
GRANT ALL ON financial.asset_class_market_cap TO service_role;
GRANT SELECT ON financial.asset_classes TO anon, authenticated;
GRANT SELECT ON financial.asset_class_market_cap TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON financial.asset_classes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON financial.asset_class_market_cap TO authenticated;

-- RLS
ALTER TABLE financial.asset_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial.asset_class_market_cap ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read asset_classes"
  ON financial.asset_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage asset_classes"
  ON financial.asset_classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access asset_classes"
  ON financial.asset_classes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read asset_class_market_cap"
  ON financial.asset_class_market_cap FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage asset_class_market_cap"
  ON financial.asset_class_market_cap FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access asset_class_market_cap"
  ON financial.asset_class_market_cap FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed asset classes
INSERT INTO financial.asset_classes (slug, name, color, sort_order, estimation_method, multiplier, source_description) VALUES
  ('global_equities', 'Global Equities', '#C9B79C', 1, 'multiplier', 2.22, 'FRED NCBEILQ027S (US corporate equities) × 2.22. US ≈ 45% of global equity market.'),
  ('global_bonds', 'Global Fixed Income', '#6366F1', 2, 'multiplier', 2.50, 'FRED TCMDO (US total credit market debt) × 2.5. US ≈ 40% of global bond market.'),
  ('real_estate', 'Global Real Estate', '#8B5CF6', 3, 'multiplier', 3.00, 'FRED HNOREMV (US household real estate at market value) × 3.0. US ≈ 33% of global RE.'),
  ('gold', 'Gold', '#EAB308', 4, 'calculated', NULL, 'Above-ground gold stock (~215,000 tonnes mid-2024, +3,300/yr) × spot price per troy oz.'),
  ('crypto', 'Cryptocurrency', '#F59E0B', 5, 'direct', NULL, 'CoinGecko global market cap API (total_market_cap.usd).'),
  ('derivatives', 'Derivatives (Gross MV)', '#14B8A6', 6, 'direct', NULL, 'BIS OTC derivatives bulk CSV (gross market value, net-net basis). Semi-annual, auto-fetched from data.bis.org.');

-- Global total estimate config (used to compute "Other" residual)
-- Base: $900T in 2024, growing 5%/year (McKinsey Global Balance Sheet)
INSERT INTO financial.asset_classes (slug, name, color, sort_order, estimation_method, multiplier, source_description, is_active) VALUES
  ('_global_total_estimate', 'Global Total Estimate', '#525252', 99, 'calculated', NULL,
   '{"base_year": 2024, "base_value_t": 900, "annual_growth_rate": 0.05}', false);
