import { notFound } from "next/navigation";
import { AnalysisForm } from "@/components/features/analysis-form";
import { fetchAnalysisWithCharacters } from "@/lib/actions/analysis";

export const dynamic = "force-dynamic";

export default async function EditAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const analysis = await fetchAnalysisWithCharacters(id);

  if (!analysis) notFound();

  return (
    <div className="max-w-6xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-text-primary">
          编辑分析
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {analysis.title || "未命名"} — {analysis.work_name}
        </p>
      </div>
      <AnalysisForm analysis={analysis} />
    </div>
  );
}
