"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/lib/hooks/use-toast";
import {
  publishArticle,
  unpublishArticle,
  deleteArticle,
  bulkPublish,
  bulkUnpublish,
  bulkDelete,
  quickUpdateTitle,
} from "@/lib/actions/articles";
import type { ArticleWithTags } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export function ArticleTable({ articles }: { articles: ArticleWithTags[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const allSelected = articles.length > 0 && selectedIds.size === articles.length;

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(articles.map((a) => a.id)));
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkPublish() {
    setBulkLoading(true);
    const result = await bulkPublish(Array.from(selectedIds));
    if (result.success) {
      addToast({
        message: `${result.published} published, ${result.skipped} skipped (incomplete)`,
        variant: "success",
      });
      setSelectedIds(new Set());
      router.refresh();
    }
    setBulkLoading(false);
  }

  async function handleBulkUnpublish() {
    setBulkLoading(true);
    await bulkUnpublish(Array.from(selectedIds));
    addToast({ message: `${selectedIds.size} articles unpublished`, variant: "success" });
    setSelectedIds(new Set());
    router.refresh();
    setBulkLoading(false);
  }

  async function handleBulkDelete() {
    setBulkLoading(true);
    await bulkDelete(Array.from(selectedIds));
    addToast({ message: `${selectedIds.size} articles deleted`, variant: "success" });
    setSelectedIds(new Set());
    setShowBulkDelete(false);
    router.refresh();
    setBulkLoading(false);
  }

  return (
    <div className="relative">
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-border accent-[var(--color-accent-warm)]"
                />
              </th>
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
              <ArticleRow
                key={article.id}
                article={article}
                selected={selectedIds.has(article.id)}
                onToggle={() => toggleOne(article.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {selectedIds.size > 0 && (
        <div className="sticky bottom-6 mt-4 mx-auto w-fit flex items-center gap-3 bg-bg-secondary border border-border rounded-[var(--radius-lg)] px-5 py-3 shadow-xl">
          <span className="text-sm text-text-secondary font-medium">
            {selectedIds.size} selected
          </span>
          <div className="w-px h-5 bg-border" />
          <Button size="sm" variant="outline" onClick={handleBulkPublish} disabled={bulkLoading}>
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Publish
          </Button>
          <Button size="sm" variant="outline" onClick={handleBulkUnpublish} disabled={bulkLoading}>
            <EyeOff className="h-3.5 w-3.5 mr-1.5" />
            Unpublish
          </Button>
          <Button size="sm" variant="ghost-danger" onClick={() => setShowBulkDelete(true)} disabled={bulkLoading}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={showBulkDelete}
        title={`Delete ${selectedIds.size} article${selectedIds.size > 1 ? "s" : ""}?`}
        description="This action cannot be undone. All selected articles will be permanently deleted."
        variant="danger"
        loading={bulkLoading}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowBulkDelete(false)}
      />
    </div>
  );
}

function ArticleRow({
  article,
  selected,
  onToggle,
}: {
  article: ArticleWithTags;
  selected: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const title = article.en?.title || article.zh?.title || "Untitled";

  function startEditing() {
    setEditValue(article.en?.title || "");
    setEditingTitle(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function saveTitle() {
    if (!editValue.trim() || editValue === article.en?.title) {
      setEditingTitle(false);
      return;
    }
    const result = await quickUpdateTitle(article.id, "en", editValue.trim());
    if (result.success) {
      addToast({ message: "Title updated", variant: "success" });
      router.refresh();
    } else {
      addToast({ message: result.error ?? "Failed", variant: "error" });
    }
    setEditingTitle(false);
  }

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
    <tr className={`border-b border-border last:border-b-0 transition-colors ${selected ? "bg-accent-warm/5" : "hover:bg-surface/30"}`}>
      <td className="w-10 px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="rounded border-border accent-[var(--color-accent-warm)]"
        />
      </td>
      <td className="px-4 py-3">
        {editingTitle ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle();
              if (e.key === "Escape") setEditingTitle(false);
            }}
            className="w-full text-sm font-medium bg-transparent border border-accent-warm/50 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-accent-warm/50"
          />
        ) : (
          <Link
            href={`/admin/posts/${article.id}/edit`}
            onDoubleClick={(e) => { e.preventDefault(); startEditing(); }}
            className="text-sm font-medium hover:text-accent-warm transition-colors"
            title="Double-click to edit title inline"
          >
            {title}
          </Link>
        )}
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
