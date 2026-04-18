"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { ActionResult, ThreadFormData, ThreadWithTags, Tag } from "@/lib/types";

function revalidateAll() {
  revalidatePath("/en", "layout");
  revalidatePath("/zh", "layout");
  revalidatePath("/admin", "layout");
}

export async function createThread(
  data: ThreadFormData,
): Promise<ActionResult & { threadId?: string }> {
  const supabase = await createClient();

  const { data: thread, error } = await supabase
    .from("threads")
    .insert({
      content_en: data.content_en,
      content_zh: data.content_zh,
      status: data.status,
    })
    .select("id")
    .single();

  if (error || !thread) return { success: false, error: error?.message ?? "Create failed" };

  if (data.tag_ids.length > 0) {
    await supabase
      .from("thread_tags")
      .insert(data.tag_ids.map((tag_id) => ({ thread_id: thread.id, tag_id })));
  }

  revalidateAll();
  return { success: true, threadId: thread.id };
}

export async function updateThread(
  id: string,
  data: ThreadFormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("threads")
    .update({
      content_en: data.content_en,
      content_zh: data.content_zh,
      status: data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await supabase.from("thread_tags").delete().eq("thread_id", id);
  if (data.tag_ids.length > 0) {
    await supabase
      .from("thread_tags")
      .insert(data.tag_ids.map((tag_id) => ({ thread_id: id, tag_id })));
  }

  revalidateAll();
  return { success: true };
}

export async function deleteThread(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("threads").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidateAll();
  return { success: true };
}

export async function publishThread(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: thread } = await supabase
    .from("threads")
    .select("content_en, content_zh")
    .eq("id", id)
    .single();

  if (!thread) return { success: false, error: "Thread not found" };
  if (!thread.content_en.trim() && !thread.content_zh.trim()) {
    return { success: false, error: "At least one language must have content" };
  }

  const { error } = await supabase
    .from("threads")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidateAll();
  return { success: true };
}

export async function unpublishThread(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("threads")
    .update({ status: "draft", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidateAll();
  return { success: true };
}

export async function fetchAllThreads(): Promise<ThreadWithTags[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("threads")
    .select("*, thread_tags(tag_id, tags(*))")
    .order("updated_at", { ascending: false });

  return (data ?? []).map((t) => {
    const { thread_tags, ...rest } = t as Record<string, unknown> & {
      thread_tags?: { tag_id: string; tags: Tag }[];
    };
    return {
      ...rest,
      tags: (thread_tags ?? []).map((tt) => tt.tags),
    } as ThreadWithTags;
  });
}

export async function fetchPublishedThreads(options: {
  limit?: number;
  offset?: number;
  tagSlug?: string;
}): Promise<{ threads: ThreadWithTags[]; total: number }> {
  const { limit = 20, offset = 0, tagSlug } = options;
  const supabase = await createClient();

  let query = supabase
    .from("threads")
    .select("*, thread_tags(tag_id, tags(*))", { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (tagSlug) {
    const { data: tagData } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tagSlug)
      .single();

    if (tagData) {
      const { data: threadIds } = await supabase
        .from("thread_tags")
        .select("thread_id")
        .eq("tag_id", tagData.id);

      const ids = (threadIds ?? []).map((r) => r.thread_id);
      if (ids.length > 0) {
        query = query.in("id", ids);
      } else {
        return { threads: [], total: 0 };
      }
    }
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count } = await query;

  const threads: ThreadWithTags[] = (data ?? []).map((t) => {
    const { thread_tags, ...rest } = t as Record<string, unknown> & {
      thread_tags?: { tag_id: string; tags: Tag }[];
    };
    return {
      ...rest,
      tags: (thread_tags ?? []).map((tt) => tt.tags),
    } as ThreadWithTags;
  });

  return { threads, total: count ?? 0 };
}

export async function fetchRecentThreads(limit = 3): Promise<ThreadWithTags[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("threads")
    .select("*, thread_tags(tag_id, tags(*))")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((t) => {
    const { thread_tags, ...rest } = t as Record<string, unknown> & {
      thread_tags?: { tag_id: string; tags: Tag }[];
    };
    return {
      ...rest,
      tags: (thread_tags ?? []).map((tt) => tt.tags),
    } as ThreadWithTags;
  });
}
