"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ChevronUp, ChevronDown, Check, X, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/lib/hooks/use-toast";
import {
  updateWritingType,
  deleteWritingType,
  reorderWritingTypes,
} from "@/lib/actions/writing-types";
import type { WritingTypeWithCount } from "@/lib/types";

interface WritingTypeTableProps {
  types: WritingTypeWithCount[];
}

export function WritingTypeTable({ types: initial }: WritingTypeTableProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [types, setTypes] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameZh, setEditNameZh] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; count: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleSaveEdit(id: string) {
    await updateWritingType(id, { name: editName, name_zh: editNameZh, description: editDesc });
    setEditingId(null);
    addToast({ message: "Writing type updated", variant: "success" });
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteWritingType(deleteTarget.id);
    if (result.success) {
      addToast({ message: "Writing type deleted. Articles reassigned to Blog.", variant: "success" });
    } else {
      addToast({ message: result.error ?? "Failed to delete", variant: "error" });
    }
    setDeleteTarget(null);
    setDeleting(false);
    router.refresh();
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= types.length) return;
    const newOrder = [...types];
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    setTypes(newOrder);
    await reorderWritingTypes(newOrder.map((t) => t.id));
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">Order</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">Name (EN — 中文)</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">Slug</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">Description</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-text-tertiary">Articles</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-text-tertiary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {types.map((wt, i) => (
            <tr
              key={wt.id}
              className={`border-b border-border last:border-b-0 transition-colors duration-[var(--duration-fast)] ${
                editingId === wt.id
                  ? "bg-surface ring-1 ring-accent-warm/20"
                  : "hover:bg-surface/30"
              }`}
            >
              <td className="px-4 py-2.5">
                <div className="flex gap-0.5">
                  <button
                    onClick={() => handleMove(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    className="p-1.5 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-surface disabled:opacity-50 transition-colors"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleMove(i, 1)}
                    disabled={i === types.length - 1}
                    aria-label="Move down"
                    className="p-1.5 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-surface disabled:opacity-50 transition-colors"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </td>
              <td className="px-4 py-2.5">
                {editingId === wt.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm"
                      placeholder="EN"
                    />
                    <Input
                      value={editNameZh}
                      onChange={(e) => setEditNameZh(e.target.value)}
                      className="h-7 text-sm"
                      placeholder="中文"
                    />
                  </div>
                ) : (
                  <span className="text-text-primary font-medium">
                    {wt.name}{wt.name_zh ? ` — ${wt.name_zh}` : ""}
                    {wt.is_default && (
                      <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-accent-warm/10 text-accent-warm">
                        Default
                      </span>
                    )}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <span className="font-mono text-xs text-text-quaternary">{wt.slug}</span>
              </td>
              <td className="px-4 py-2.5">
                {editingId === wt.id ? (
                  <Input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="h-7 text-sm"
                  />
                ) : (
                  <span className="text-text-secondary text-xs">{wt.description || "—"}</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-right">
                <span className="text-text-quaternary">{wt.articleCount}</span>
              </td>
              <td className="px-4 py-2.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  {editingId === wt.id ? (
                    <>
                      <Tooltip label="Save">
                        <Button variant="ghost" size="icon" aria-label="Save" onClick={() => handleSaveEdit(wt.id)}>
                          <Check className="h-4 w-4 text-emerald-400" />
                        </Button>
                      </Tooltip>
                      <Tooltip label="Cancel">
                        <Button variant="ghost" size="icon" aria-label="Cancel" onClick={() => setEditingId(null)}>
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
                            setEditingId(wt.id);
                            setEditName(wt.name);
                            setEditNameZh(wt.name_zh);
                            setEditDesc(wt.description);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                      {wt.is_default ? (
                        <Tooltip label="Default type">
                          <Button variant="ghost" size="icon" aria-label="Cannot delete" disabled>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip label="Delete">
                          <Button
                            variant="ghost-danger"
                            size="icon"
                            aria-label="Delete"
                            onClick={() =>
                              setDeleteTarget({ id: wt.id, name: wt.name, count: wt.articleCount })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {types.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-surface border border-border">
                    <Layers className="h-6 w-6 text-text-quaternary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">No writing types yet</p>
                    <p className="mt-1 text-xs text-text-tertiary">
                      Create your first writing type using the form above.
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
            ? `${deleteTarget.count} article(s) will be reassigned to Blog.`
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
