"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { ActionResult } from "@/lib/types";

export async function createPost(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const published = formData.get("published") === "true";
  const tagIds = formData.getAll("tag_ids") as string[];

  const { data: post, error } = await supabase
    .from("posts")
    .insert({ title, slug, content, excerpt: excerpt || null, published })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  if (tagIds.length > 0) {
    await supabase
      .from("post_tags")
      .insert(tagIds.map((tag_id) => ({ post_id: post.id, tag_id })));
  }

  revalidatePath("/");
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function updatePost(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const published = formData.get("published") === "true";
  const tagIds = formData.getAll("tag_ids") as string[];

  const { error } = await supabase
    .from("posts")
    .update({
      title,
      slug,
      content,
      excerpt: excerpt || null,
      published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  // Replace tags
  await supabase.from("post_tags").delete().eq("post_id", id);
  if (tagIds.length > 0) {
    await supabase
      .from("post_tags")
      .insert(tagIds.map((tag_id) => ({ post_id: id, tag_id })));
  }

  revalidatePath("/");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/posts");
  return { success: true };
}

export async function togglePublish(id: string, published: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/posts");
  return { success: true };
}
