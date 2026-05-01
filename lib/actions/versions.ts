"use server";

import { createClient } from "@/utils/supabase/server";
import type { ArticleLang } from "@/lib/types";

export interface ArticleVersion {
  id: string;
  article_id: string;
  version_number: number;
  en: ArticleLang;
  zh: ArticleLang;
  trigger: "auto_save" | "manual" | "publish";
  created_at: string;
}

export async function saveVersion(
  articleId: string,
  en: ArticleLang,
  zh: ArticleLang,
  trigger: "auto_save" | "manual" | "publish",
): Promise<void> {
  const supabase = await createClient();

  if (trigger === "auto_save") {
    const { data: latest } = await supabase
      .from("article_versions")
      .select("created_at")
      .eq("article_id", articleId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (latest) {
      const lastTime = new Date(latest.created_at).getTime();
      const now = Date.now();
      if (now - lastTime < 5 * 60 * 1000) return;
    }
  }

  const { data: countData } = await supabase
    .from("article_versions")
    .select("id", { count: "exact" })
    .eq("article_id", articleId);

  const versionNumber = (countData?.length ?? 0) + 1;

  await supabase.from("article_versions").insert({
    article_id: articleId,
    version_number: versionNumber,
    en,
    zh,
    trigger,
  });

  if (versionNumber > 50) {
    const { data: oldest } = await supabase
      .from("article_versions")
      .select("id")
      .eq("article_id", articleId)
      .order("created_at", { ascending: true })
      .limit(versionNumber - 50);

    if (oldest && oldest.length > 0) {
      await supabase
        .from("article_versions")
        .delete()
        .in("id", oldest.map((v) => v.id));
    }
  }
}

export async function fetchVersionHistory(
  articleId: string,
): Promise<ArticleVersion[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("article_versions")
    .select("*")
    .eq("article_id", articleId)
    .order("created_at", { ascending: false })
    .limit(30);

  return (data ?? []) as ArticleVersion[];
}

export async function restoreVersion(
  articleId: string,
  versionId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: version, error: fetchError } = await supabase
    .from("article_versions")
    .select("en, zh")
    .eq("id", versionId)
    .single();

  if (fetchError || !version) {
    return { success: false, error: "Version not found" };
  }

  const { error } = await supabase
    .from("articles")
    .update({
      en: version.en,
      zh: version.zh,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  if (error) return { success: false, error: error.message };

  return { success: true };
}
