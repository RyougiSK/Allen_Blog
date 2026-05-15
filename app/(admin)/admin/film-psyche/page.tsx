import Link from "next/link";
import { Plus } from "lucide-react";
import { fetchAllProjects } from "@/lib/actions/film-psyche";
import { ProjectTable } from "@/components/features/film-psyche/project-table";

export default async function FilmPsycheDashboard() {
  const projects = await fetchAllProjects();

  return (
    <div className="w-full max-w-6xl px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-text-primary">作品解析</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            系统性分析电影、剧集、小说的心理结构
          </p>
        </div>
        <Link
          href="/admin/film-psyche/new"
          className="flex items-center gap-1.5 rounded-md bg-accent-warm/10 px-3 py-2 text-sm font-medium text-accent-warm hover:bg-accent-warm/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新建项目
        </Link>
      </div>

      <ProjectTable projects={projects} />
    </div>
  );
}
