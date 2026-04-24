"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export function ImageLightbox() {
  const [src, setSrc] = useState<string | null>(null);
  const [alt, setAlt] = useState("");

  const close = useCallback(() => setSrc(null), []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "IMG" &&
        target.closest(".prose-editorial")
      ) {
        const img = target as HTMLImageElement;
        setSrc(img.currentSrc || img.src);
        setAlt(img.alt || "");
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close]);

  if (!src) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/90 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
      onClick={close}
    >
      <button
        onClick={close}
        className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 text-text-tertiary hover:text-text-primary transition-colors"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] rounded-[var(--radius-md)] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body,
  );
}
