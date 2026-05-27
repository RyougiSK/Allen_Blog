-- Extend index start dates to earliest API availability
UPDATE market_indexes SET data_start_date = '1960-01-01' WHERE symbol = 'SPX';
UPDATE market_indexes SET data_start_date = '1971-02-01' WHERE symbol = 'IXIC';
UPDATE market_indexes SET data_start_date = '1992-01-01' WHERE symbol = 'DJI';
UPDATE market_indexes SET data_start_date = '1992-01-01' WHERE symbol = 'AXJO';
UPDATE market_indexes SET data_start_date = '1991-01-01' WHERE symbol = 'SSEC';

-- Oil: change start to 1986 (FRED DCOILWTICO availability)
UPDATE market_indexes SET data_start_date = '1986-01-01' WHERE symbol = 'OIL';

-- Remove gold-adjusted analysis (Gold stays in DB for future use but not as active deflator)
DELETE FROM mean_reversion_analysis WHERE adjustment_type = 'gold';
