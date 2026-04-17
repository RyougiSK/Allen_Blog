"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ChevronUp, ChevronDown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/lib/actions/categories";
import type { CategoryWithCount } from "@/lib/types";

interface CategoryTableProps {
  categories: CategoryWithCount[];
}

export function CategoryTable({ categories: initial }: CategoryTableProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameZh, setEditNameZh] = useState("");
  const [editDesc, setEditDesc] = useState("");

  async function handleSaveEdit(id: string) {
    await updateCategory(id, { name: editName, name_zh: editNameZh, description: editDesc });
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string, name: string, count: number) {
    const msg =
      count > 0
        ? `Delete "${name}"? ${count} article(s) will become uncategorized.`
        : `Delete "${name}"?`;
    if (!confirm(msg)) return;
    await deleteCategory(id);
    router.refresh();
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const newOrder = [...categories];
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    setCategories(newOrder);
    await reorderCategories(newOrder.map((c) => c.id));
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">
              Order
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">
              Name (EN — 中文)
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">
              Slug
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">
              Description
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
          {categories.map((cat, i) => (
            <tr key={cat.id} className="border-b border-border last:border-b-0">
              <td className="px-4 py-2.5">
                <div className="flex gap-0.5">
                  <button
                    onClick={() => handleMove(i, -1)}
                    disabled={i === 0}
                    className="p-0.5 text-text-quaternary hover:text-text-primary disabled:opacity-30 transition-colors"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(i, 1)}
                    disabled={i === categories.length - 1}
                    className="p-0.5 text-text-quaternary hover:text-text-primary disabled:opacity-30 transition-colors"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
              <td className="px-4 py-2.5">
                {editingId === cat.id ? (
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
                    {cat.name}{cat.name_zh ? ` — ${cat.name_zh}` : ""}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <span className="font-mono text-xs text-text-quaternary">
                  {cat.slug}
                </span>
              </td>
              <td className="px-4 py-2.5">
                {editingId === cat.id ? (
                  <Input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="h-7 text-sm"
                  />
                ) : (
                  <span className="text-text-secondary text-xs">
                    {cat.description || "—"}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 text-right">
                <span className="text-text-quaternary">{cat.articleCount}</span>
              </td>
              <td className="px-4 py-2.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  {editingId === cat.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleSaveEdit(cat.id)}
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
                          setEditingId(cat.id);
                          setEditName(cat.name);
                          setEditNameZh(cat.name_zh);
                          setEditDesc(cat.description);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() =>
                          handleDelete(cat.id, cat.name, cat.articleCount)
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
          {categories.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary text-sm">
                No categories yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
