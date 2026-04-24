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

  revalidatePath("/", "layout");
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

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteTag(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function fetchAllTags(): Promise<TagWithCount[]> {
  const supabase = await createClient();

  const { data: tags } = await supabase
    .from("tags")
    .select("*, article_tags(count)")
    .order("name");

  if (!tags || tags.length === 0) return [];

  return tags.map((tag) => {
    const postCount =
      (tag.article_tags as unknown as { count: number }[])?.[0]?.count ?? 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { article_tags: _at, ...rest } = tag;
    return { ...(rest as Tag), postCount };
  });
}
