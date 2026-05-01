"use server";

import { createClient } from "@/utils/supabase/server";

export interface SearchResult {
  id: string;
  type: "article" | "thread" | "tag" | "category" | "subscriber";
  title: string;
  subtitle?: string;
  href: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const q = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  const [articlesRes, threadsRes, tagsRes, categoriesRes, subscribersRes] =
    await Promise.all([
      supabase
        .from("articles")
        .select("id, en, zh, status")
        .or(`en->>title.ilike.%${q}%,zh->>title.ilike.%${q}%`)
        .limit(5),
      supabase
        .from("threads")
        .select("id, content_en, content_zh, status")
        .or(`content_en.ilike.%${q}%,content_zh.ilike.%${q}%`)
        .limit(3),
      supabase
        .from("tags")
        .select("id, name, name_zh, slug")
        .or(`name.ilike.%${q}%,name_zh.ilike.%${q}%`)
        .limit(3),
      supabase
        .from("categories")
        .select("id, name, name_zh, slug")
        .or(`name.ilike.%${q}%,name_zh.ilike.%${q}%`)
        .limit(3),
      supabase
        .from("subscribers")
        .select("id, email, status")
        .ilike("email", `%${q}%`)
        .limit(3),
    ]);

  if (articlesRes.data) {
    for (const a of articlesRes.data) {
      const en = a.en as { title: string };
      const zh = a.zh as { title: string };
      results.push({
        id: a.id,
        type: "article",
        title: en.title || zh.title || "Untitled",
        subtitle: a.status,
        href: `/admin/posts/${a.id}/edit`,
      });
    }
  }

  if (threadsRes.data) {
    for (const t of threadsRes.data) {
      results.push({
        id: t.id,
        type: "thread",
        title:
          (t.content_en || t.content_zh || "").slice(0, 60) +
          ((t.content_en || t.content_zh || "").length > 60 ? "..." : ""),
        subtitle: t.status,
        href: `/admin/threads`,
      });
    }
  }

  if (tagsRes.data) {
    for (const tag of tagsRes.data) {
      results.push({
        id: tag.id,
        type: "tag",
        title: `${tag.name} / ${tag.name_zh}`,
        href: `/admin/tags`,
      });
    }
  }

  if (categoriesRes.data) {
    for (const cat of categoriesRes.data) {
      results.push({
        id: cat.id,
        type: "category",
        title: `${cat.name} / ${cat.name_zh}`,
        href: `/admin/categories`,
      });
    }
  }

  if (subscribersRes.data) {
    for (const sub of subscribersRes.data) {
      results.push({
        id: sub.id,
        type: "subscriber",
        title: sub.email,
        subtitle: sub.status,
        href: `/admin/subscribers`,
      });
    }
  }

  return results;
}
