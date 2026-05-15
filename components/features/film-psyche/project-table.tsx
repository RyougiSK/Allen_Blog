"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ArrowRight } from "lucide-react";
import { deleteProject } from "@/lib/actions/film-psyche";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/hooks/use-toast";
import type { FilmProjectWithCounts } from "@/lib/types/film-psyche";
import {
  STATUS_LABELS,
  STATUS_BADGE_VARIANT,
  WORK_TYPE_OPTIONS,
} from "@/lib/types/film-psyche";

interface ProjectTableProps {
  projects: FilmProjectWithCounts[];
}

export function ProjectTable({ projects }: ProjectTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { addToast } = useToast();

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteProject(deleteId);
    if (result.success) {
      addToast({ variant: "success", message: "项目已删除" });
    } else {
      addToast({ variant: "error", message: result.error ?? "删除失败" });
    }
    setDeleteId(null);
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
        <p className="text-text-tertiary text-sm">还没有分析项目</p>
        <Link
          href="/admin/film-psyche/new"
          className="mt-3 text-sm text-accent-warm hover:underline"
        >
          创建第一个项目 →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/30">
              <th className="px-4 py-3 text-left font-medium text-text-tertiary">
                作品
              </th>
              <th className="px-4 py-3 text-left font-medium text-text-tertiary">
                类型
              </th>
              <th className="px-4 py-3 text-left font-medium text-text-tertiary">
                状态
              </th>
              <th className="px-4 py-3 text-center font-medium text-text-tertiary">
                角色
              </th>
              <th className="px-4 py-3 text-center font-medium text-text-tertiary">
                场景
              </th>
              <th className="px-4 py-3 text-right font-medium text-text-tertiary">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border/50 hover:bg-surface/20"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-text-primary">{p.title}</p>
                    {p.original_title && (
                      <p className="text-xs text-text-quaternary">
                        {p.original_title}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {WORK_TYPE_OPTIONS.find((o) => o.value === p.work_type)
                    ?.label ?? p.work_type}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_BADGE_VARIANT[p.status]}>
                    {STATUS_LABELS[p.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center text-text-secondary">
                  {p.character_count}
                </td>
                <td className="px-4 py-3 text-center text-text-secondary">
                  {p.scene_count}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setDeleteId(p.id)}
                      className="rounded p-1.5 text-text-quaternary hover:bg-danger/10 hover:text-danger transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/admin/film-psyche/${p.id}/setup`}
                      className="flex items-center gap-1 rounded px-2 py-1 text-accent-warm hover:bg-surface transition-colors"
                    >
                      继续
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="删除分析项目"
        description="确定删除此项目？所有角色、场景和 AI 审查记录都将被永久删除。"
        variant="danger"
        confirmLabel="删除"
        cancelLabel="取消"
      />
    </>
  );
}
