import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ArticleTable } from "@/components/features/article-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { ArticleWithTags, Tag } from "@/lib/types";

export default async function AdminPostsPage() {
  const supabase = await createClient();

  const { data: rawArticles } = await supabase
    .from("articles")
    .select("*, article_tags(tag_id, tags(*))")
    .order("updated_at", { ascending: false });

  const articles: ArticleWithTags[] = (rawArticles ?? []).map((a) => ({
    ...a,
    tags: (a.article_tags ?? []).map(
      (at: { tag_id: string; tags: Tag }) => at.tags,
    ),
    article_tags: undefined,
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Articles</h1>
        <Link href="/admin/posts/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Article
          </Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <p className="text-text-tertiary mb-4">No articles yet.</p>
          <Link href="/admin/posts/new">
            <Button>Create your first article</Button>
          </Link>
        </div>
      ) : (
        <ArticleTable articles={articles} />
      )}
    </div>
  );
}
