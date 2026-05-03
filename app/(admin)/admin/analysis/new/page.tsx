import { AnalysisForm } from "@/components/features/analysis-form";

export const dynamic = "force-dynamic";

export default function NewAnalysisPage() {
  return (
    <div className="max-w-6xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-text-primary">
          新建分析
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          填写以下结构化板块，生成可发布的博客内容。
        </p>
      </div>
      <AnalysisForm />
    </div>
  );
}
