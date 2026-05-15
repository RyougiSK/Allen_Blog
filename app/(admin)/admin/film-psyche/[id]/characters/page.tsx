import { notFound } from "next/navigation";
import { fetchProject, fetchStoryStructure, fetchCharacters, fetchScenes } from "@/lib/actions/film-psyche";
import { CharacterCardsPage } from "@/components/features/film-psyche/character-cards-page";
import { StepNav } from "@/components/features/film-psyche/step-nav";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CharactersPage({ params }: Props) {
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
        <h1 className="text-lg font-medium text-text-primary">角色卡片</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          为每个重要角色建立观察卡片：记录行为、台词、决策方式，最后再判断原型与功能态度
        </p>
      </div>

      <CharacterCardsPage projectId={id} characters={characters} />
    </div>
  );
}
