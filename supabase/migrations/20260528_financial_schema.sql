-- Move financial tables into a dedicated schema
CREATE SCHEMA IF NOT EXISTS financial;

ALTER TABLE public.market_indexes SET SCHEMA financial;
ALTER TABLE public.market_prices SET SCHEMA financial;
ALTER TABLE public.cpi_data SET SCHEMA financial;
ALTER TABLE public.mean_reversion_analysis SET SCHEMA financial;
ALTER TABLE public.treasury_rates SET SCHEMA financial;
ALTER TABLE public.etl_job_log SET SCHEMA financial;

-- Grant access for PostgREST API roles
GRANT USAGE ON SCHEMA financial TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA financial TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA financial TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA financial TO authenticated;
