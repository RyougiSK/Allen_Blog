"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/lib/hooks/use-toast";
import { deleteAnalysis } from "@/lib/actions/analysis";
import type { AnalysisEntry } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface Props {
  analyses: AnalysisEntry[];
}

export function AnalysisTable({ analyses }: Props) {
  const router = useRouter();
  const { addToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteAnalysis(deleteTarget);
    setDeleting(false);
    setDeleteTarget(null);
    if (result.success) {
      addToast({ message: "已删除", variant: "success" });
    } else {
      addToast({ message: result.error ?? "删除失败", variant: "error" });
    }
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-16 text-text-tertiary">
        <p className="text-sm">暂无分析内容</p>
        <p className="text-xs mt-1">
          创建你的第一篇叙事分析吧。
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="text-left px-4 py-3 font-medium text-text-secondary">
                标题
              </th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary">
                作品
              </th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary">
                类型
              </th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary">
                更新时间
              </th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {analyses.map((a) => (
              <tr
                key={a.id}
                onClick={() => router.push(`/admin/analysis/${a.id}/edit`)}
                className="border-b border-border last:border-b-0 hover:bg-surface/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-text-primary">
                  {a.title || (
                    <span className="text-text-quaternary italic">未命名</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-secondary">{a.work_name}</td>
                <td className="px-4 py-3">
                  <Badge>{a.work_type}</Badge>
                </td>
                <td className="px-4 py-3 text-text-tertiary">
                  {formatDistanceToNow(new Date(a.updated_at), {
                    addSuffix: true,
                  })}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setDeleteTarget(a.id)}
                    className="flex items-center justify-center h-8 w-8 rounded-[var(--radius-md)] text-text-tertiary hover:text-danger hover:bg-surface transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除？"
        description="此操作无法撤销。"
        confirmLabel="删除"
        cancelLabel="取消"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
