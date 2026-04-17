"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { slugify } from "@/lib/utils";
import type { ActionResult, Tag, TagWithCount } from "@/lib/types";

export async function createTag(
  formData: FormData,
): Promise<ActionResult & { tag?: Tag }> {
  const supabase = await createClient();
  const name = (formData.get("name") as string).trim();
  const nameZh = ((formData.get("name_zh") as string) ?? "").trim();

  if (!name) return { success: false, error: "Tag name is required" };

  const { data: tag, error } = await supabase
    .from("tags")
    .insert({ name, name_zh: nameZh, slug: slugify(name) })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin", "layout");
  return { success: true, tag };
}

export async function updateTag(
  id: string,
  data: { name: string; name_zh?: string },
): Promise<ActionResult> {
  const supabase = await createClient();
  const name = data.name.trim();
  if (!name) return { success: false, error: "Tag name is required" };

  const payload: Record<string, unknown> = { name, slug: slugify(name) };
  if (data.name_zh !== undefined) payload.name_zh = data.name_zh.trim();

  const { error } = await supabase
    .from("tags")
    .update(payload)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin", "layout");
  revalidatePath("/en", "layout");
  revalidatePath("/zh", "layout");
  return { success: true };
}

export async function deleteTag(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin", "layout");
  revalidatePath("/en", "layout");
  revalidatePath("/zh", "layout");
  return { success: true };
}

export async function fetchAllTags(): Promise<TagWithCount[]> {
  const supabase = await createClient();

  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .order("name");

  if (!tags || tags.length === 0) return [];

  const result: TagWithCount[] = [];
  for (const tag of tags) {
    const { count } = await supabase
      .from("article_tags")
      .select("article_id", { count: "exact", head: true })
      .eq("tag_id", tag.id);

    result.push({ ...(tag as Tag), postCount: count ?? 0 });
  }

  return result;
}
