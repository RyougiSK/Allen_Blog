"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Check, X, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/lib/hooks/use-toast";
import { updateTag, deleteTag } from "@/lib/actions/tags";
import type { TagWithCount } from "@/lib/types";

interface TagTableProps {
  tags: TagWithCount[];
}

export function TagTable({ tags }: TagTableProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameZh, setEditNameZh] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; count: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    await updateTag(id, { name: editName.trim(), name_zh: editNameZh.trim() });
    setEditingId(null);
    addToast({ message: "Tag updated", variant: "success" });
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteTag(deleteTarget.id);
    setDeleteTarget(null);
    setDeleting(false);
    addToast({ message: "Tag deleted", variant: "success" });
    router.refresh();
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">
              Name (EN — 中文)
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">
              Slug
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-text-tertiary">
              Articles
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-text-tertiary">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr
              key={tag.id}
              className={`border-b border-border last:border-b-0 transition-colors duration-[var(--duration-fast)] ${
                editingId === tag.id
                  ? "bg-surface ring-1 ring-accent-warm/20"
                  : "hover:bg-surface/30"
              }`}
            >
              <td className="px-4 py-2.5">
                {editingId === tag.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(tag.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-7 text-sm"
                      placeholder="EN"
                      autoFocus
                    />
                    <Input
                      value={editNameZh}
                      onChange={(e) => setEditNameZh(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(tag.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-7 text-sm"
                      placeholder="中文"
                    />
                  </div>
                ) : (
                  <span className="text-text-primary font-medium">
                    {tag.name}{tag.name_zh ? ` — ${tag.name_zh}` : ""}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <span className="font-mono text-xs text-text-quaternary">
                  {tag.slug}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right">
                <span className="text-text-quaternary">{tag.postCount}</span>
              </td>
              <td className="px-4 py-2.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  {editingId === tag.id ? (
                    <>
                      <Tooltip label="Save">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Save"
                          onClick={() => handleSaveEdit(tag.id)}
                        >
                          <Check className="h-4 w-4 text-emerald-400" />
                        </Button>
                      </Tooltip>
                      <Tooltip label="Cancel">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Cancel"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip label="Edit">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit"
                          onClick={() => {
                            setEditingId(tag.id);
                            setEditName(tag.name);
                            setEditNameZh(tag.name_zh);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <Button
                          variant="ghost-danger"
                          size="icon"
                          aria-label="Delete"
                          onClick={() =>
                            setDeleteTarget({ id: tag.id, name: tag.name, count: tag.postCount })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {tags.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-surface border border-border">
                    <Tags className="h-6 w-6 text-text-quaternary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">No tags yet</p>
                    <p className="mt-1 text-xs text-text-tertiary">
                      Create your first tag using the form above.
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
        title={`Delete "${deleteTarget?.name ?? ""}"?`}
        description={
          deleteTarget && deleteTarget.count > 0
            ? `It will be removed from ${deleteTarget.count} article(s).`
            : "This action cannot be undone."
        }
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
