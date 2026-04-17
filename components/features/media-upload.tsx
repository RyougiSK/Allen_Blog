"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { uploadMedia } from "@/lib/actions/media";
import type { MediaItem } from "@/lib/types";

interface MediaUploadProps {
  onUpload?: (media: MediaItem) => void;
}

export function MediaUpload({ onUpload }: MediaUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError(null);
      setUploading(true);

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("alt_text", "");

        const result = await uploadMedia(formData);
        if (!result.success) {
          setError(result.error ?? "Upload failed");
        } else if (result.media) {
          onUpload?.(result.media);
        }
      }

      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    },
    [onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed px-6 py-10 transition-colors duration-[var(--duration-fast)] ${
          dragging
            ? "border-accent-warm bg-accent-warm/5"
            : "border-border hover:border-border-emphasis hover:bg-surface/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
        ) : (
          <Upload className="h-8 w-8 text-text-tertiary" />
        )}
        <p className="mt-3 text-sm text-text-secondary">
          {uploading ? "Uploading..." : "Drop images here or click to upload"}
        </p>
        <p className="mt-1 text-xs text-text-quaternary">
          JPEG, PNG, WebP, AVIF, GIF, SVG — max 5MB
        </p>
      </div>
      {error && (
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-danger/10 px-3 py-2 text-sm text-danger">
          <X className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
