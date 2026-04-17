"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateTag, deleteTag } from "@/lib/actions/tags";
import type { TagWithCount } from "@/lib/types";

interface TagTableProps {
  tags: TagWithCount[];
}

export function TagTable({ tags }: TagTableProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameZh, setEditNameZh] = useState("");

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    await updateTag(id, { name: editName.trim(), name_zh: editNameZh.trim() });
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string, name: string, count: number) {
    const msg =
      count > 0
        ? `Delete "${name}"? It will be removed from ${count} article(s).`
        : `Delete "${name}"?`;
    if (!confirm(msg)) return;
    await deleteTag(id);
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
              className="border-b border-border last:border-b-0"
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
                <div className="flex items-center justify-end gap-1">
                  {editingId === tag.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleSaveEdit(tag.id)}
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setEditingId(tag.id);
                          setEditName(tag.name);
                          setEditNameZh(tag.name_zh);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() =>
                          handleDelete(tag.id, tag.name, tag.postCount)
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5 text-danger" />
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {tags.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-8 text-center text-text-tertiary text-sm"
              >
                No tags yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
