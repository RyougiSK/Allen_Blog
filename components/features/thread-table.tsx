"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TagPicker } from "@/components/features/tag-picker";
import { useToast } from "@/lib/hooks/use-toast";
import {
  updateThread,
  deleteThread,
  publishThread,
  unpublishThread,
} from "@/lib/actions/threads";
import type { ThreadWithTags, Tag, ThreadStatus } from "@/lib/types";

interface ThreadTableProps {
  threads: ThreadWithTags[];
  allTags: Tag[];
}

export function ThreadTable({ threads, allTags }: ThreadTableProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEn, setEditEn] = useState("");
  const [editZh, setEditZh] = useState("");
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<ThreadStatus>("draft");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; preview: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  function startEdit(thread: ThreadWithTags) {
    setEditingId(thread.id);
    setEditEn(thread.content_en);
    setEditZh(thread.content_zh);
    setEditTagIds(thread.tags.map((t) => t.id));
    setEditStatus(thread.status);
  }

  async function handleSaveEdit(id: string) {
    await updateThread(id, {
      content_en: editEn,
      content_zh: editZh,
      tag_ids: editTagIds,
      status: editStatus,
    });
    setEditingId(null);
    addToast({ message: "Thread updated", variant: "success" });
    router.refresh();
  }

  async function handleTogglePublish(thread: ThreadWithTags) {
    if (thread.status === "published") {
      await unpublishThread(thread.id);
      addToast({ message: "Thread unpublished", variant: "success" });
    } else {
      const result = await publishThread(thread.id);
      if (!result.success) {
        addToast({ message: result.error ?? "Failed", variant: "error" });
        return;
      }
      addToast({ message: "Thread published", variant: "success" });
    }
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteThread(deleteTarget.id);
    setDeleteTarget(null);
    setDeleting(false);
    addToast({ message: "Thread deleted", variant: "success" });
    router.refresh();
  }

  function preview(thread: ThreadWithTags) {
    const text = thread.content_en || thread.content_zh;
    return text.length > 80 ? text.slice(0, 80) + "…" : text;
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">
              Content
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">
              Lang
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">
              Status
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">
              Tags
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">
              Date
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-text-tertiary">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {threads.map((thread) => (
            <tr
              key={thread.id}
              className={`border-b border-border last:border-b-0 transition-colors duration-[var(--duration-fast)] ${
                editingId === thread.id
                  ? "bg-surface ring-1 ring-accent-warm/20"
                  : "hover:bg-surface/30"
              }`}
            >
              {editingId === thread.id ? (
                <td colSpan={6} className="px-4 py-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
                    <div>
                      <label className="block text-xs text-text-quaternary mb-1">English</label>
                      <Textarea
                        value={editEn}
                        onChange={(e) => setEditEn(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-quaternary mb-1">中文</label>
                      <Textarea
                        value={editZh}
                        onChange={(e) => setEditZh(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <TagPicker allTags={allTags} selectedIds={editTagIds} onChange={setEditTagIds} />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as ThreadStatus)}
                      className="rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-warm/50"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                    <Button size="sm" onClick={() => handleSaveEdit(thread.id)}>
                      <Check className="h-3.5 w-3.5 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                  </div>
                </td>
              ) : (
                <>
                  <td className="px-4 py-2.5 max-w-xs">
                    <span className="text-text-primary text-sm line-clamp-2">
                      {preview(thread)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          thread.content_en.trim() ? "bg-emerald-400" : "bg-text-quaternary"
                        }`}
                        title="EN"
                      />
                      <span
                        className={`h-2 w-2 rounded-full ${
                          thread.content_zh.trim() ? "bg-emerald-400" : "bg-text-quaternary"
                        }`}
                        title="中文"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={thread.status === "published" ? "success" : "default"}>
                      {thread.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {thread.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-text-tertiary"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-text-quaternary text-xs">
                      {new Date(thread.created_at).toISOString().slice(0, 10)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip
                        label={thread.status === "published" ? "Unpublish" : "Publish"}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(thread)}
                        >
                          {thread.status === "published" ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </Tooltip>
                      <Tooltip label="Edit">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(thread)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <Button
                          variant="ghost-danger"
                          size="icon"
                          onClick={() =>
                            setDeleteTarget({ id: thread.id, preview: preview(thread) })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
          {threads.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-surface border border-border">
                    <MessageSquare className="h-6 w-6 text-text-quaternary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">No threads yet</p>
                    <p className="mt-1 text-xs text-text-tertiary">
                      Create your first thread using the form above.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete thread?"
        description={
          deleteTarget
            ? `"${deleteTarget.preview}" will be permanently deleted.`
            : ""
        }
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
