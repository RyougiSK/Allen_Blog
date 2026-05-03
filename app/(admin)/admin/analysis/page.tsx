import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalysisTable } from "@/components/features/analysis-table";
import { fetchAllAnalyses } from "@/lib/actions/analysis";

export const dynamic = "force-dynamic";

export default async function AnalysisPage() {
  const analyses = await fetchAllAnalyses();

  return (
    <div className="max-w-6xl px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            叙事分析
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            基于荣格 + Beebe 框架的结构化心理分析工具。
          </p>
        </div>
        <Link href="/admin/analysis/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            新建分析
          </Button>
        </Link>
      </div>
      <AnalysisTable analyses={analyses} />
    </div>
  );
}
