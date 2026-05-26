import { getModelStats } from "@/lib/actions/financial";
import { ModelStatsTable } from "@/components/features/financial/model-stats-table";

export const dynamic = "force-dynamic";

export default async function ModelStatsPage() {
  const stats = await getModelStats();

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-tertiary">
        Exponential regression parameters and model quality metrics for each
        index and adjustment type. Annual growth is derived from the regression
        slope coefficient.
      </p>
      <ModelStatsTable stats={stats} />
    </div>
  );
}
