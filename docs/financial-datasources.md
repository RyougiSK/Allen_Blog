# Financial Monitor — Data Sources

## Overview

The Financial Monitor fetches market data from external providers, stores raw data in Supabase, and computes mean reversion analysis daily via a Vercel Cron Job (6:00 UTC).

---

## Data Sources

### 1. Market Prices — Yahoo Finance

| Field | Detail |
|-------|--------|
| **Provider** | Yahoo Finance (via `yahoo-finance2` npm package) |
| **API** | `yahooFinance.chart(symbol, { period1, period2, interval })` |
| **Interval** | Daily (`1d`) |
| **History** | From 2000-01-01 (or earliest available) to present |
| **Update** | Delta loading — each cron run fetches only new days since last stored date |
| **DB Table** | `market_prices` |

**Tickers fetched:**

| Symbol (internal) | Yahoo Ticker | Name | Market |
|---|---|---|---|
| `SPX` | `^GSPC` | S&P 500 | US |
| `IXIC` | `^IXIC` | Nasdaq Composite | US |
| `DJI` | `^DJI` | Dow Jones Industrial | US |
| `AXJO` | `^AXJO` | ASX 200 | Australia |
| `CSI300` | `000300.SS` | CSI 300 | China |
| `SSEC` | `000001.SS` | Shanghai Composite | China |
| `GOLD` | `GC=F` | Gold Futures | Commodity |
| `OIL` | `CL=F` | Crude Oil Futures | Commodity |

**Fields stored per row:**
- `index_id` (FK to `market_indexes`)
- `date` (trading day)
- `close_price` (daily close)
- `adjusted_close` (dividend/split adjusted)
- `volume`

---

### 2. CPI Data — FRED (Federal Reserve Economic Data)

| Field | Detail |
|-------|--------|
| **Provider** | FRED (St. Louis Federal Reserve) |
| **API** | `https://api.stlouisfed.org/fred/series/observations` |
| **Auth** | `FRED_API_KEY` environment variable |
| **Interval** | Monthly |
| **History** | From 2000-01-01 to present |
| **Update** | Delta loading — fetches new months since last stored |
| **DB Table** | `cpi_data` |

**Series fetched:**

| Country | FRED Series ID | Description |
|---|---|---|
| US | `CPIAUCSL` | Consumer Price Index for All Urban Consumers (seasonally adjusted) |
| Australia | `AUSCPIALLQINMEI` | CPI All Items (quarterly, interpolated to monthly) |
| China | `CHNCPIALLMINMEI` | CPI All Items (monthly) |

**Fields stored per row:**
- `date` (first of month)
- `country` (`us`, `au`, or `cn`)
- `cpi_value` (index value, not percentage change)

---

## Database Tables Summary

| Table | Source | Interval | Purpose |
|-------|--------|----------|---------|
| `market_indexes` | Seeded in migration | — | Registry of tracked assets (8 rows) |
| `market_prices` | Yahoo Finance | Daily | Raw OHLCV price data |
| `cpi_data` | FRED | Monthly | Inflation index per country |
| `mean_reversion_analysis` | Computed | Daily (on cron) | Regression results, deviation, chart JSONB |
| `etl_job_log` | System | Per run | Audit trail of ETL executions |

---

## Computed Output

The `mean_reversion_analysis` table stores computed results — one row per (index, adjustment_type) combination:

| Adjustment Type | Method |
|---|---|
| `nominal` | Raw price, no adjustment |
| `cpi` | Price deflated by country-specific CPI to current dollars |
| `gold` | Price divided by gold futures price |
| `oil` | Price divided by crude oil futures price |

**Stored fields include:**
- Exponential regression parameters (`reg_a`, `reg_b`)
- Model quality (`r_squared`, `std_deviation`)
- Current valuation (`deviation_pct`, `deviation_sigma`, `valuation_zone`)
- Chart time series as JSONB (`price_series`, `deviation_series`) — weekly sampled

---

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `FRED_API_KEY` | `.env.local` + Vercel | Authenticate FRED API requests |
| `CRON_SECRET` | Vercel (auto-generated) | Vercel cron job authorization header |
