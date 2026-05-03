"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type {
  ActionResult,
  AnalysisFormData,
  AnalysisEntry,
  AnalysisEntryWithCharacters,
} from "@/lib/types";

function revalidateAnalysis() {
  revalidatePath("/admin/analysis", "layout");
}

export async function createAnalysis(
  data: AnalysisFormData
): Promise<ActionResult & { analysisId?: string }> {
  const supabase = await createClient();

  const { data: entry, error } = await supabase
    .from("analysis_entries")
    .insert({
      title: data.title,
      work_name: data.work_name,
      work_type: data.work_type,
      author_director: data.author_director,
      cover_image_url: data.cover_image_url,
      thesis: data.thesis,
      conflict_internal: data.conflict_internal,
      conflict_external: data.conflict_external,
      shadow: data.shadow,
      projection: data.projection,
      development_start: data.development_start,
      development_crisis: data.development_crisis,
      development_end: data.development_end,
      reflection_scenario: data.reflection_scenario,
      reflection_insight: data.reflection_insight,
      closing: data.closing,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  if (data.characters.length > 0) {
    const { error: charError } = await supabase
      .from("analysis_characters")
      .insert(
        data.characters.map((c, i) => ({
          analysis_id: entry.id,
          character_name: c.character_name,
          archetype: c.archetype,
          mbti_function: c.mbti_function,
          notes: c.notes,
          sort_order: i,
        }))
      );

    if (charError) return { success: false, error: charError.message };
  }

  revalidateAnalysis();
  return { success: true, analysisId: entry.id };
}

export async function updateAnalysis(
  id: string,
  data: AnalysisFormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("analysis_entries")
    .update({
      title: data.title,
      work_name: data.work_name,
      work_type: data.work_type,
      author_director: data.author_director,
      cover_image_url: data.cover_image_url,
      thesis: data.thesis,
      conflict_internal: data.conflict_internal,
      conflict_external: data.conflict_external,
      shadow: data.shadow,
      projection: data.projection,
      development_start: data.development_start,
      development_crisis: data.development_crisis,
      development_end: data.development_end,
      reflection_scenario: data.reflection_scenario,
      reflection_insight: data.reflection_insight,
      closing: data.closing,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await supabase.from("analysis_characters").delete().eq("analysis_id", id);

  if (data.characters.length > 0) {
    const { error: charError } = await supabase
      .from("analysis_characters")
      .insert(
        data.characters.map((c, i) => ({
          analysis_id: id,
          character_name: c.character_name,
          archetype: c.archetype,
          mbti_function: c.mbti_function,
          notes: c.notes,
          sort_order: i,
        }))
      );

    if (charError) return { success: false, error: charError.message };
  }

  revalidateAnalysis();
  return { success: true };
}

export async function autoSaveAnalysis(
  id: string,
  data: Partial<AnalysisFormData>
): Promise<ActionResult> {
  const supabase = await createClient();

  const { characters, ...fields } = data;

  if (Object.keys(fields).length > 0) {
    const { error } = await supabase
      .from("analysis_entries")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
  }

  if (characters !== undefined) {
    await supabase.from("analysis_characters").delete().eq("analysis_id", id);

    if (characters.length > 0) {
      const { error: charError } = await supabase
        .from("analysis_characters")
        .insert(
          characters.map((c, i) => ({
            analysis_id: id,
            character_name: c.character_name,
            archetype: c.archetype,
            mbti_function: c.mbti_function,
            notes: c.notes,
            sort_order: i,
          }))
        );

      if (charError) return { success: false, error: charError.message };
    }
  }

  return { success: true };
}

export async function deleteAnalysis(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("analysis_entries")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidateAnalysis();
  return { success: true };
}

export async function fetchAllAnalyses(): Promise<AnalysisEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analysis_entries")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function fetchAnalysisWithCharacters(
  id: string
): Promise<AnalysisEntryWithCharacters | null> {
  const supabase = await createClient();

  const { data: entry, error } = await supabase
    .from("analysis_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !entry) return null;

  const { data: characters } = await supabase
    .from("analysis_characters")
    .select("*")
    .eq("analysis_id", id)
    .order("sort_order", { ascending: true });

  return { ...entry, characters: characters ?? [] };
}
