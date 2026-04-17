"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ImageIcon, Upload as UploadIcon } from "lucide-react";
import { fetchMedia } from "@/lib/actions/media";
import { MediaGrid } from "@/components/features/media-grid";
import { MediaUpload } from "@/components/features/media-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MediaItem } from "@/lib/types";

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
}

type Tab = "browse" | "upload";

export function MediaPicker({ isOpen, onClose, onSelect }: MediaPickerProps) {
  const [tab, setTab] = useState<Tab>("browse");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(false);

  const loadMedia = useCallback(async (searchQuery?: string) => {
    setLoading(true);
    const result = await fetchMedia({ limit: 48, search: searchQuery });
    setItems(result.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setSelectedItem(null);
      setSearch("");
      setTab("browse");
    }
  }, [isOpen, loadMedia]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isOpen) loadMedia(search || undefined);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, isOpen, loadMedia]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-4 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg-primary shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-medium text-text-primary">
              Media Library
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setTab("browse")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
                  tab === "browse"
                    ? "bg-surface text-text-primary"
                    : "text-text-tertiary hover:text-text-primary"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Browse
              </button>
              <button
                onClick={() => setTab("upload")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
                  tab === "upload"
                    ? "bg-surface text-text-primary"
                    : "text-text-tertiary hover:text-text-primary"
                }`}
              >
                <UploadIcon className="h-3.5 w-3.5" />
                Upload
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "browse" ? (
            <div className="space-y-4">
              <Input
                type="search"
                placeholder="Search media..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square animate-pulse rounded-[var(--radius-md)] bg-surface"
                    />
                  ))}
                </div>
              ) : (
                <MediaGrid
                  items={items}
                  selectable
                  selectedId={selectedItem?.id}
                  onSelect={setSelectedItem}
                />
              )}
            </div>
          ) : (
            <MediaUpload
              onUpload={(media) => {
                setItems((prev) => [media, ...prev]);
                setSelectedItem(media);
                setTab("browse");
              }}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!selectedItem}
            onClick={() => {
              if (selectedItem) {
                onSelect(selectedItem);
                onClose();
              }
            }}
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
}
