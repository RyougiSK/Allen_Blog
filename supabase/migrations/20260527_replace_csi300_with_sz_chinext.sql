-- Remove CSI 300 (too short history for meaningful trend analysis)
DELETE FROM market_prices WHERE index_id = (SELECT id FROM market_indexes WHERE symbol = 'CSI300');
DELETE FROM mean_reversion_analysis WHERE index_id = (SELECT id FROM market_indexes WHERE symbol = 'CSI300');
DELETE FROM market_indexes WHERE symbol = 'CSI300';

-- Add Shenzhen Component Index (from 1991, 35+ years of history)
INSERT INTO market_indexes (symbol, name, market, asset_type, is_deflator, yahoo_symbol, data_start_date)
VALUES ('SZCOMP', 'Shenzhen Component', 'cn', 'index', false, '399001.SZ', '1991-01-01');

-- Add ChiNext Index (from 2010, growth/tech focused)
INSERT INTO market_indexes (symbol, name, market, asset_type, is_deflator, yahoo_symbol, data_start_date)
VALUES ('CHINEXT', 'ChiNext Index', 'cn', 'index', false, '399006.SZ', '2010-06-01');
