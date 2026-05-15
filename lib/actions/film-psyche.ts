"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { ActionResult } from "@/lib/types";
import type {
  FilmProject,
  FilmProjectWithCounts,
  StoryStructure,
  StoryStructureData,
  FilmCharacter,
  CharacterData,
  FilmScene,
  SceneData,
  AiReview,
  ProjectSetupData,
  ReviewType,
} from "@/lib/types/film-psyche";

function revalidate() {
  revalidatePath("/admin/film-psyche", "layout");
}

// --- Projects ---

export async function createProject(
  data: ProjectSetupData
): Promise<ActionResult & { projectId?: string }> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("film_analysis_projects")
    .insert({
      title: data.title,
      original_title: data.original_title,
      work_type: data.work_type,
      year: data.year,
      director_or_author: data.director_or_author,
      analysis_goal: data.analysis_goal,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidate();
  return { success: true, projectId: project.id };
}

export async function updateProject(
  id: string,
  data: Partial<ProjectSetupData>
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("film_analysis_projects")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidate();
  return { success: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("film_analysis_projects")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidate();
  return { success: true };
}

export async function fetchAllProjects(): Promise<FilmProjectWithCounts[]> {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("film_analysis_projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error || !projects) return [];

  const results: FilmProjectWithCounts[] = await Promise.all(
    projects.map(async (p: FilmProject) => {
      const [chars, scenes, story, reviews] = await Promise.all([
        supabase
          .from("film_psyche_characters")
          .select("id", { count: "exact", head: true })
          .eq("project_id", p.id),
        supabase
          .from("film_psyche_scenes")
          .select("id", { count: "exact", head: true })
          .eq("project_id", p.id),
        supabase
          .from("story_structure")
          .select("id")
          .eq("project_id", p.id)
          .maybeSingle(),
        supabase
          .from("film_psyche_ai_reviews")
          .select("id", { count: "exact", head: true })
          .eq("project_id", p.id),
      ]);

      return {
        ...p,
        character_count: chars.count ?? 0,
        scene_count: scenes.count ?? 0,
        has_story: !!story.data,
        review_count: reviews.count ?? 0,
      };
    })
  );

  return results;
}

export async function fetchProject(id: string): Promise<FilmProject | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("film_analysis_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// --- Story Structure ---

export async function fetchStoryStructure(
  projectId: string
): Promise<StoryStructure | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("story_structure")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function upsertStoryStructure(
  projectId: string,
  data: StoryStructureData
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("story_structure")
    .select("id")
    .eq("project_id", projectId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("story_structure")
      .update(data)
      .eq("project_id", projectId);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("story_structure")
      .insert({ project_id: projectId, ...data });

    if (error) return { success: false, error: error.message };
  }

  await supabase
    .from("film_analysis_projects")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", projectId);

  return { success: true };
}

// --- Characters ---

export async function fetchCharacters(
  projectId: string
): Promise<FilmCharacter[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("film_psyche_characters")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function saveCharacters(
  projectId: string,
  characters: CharacterData[]
): Promise<ActionResult> {
  const supabase = await createClient();

  await supabase
    .from("film_psyche_characters")
    .delete()
    .eq("project_id", projectId);

  if (characters.length > 0) {
    const { error } = await supabase.from("film_psyche_characters").insert(
      characters.map((c, i) => ({
        project_id: projectId,
        name: c.name,
        role_in_story: c.role_in_story,
        relationship_to_protagonist: c.relationship_to_protagonist,
        repeated_actions: c.repeated_actions,
        repeated_lines: c.repeated_lines,
        decision_style: c.decision_style,
        stress_response: c.stress_response,
        relationship_style: c.relationship_style,
        psychological_force: c.psychological_force,
        archetype_guess: c.archetype_guess,
        function_attitude_guess: c.function_attitude_guess,
        evidence: c.evidence,
        uncertainty: c.uncertainty,
        sort_order: i,
      }))
    );

    if (error) return { success: false, error: error.message };
  }

  await supabase
    .from("film_analysis_projects")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", projectId);

  return { success: true };
}

// --- Scenes ---

export async function fetchScenes(projectId: string): Promise<FilmScene[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("film_psyche_scenes")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function saveScenes(
  projectId: string,
  scenes: SceneData[]
): Promise<ActionResult> {
  const supabase = await createClient();

  await supabase
    .from("film_psyche_scenes")
    .delete()
    .eq("project_id", projectId);

  if (scenes.length > 0) {
    const { error } = await supabase.from("film_psyche_scenes").insert(
      scenes.map((s, i) => ({
        project_id: projectId,
        scene_name: s.scene_name,
        time_marker: s.time_marker,
        scene_summary: s.scene_summary,
        characters_involved: s.characters_involved,
        key_lines: s.key_lines,
        key_actions: s.key_actions,
        protagonist_desire: s.protagonist_desire,
        protagonist_fear: s.protagonist_fear,
        what_changed: s.what_changed,
        archetypal_meaning: s.archetypal_meaning,
        function_attitude_evidence: s.function_attitude_evidence,
        user_interpretation: s.user_interpretation,
        is_key_scene: s.is_key_scene,
        sort_order: i,
      }))
    );

    if (error) return { success: false, error: error.message };
  }

  await supabase
    .from("film_analysis_projects")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", projectId);

  return { success: true };
}

// --- AI Reviews ---

export async function fetchReviews(projectId: string): Promise<AiReview[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("film_psyche_ai_reviews")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function saveReview(
  projectId: string,
  reviewType: ReviewType,
  content: string,
  evidenceScore?: Record<string, number>
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("film_psyche_ai_reviews").insert({
    project_id: projectId,
    review_type: reviewType,
    content,
    evidence_score: evidenceScore ?? null,
  });

  if (error) return { success: false, error: error.message };

  const statusMap: Partial<Record<ReviewType, string>> = {
    evidence: "evidence_complete",
    archetype: "ai_reviewed",
    function_attitude: "ai_reviewed",
    blog_draft: "blog_drafted",
  };

  const newStatus = statusMap[reviewType];
  if (newStatus) {
    await supabase
      .from("film_analysis_projects")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", projectId);
  }

  revalidate();
  return { success: true };
}
