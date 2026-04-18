"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { notifySubscribersOfNewArticle } from "@/lib/actions/notifications";
import type {
  ActionResult,
  ArticleFormData,
  ArticleLang,
  ContentLocale,
  Article,
} from "@/lib/types";

function buildLangJson(lang: ArticleLang) {
  return {
    title: lang.title,
    subtitle: lang.subtitle,
    slug: lang.slug,
    content: lang.content,
    excerpt: lang.excerpt,
    completed: lang.completed,
    meta: {
      meta_title: lang.meta.meta_title,
      meta_description: lang.meta.meta_description,
      keywords: lang.meta.keywords,
    },
  };
}

function revalidateAll() {
  revalidatePath("/en", "layout");
  revalidatePath("/zh", "layout");
  revalidatePath("/admin", "layout");
}

export async function createArticle(
  data: ArticleFormData,
): Promise<ActionResult & { articleId?: string }> {
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from("articles")
    .insert({
      status: data.status,
      cover_image: data.cover_image,
      category_id: data.category_id,
      writing_type_id: data.writing_type_id,
      en: buildLangJson(data.en),
      zh: buildLangJson(data.zh),
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  if (data.tag_ids.length > 0) {
    await supabase
      .from("article_tags")
      .insert(
        data.tag_ids.map((tag_id) => ({ article_id: article.id, tag_id })),
      );
  }

  if (data.status === "published") {
    notifySubscribersOfNewArticle(article.id).catch(console.error);
  }

  revalidateAll();
  redirect("/admin/posts");
}

export async function updateArticle(
  id: string,
  data: ArticleFormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("articles")
    .update({
      status: data.status,
      cover_image: data.cover_image,
      category_id: data.category_id,
      writing_type_id: data.writing_type_id,
      en: buildLangJson(data.en),
      zh: buildLangJson(data.zh),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await supabase.from("article_tags").delete().eq("article_id", id);
  if (data.tag_ids.length > 0) {
    await supabase
      .from("article_tags")
      .insert(data.tag_ids.map((tag_id) => ({ article_id: id, tag_id })));
  }

  revalidateAll();
  redirect("/admin/posts");
}

export async function autoSaveArticle(
  id: string,
  data: Partial<ArticleFormData>,
): Promise<ActionResult> {
  const supabase = await createClient();

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.en) updatePayload.en = buildLangJson(data.en);
  if (data.zh) updatePayload.zh = buildLangJson(data.zh);
  if (data.cover_image !== undefined)
    updatePayload.cover_image = data.cover_image;
  if (data.category_id !== undefined)
    updatePayload.category_id = data.category_id;
  if (data.writing_type_id !== undefined)
    updatePayload.writing_type_id = data.writing_type_id;

  const { error } = await supabase
    .from("articles")
    .update(updatePayload)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  if (data.tag_ids) {
    await supabase.from("article_tags").delete().eq("article_id", id);
    if (data.tag_ids.length > 0) {
      await supabase
        .from("article_tags")
        .insert(data.tag_ids.map((tag_id) => ({ article_id: id, tag_id })));
    }
  }

  return { success: true };
}

export async function publishArticle(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: article, error: fetchError } = await supabase
    .from("articles")
    .select("en, zh")
    .eq("id", id)
    .single();

  if (fetchError) return { success: false, error: fetchError.message };

  const en = article.en as ArticleLang;
  const zh = article.zh as ArticleLang;

  if (!en.completed || !zh.completed) {
    return {
      success: false,
      error: "Both language versions must be completed before publishing.",
    };
  }

  const { error } = await supabase
    .from("articles")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  notifySubscribersOfNewArticle(id).catch(console.error);

  revalidateAll();
  return { success: true };
}

export async function unpublishArticle(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("articles")
    .update({ status: "draft", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidateAll();
  return { success: true };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidateAll();
  return { success: true };
}

// --- Query helpers (used by server components) ---

export async function fetchArticleBySlug(
  _locale: ContentLocale,
  slug: string,
): Promise<Article | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("en->>slug", slug)
    .single();

  if (error || !data) return null;
  return data as Article;
}

export async function fetchArticleById(id: string): Promise<Article | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Article;
}

export async function fetchArticleWithTags(
  id: string,
): Promise<(Article & { tags: { id: string; name: string; slug: string }[] }) | null> {
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !article) return null;

  const { data: tagRows } = await supabase
    .from("article_tags")
    .select("tag_id, tags(id, name, slug)")
    .eq("article_id", id);

  const tags = (tagRows ?? []).map((r: Record<string, unknown>) => r.tags as { id: string; name: string; slug: string });

  return { ...(article as Article), tags };
}

export async function fetchPublishedArticles(
  locale: ContentLocale,
  options: { limit?: number; offset?: number; tagSlug?: string } = {},
): Promise<{ articles: Article[]; total: number }> {
  const supabase = await createClient();
  const { limit = 10, offset = 0, tagSlug } = options;
  let query = supabase
    .from("articles")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .neq("en->>slug", "")
    .not("en->>slug", "is", null);

  if (tagSlug) {
    const { data: tag } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tagSlug)
      .single();

    if (tag) {
      const { data: articleIds } = await supabase
        .from("article_tags")
        .select("article_id")
        .eq("tag_id", tag.id);

      const ids = (articleIds ?? []).map((r) => r.article_id);
      if (ids.length === 0) return { articles: [], total: 0 };
      query = query.in("id", ids);
    } else {
      return { articles: [], total: 0 };
    }
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { articles: [], total: 0 };
  return { articles: (data ?? []) as Article[], total: count ?? 0 };
}

export async function fetchAllArticles(): Promise<Article[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false });

  return (data ?? []) as Article[];
}

export async function fetchArticlesForSitemap(): Promise<
  Pick<Article, "en" | "zh" | "updated_at" | "status">[]
> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("articles")
    .select("en, zh, updated_at, status")
    .eq("status", "published");

  return (data ?? []) as Pick<Article, "en" | "zh" | "updated_at" | "status">[];
}
