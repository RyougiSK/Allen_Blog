import { notFound } from "next/navigation";
import { fetchProject, fetchStoryStructure, fetchCharacters, fetchScenes } from "@/lib/actions/film-psyche";
import { ProjectSetupForm } from "@/components/features/film-psyche/project-setup-form";
import { StepNav } from "@/components/features/film-psyche/step-nav";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SetupPage({ params }: Props) {
  const { id } = await params;
  const project = await fetchProject(id);
  if (!project) notFound();

  const [story, characters, scenes] = await Promise.all([
    fetchStoryStructure(id),
    fetchCharacters(id),
    fetchScenes(id),
  ]);

  return (
    <div className="w-full max-w-6xl px-8 py-8">
      <StepNav
        projectId={id}
        completions={{
          setup: !!project.title,
          story: !!story?.opening_state,
          characters: characters.length >= 2,
          scenes: scenes.length >= 3,
        }}
      />

      <div className="mb-8">
        <h1 className="text-lg font-medium text-text-primary">基本信息</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          作品元数据与分析目标
        </p>
      </div>

      <ProjectSetupForm project={project} />
    </div>
  );
}
