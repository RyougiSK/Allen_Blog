import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ArticleForm } from "@/components/features/article-form";
import type { ArticleWithTags, Tag } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [articleResult, tagsResult] = await Promise.all([
    supabase
      .from("articles")
      .select("*, article_tags(tag_id, tags(*))")
      .eq("id", id)
      .single(),
    supabase.from("tags").select("*").order("name"),
  ]);

  if (!articleResult.data) notFound();

  const rawArticle = articleResult.data;
  const article: ArticleWithTags = {
    ...rawArticle,
    tags: (rawArticle.article_tags ?? []).map(
      (at: { tag_id: string; tags: Tag }) => at.tags,
    ),
  };

  const tags: Tag[] = tagsResult.data ?? [];

  return <ArticleForm article={article} tags={tags} />;
}
