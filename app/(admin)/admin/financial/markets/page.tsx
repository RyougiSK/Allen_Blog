import Link from "next/link";
import { getFinancialOverview } from "@/lib/actions/financial";
import { ValuationBadge } from "@/components/features/financial/valuation-badge";

export const dynamic = "force-dynamic";

export default async function MarketsPage() {
  const overview = await getFinancialOverview();

  if (overview.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-tertiary text-sm">
          No market data available. Run the ETL pipeline from the Overview tab first.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/30">
            <th className="text-left px-4 py-3 font-medium text-text-secondary">Index</th>
            <th className="text-left px-4 py-3 font-medium text-text-secondary">Market</th>
            <th className="text-right px-4 py-3 font-medium text-text-secondary">Price</th>
            <th className="text-right px-4 py-3 font-medium text-text-secondary">Trend</th>
            <th className="text-right px-4 py-3 font-medium text-text-secondary">Deviation</th>
            <th className="text-right px-4 py-3 font-medium text-text-secondary">Sigma</th>
            <th className="text-left px-4 py-3 font-medium text-text-secondary">Zone</th>
          </tr>
        </thead>
        <tbody>
          {overview.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border/50 hover:bg-surface/20 transition-colors"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/admin/financial/markets/${row.index.symbol}`}
                  className="text-text-primary font-medium hover:text-accent-warm transition-colors"
                >
                  {row.index.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-text-tertiary uppercase text-xs">
                {row.index.market}
              </td>
              <td className="px-4 py-3 text-text-primary text-right font-mono">
                {row.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-text-tertiary text-right font-mono">
                {row.trend_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
              <td className={`px-4 py-3 text-right font-mono ${row.deviation_pct > 0 ? "text-red-400" : "text-green-400"}`}>
                {row.deviation_pct > 0 ? "+" : ""}{row.deviation_pct.toFixed(1)}%
              </td>
              <td className={`px-4 py-3 text-right font-mono ${row.deviation_sigma > 0 ? "text-red-400" : "text-green-400"}`}>
                {row.deviation_sigma > 0 ? "+" : ""}{row.deviation_sigma.toFixed(2)}σ
              </td>
              <td className="px-4 py-3">
                <ValuationBadge zone={row.valuation_zone} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
