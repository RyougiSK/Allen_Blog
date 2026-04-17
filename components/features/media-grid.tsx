"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Check, Copy } from "lucide-react";
import { deleteMedia } from "@/lib/actions/media";
import { Button } from "@/components/ui/button";
import type { MediaItem } from "@/lib/types";

interface MediaGridProps {
  items: MediaItem[];
  selectable?: boolean;
  selectedId?: string | null;
  onSelect?: (media: MediaItem) => void;
  onDelete?: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaGrid({
  items,
  selectable,
  selectedId,
  onSelect,
  onDelete,
}: MediaGridProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Delete "${item.filename}"?`)) return;
    setDeleting(item.id);
    await deleteMedia(item.id);
    setDeleting(null);
    onDelete?.();
  }

  function handleCopy(item: MediaItem) {
    navigator.clipboard.writeText(item.url);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-text-tertiary">
        No media files yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const isSelected = selectable && selectedId === item.id;
        return (
          <div
            key={item.id}
            onClick={() => selectable && onSelect?.(item)}
            className={`group relative overflow-hidden rounded-[var(--radius-md)] border bg-surface transition-all duration-[var(--duration-fast)] ${
              isSelected
                ? "border-accent-warm ring-2 ring-accent-warm/30"
                : "border-border hover:border-border-emphasis"
            } ${selectable ? "cursor-pointer" : ""}`}
          >
            <div className="relative aspect-square bg-bg-secondary">
              <Image
                src={item.url}
                alt={item.alt_text || item.filename}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-accent-warm/20">
                  <Check className="h-8 w-8 text-accent-warm" />
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="truncate text-xs text-text-secondary">
                {item.filename}
              </p>
              <p className="text-[10px] text-text-quaternary">
                {formatSize(item.size_bytes)}
              </p>
            </div>
            {!selectable && (
              <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 bg-bg-primary/80 backdrop-blur"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(item);
                  }}
                >
                  {copied === item.id ? (
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 bg-bg-primary/80 backdrop-blur"
                  loading={deleting === item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-danger" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
