import { notFound } from "next/navigation";
import { fetchProject, fetchStoryStructure, fetchCharacters, fetchScenes } from "@/lib/actions/film-psyche";
import { SceneCardsPage } from "@/components/features/film-psyche/scene-cards-page";
import { StepNav } from "@/components/features/film-psyche/step-nav";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ScenesPage({ params }: Props) {
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
        <h1 className="text-lg font-medium text-text-primary">场景卡片</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          选择 5-8 个关键场景，记录事件、台词、行为，再尝试解读心理意义
        </p>
      </div>

      <SceneCardsPage projectId={id} scenes={scenes} />
    </div>
  );
}
