import { ProjectSetupForm } from "@/components/features/film-psyche/project-setup-form";

export default function NewFilmPsycheProject() {
  return (
    <div className="w-full max-w-6xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-lg font-medium text-text-primary">创建新分析项目</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          填写作品基本信息和分析目标
        </p>
      </div>

      <ProjectSetupForm project={null} />
    </div>
  );
}
