"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/lib/hooks/use-toast";
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
            <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Lang</th>
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
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const title = article.en?.title || article.zh?.title || "Untitled";

  async function handleTogglePublish() {
    setLoading(true);
    if (article.status === "published") {
      await unpublishArticle(article.id);
      addToast({ message: "Article unpublished", variant: "success" });
    } else {
      const result = await publishArticle(article.id);
      if (!result.success) {
        addToast({ message: result.error ?? "Failed to publish", variant: "error" });
        setLoading(false);
        return;
      }
      addToast({ message: "Article published", variant: "success" });
    }
    router.refresh();
    setLoading(false);
  }

  async function handleConfirmDelete() {
    setLoading(true);
    await deleteArticle(article.id);
    setShowDeleteDialog(false);
    addToast({ message: "Article deleted", variant: "success" });
    router.refresh();
    setLoading(false);
  }

  const enDone = !!article.en?.completed;
  const zhDone = !!article.zh?.completed;

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
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[length:var(--text-micro)] font-medium ${
              enDone
                ? "bg-success/10 text-success"
                : "bg-surface text-text-quaternary"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${enDone ? "bg-success" : "bg-text-quaternary"}`} />
            EN
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[length:var(--text-micro)] font-medium ${
              zhDone
                ? "bg-success/10 text-success"
                : "bg-surface text-text-quaternary"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${zhDone ? "bg-success" : "bg-text-quaternary"}`} />
            中文
          </span>
        </div>
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
        <div className="flex items-center justify-end gap-2">
          <Tooltip label={article.status === "published" ? "Unpublish" : "Publish"}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTogglePublish}
              disabled={loading}
              aria-label={article.status === "published" ? "Unpublish" : "Publish"}
            >
              {article.status === "published" ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </Tooltip>
          <Tooltip label="Edit">
            <Link href={`/admin/posts/${article.id}/edit`}>
              <Button variant="ghost" size="icon" aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          </Tooltip>
          <Tooltip label="Delete">
            <Button
              variant="ghost-danger"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              disabled={loading}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
        <ConfirmDialog
          open={showDeleteDialog}
          title={`Delete "${title}"?`}
          description="This action cannot be undone."
          variant="danger"
          loading={loading}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      </td>
    </tr>
  );
}
