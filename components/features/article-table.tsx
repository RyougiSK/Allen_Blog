"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { publishArticle, unpublishArticle, deleteArticle } from "@/lib/actions/articles";
import type { ArticleWithTags } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ArticleTable({ articles }: { articles: ArticleWithTags[] }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Title</th>
            <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">EN</th>
            <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">中文</th>
            <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Status</th>
            <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Tags</th>
            <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Updated</th>
            <th className="text-right text-xs font-medium text-text-tertiary px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArticleRow({ article }: { article: ArticleWithTags }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = article.en?.title || article.zh?.title || "Untitled";

  async function handleTogglePublish() {
    setLoading(true);
    if (article.status === "published") {
      await unpublishArticle(article.id);
    } else {
      const result = await publishArticle(article.id);
      if (!result.success) {
        alert(result.error);
        setLoading(false);
        return;
      }
    }
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setLoading(true);
    await deleteArticle(article.id);
    router.refresh();
    setLoading(false);
  }

  function langDot(completed: boolean) {
    return completed ? "bg-emerald-400" : "bg-text-quaternary";
  }

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-surface/30 transition-colors">
      <td className="px-4 py-3">
        <Link
          href={`/admin/posts/${article.id}/edit`}
          className="text-sm font-medium hover:text-accent-warm transition-colors"
        >
          {title}
        </Link>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${langDot(!!article.en?.completed)}`}
          title={article.en?.completed ? "EN complete" : "EN incomplete"}
        />
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${langDot(!!article.zh?.completed)}`}
          title={article.zh?.completed ? "ZH complete" : "ZH incomplete"}
        />
      </td>
      <td className="px-4 py-3">
        <Badge variant={article.status === "published" ? "success" : "warning"}>
          {article.status === "published" ? "Published" : "Draft"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {article.tags.map((tag) => (
            <Badge key={tag.id}>{tag.name}{tag.name_zh ? ` — ${tag.name_zh}` : ""}</Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-text-tertiary whitespace-nowrap">
        {format(parseISO(article.updated_at), "MMM d, yyyy")}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTogglePublish}
            disabled={loading}
            title={article.status === "published" ? "Unpublish" : "Publish"}
          >
            {article.status === "published" ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </Button>
          <Link href={`/admin/posts/${article.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
