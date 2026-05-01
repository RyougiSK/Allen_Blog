"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { X, RotateCcw, Clock, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchVersionHistory, restoreVersion, type ArticleVersion } from "@/lib/actions/versions";

const TRIGGER_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  auto_save: { label: "Auto-save", icon: Clock },
  manual: { label: "Manual save", icon: Save },
  publish: { label: "Published", icon: Send },
};

interface VersionHistoryProps {
  articleId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: () => void;
}

export function VersionHistory({ articleId, isOpen, onClose, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<ArticleVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchVersionHistory(articleId).then((v) => {
        setVersions(v);
        setLoading(false);
      });
    }
  }, [isOpen, articleId]);

  async function handleRestore(versionId: string) {
    setRestoring(true);
    const result = await restoreVersion(articleId, versionId);
    setRestoring(false);
    if (result.success) {
      onRestore();
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-bg-secondary border-l border-border h-full overflow-y-auto">
        <div className="sticky top-0 bg-bg-secondary border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-sm font-semibold text-text-primary">Version History</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-2">
          {loading && (
            <p className="text-sm text-text-quaternary py-8 text-center">Loading versions...</p>
          )}

          {!loading && versions.length === 0 && (
            <p className="text-sm text-text-quaternary py-8 text-center">
              No version history yet. Versions are created on save and publish.
            </p>
          )}

          {versions.map((version) => {
            const trigger = TRIGGER_LABELS[version.trigger] ?? TRIGGER_LABELS.manual;
            const Icon = trigger.icon;
            return (
              <div
                key={version.id}
                className="group flex items-start gap-3 p-3 rounded-[var(--radius-md)] border border-border hover:border-accent-warm/30 hover:bg-surface/30 transition-colors"
              >
                <Icon className="h-4 w-4 text-text-quaternary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary">{trigger.label}</span>
                    <span className="text-[10px] text-text-quaternary">v{version.version_number}</span>
                  </div>
                  <p className="text-[11px] text-text-quaternary mt-0.5">
                    {format(parseISO(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-[11px] text-text-quaternary mt-0.5 truncate">
                    {(version.en as { title?: string })?.title || "Untitled"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRestore(version.id)}
                  disabled={restoring}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Restore this version"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
