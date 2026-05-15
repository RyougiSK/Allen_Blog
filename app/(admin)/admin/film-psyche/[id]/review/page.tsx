import { notFound } from "next/navigation";
import {
  fetchProject,
  fetchStoryStructure,
  fetchCharacters,
  fetchScenes,
  fetchReviews,
} from "@/lib/actions/film-psyche";
import { AiReviewPage } from "@/components/features/film-psyche/ai-review-page";
import { StepNav } from "@/components/features/film-psyche/step-nav";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReviewPage({ params }: Props) {
  const { id } = await params;
  const project = await fetchProject(id);
  if (!project) notFound();

  const [story, characters, scenes, reviews] = await Promise.all([
    fetchStoryStructure(id),
    fetchCharacters(id),
    fetchScenes(id),
    fetchReviews(id),
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
        <h1 className="text-lg font-medium text-text-primary">AI 审查</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          基于你的材料，AI 给出反馈、修正建议与文章草稿
        </p>
      </div>

      <AiReviewPage
        projectId={id}
        reviews={reviews}
        hasStory={!!story?.opening_state}
        characterCount={characters.length}
        sceneCount={scenes.length}
      />
    </div>
  );
}
