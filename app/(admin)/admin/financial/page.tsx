import { getFinancialOverview, getETLStatus } from "@/lib/actions/financial";
import { MarketOverviewCard } from "@/components/features/financial/market-overview-card";
import { ETLStatusPanel } from "@/components/features/financial/etl-status-panel";

export const dynamic = "force-dynamic";

export default async function FinancialOverviewPage() {
  const [overview, jobs] = await Promise.all([
    getFinancialOverview(),
    getETLStatus(),
  ]);

  const usIndexes = overview.filter((o) => o.index.market === "us");
  const auIndexes = overview.filter((o) => o.index.market === "au");
  const cnIndexes = overview.filter((o) => o.index.market === "cn");
  const commodities = overview.filter((o) => o.index.market === "commodity");

  return (
    <div className="space-y-6">
      <ETLStatusPanel jobs={jobs} />

      {overview.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-tertiary text-sm">
            No analysis data yet. Click &quot;Run Now&quot; above to fetch market data and compute the initial analysis.
          </p>
        </div>
      )}

      {usIndexes.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-text-secondary mb-3">
            United States
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {usIndexes.map((o) => (
              <MarketOverviewCard key={o.id} data={o} />
            ))}
          </div>
        </section>
      )}

      {auIndexes.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-text-secondary mb-3">
            Australia
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {auIndexes.map((o) => (
              <MarketOverviewCard key={o.id} data={o} />
            ))}
          </div>
        </section>
      )}

      {cnIndexes.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-text-secondary mb-3">
            China
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cnIndexes.map((o) => (
              <MarketOverviewCard key={o.id} data={o} />
            ))}
          </div>
        </section>
      )}

      {commodities.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-text-secondary mb-3">
            Commodities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {commodities.map((o) => (
              <MarketOverviewCard key={o.id} data={o} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
