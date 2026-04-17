"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { slugify } from "@/lib/utils";
import type { ActionResult, Tag } from "@/lib/types";

export async function createTag(
  formData: FormData
): Promise<ActionResult & { tag?: Tag }> {
  const supabase = await createClient();
  const name = (formData.get("name") as string).trim();

  if (!name) return { success: false, error: "Tag name is required" };

  const { data: tag, error } = await supabase
    .from("tags")
    .insert({ name, slug: slugify(name) })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/posts");
  return { success: true, tag };
}

export async function deleteTag(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/posts");
  return { success: true };
}
