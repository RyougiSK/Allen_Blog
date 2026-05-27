import { getDataInventory, getETLStatus } from "@/lib/actions/financial";
import { ETLStatusPanel } from "@/components/features/financial/etl-status-panel";

export const dynamic = "force-dynamic";

export default async function FinancialOverviewPage() {
  const [inventory, jobs] = await Promise.all([
    getDataInventory(),
    getETLStatus(),
  ]);

  const marketIndexes = inventory.filter((r) => r.source === "Market Index");
  const deflators = inventory.filter((r) => r.source === "Deflator");
  const treasury = inventory.filter((r) => r.source === "Treasury");
  const cpi = inventory.filter((r) => r.source === "CPI");

  return (
    <div className="space-y-6">
      <ETLStatusPanel jobs={jobs} />

      <div className="p-4 rounded-lg border border-border bg-surface/30">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-text-primary">Schedule</h3>
        </div>
        <p className="text-xs text-text-tertiary">
          Daily automated refresh at <span className="text-text-secondary font-mono">06:00 UTC</span> via Vercel Cron
        </p>
      </div>

      <section>
        <h2 className="text-sm font-medium text-text-secondary mb-3">Market Indexes</h2>
        <DataTable rows={marketIndexes} />
      </section>

      {deflators.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-text-secondary mb-3">Deflators (Oil)</h2>
          <DataTable rows={deflators} />
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium text-text-secondary mb-3">Treasury Rates</h2>
        <DataTable rows={treasury} />
      </section>

      <section>
        <h2 className="text-sm font-medium text-text-secondary mb-3">CPI Data</h2>
        <DataTable rows={cpi} />
      </section>
    </div>
  );
}

function DataTable({ rows }: { rows: { name: string; rows: number; earliest: string | null; latest: string | null }[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/30">
            <th className="text-left px-4 py-2.5 font-medium text-text-secondary">Name</th>
            <th className="text-right px-4 py-2.5 font-medium text-text-secondary">Rows</th>
            <th className="text-right px-4 py-2.5 font-medium text-text-secondary">From</th>
            <th className="text-right px-4 py-2.5 font-medium text-text-secondary">To</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-border/50">
              <td className="px-4 py-2.5 text-text-primary">{row.name}</td>
              <td className="px-4 py-2.5 text-right font-mono text-text-tertiary">
                {row.rows.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-text-tertiary">
                {row.earliest ?? "—"}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-text-tertiary">
                {row.latest ?? "—"}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-4 text-center text-text-quaternary text-xs">
                No data yet — click Update above
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
