"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TagPicker } from "@/components/features/tag-picker";
import { createThread } from "@/lib/actions/threads";
import type { Tag, ThreadStatus } from "@/lib/types";

interface ThreadComposerProps {
  allTags: Tag[];
}

export function ThreadComposer({ allTags }: ThreadComposerProps) {
  const router = useRouter();
  const [contentEn, setContentEn] = useState("");
  const [contentZh, setContentZh] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [status, setStatus] = useState<ThreadStatus>("draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!contentEn.trim() && !contentZh.trim()) {
      setError("At least one language must have content.");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await createThread({
      content_en: contentEn,
      content_zh: contentZh,
      tag_ids: tagIds,
      status,
    });

    setSaving(false);

    if (result.success) {
      setContentEn("");
      setContentZh("");
      setTagIds([]);
      setStatus("draft");
      router.refresh();
    } else {
      setError(result.error ?? "Failed to create thread");
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface/30 p-5">
      <p className="text-xs font-medium text-text-tertiary mb-3">New Thread</p>

      {error && (
        <div className="mb-3 rounded-md bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
        <div>
          <label className="block text-xs text-text-quaternary mb-1">English</label>
          <Textarea
            value={contentEn}
            onChange={(e) => setContentEn(e.target.value)}
            placeholder="Write a thought in English..."
            rows={4}
          />
        </div>
        <div>
          <label className="block text-xs text-text-quaternary mb-1">中文</label>
          <Textarea
            value={contentZh}
            onChange={(e) => setContentZh(e.target.value)}
            placeholder="用中文写一段想法..."
            rows={4}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-text-quaternary mb-1">Tags</label>
        <TagPicker allTags={allTags} selectedIds={tagIds} onChange={setTagIds} />
      </div>

      <div className="flex items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ThreadStatus)}
          className="rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-warm/50"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <Button onClick={handleSubmit} disabled={saving} size="sm">
          <Plus className="h-3.5 w-3.5 mr-1" />
          {saving ? "Saving..." : "Create Thread"}
        </Button>
      </div>
    </div>
  );
}
