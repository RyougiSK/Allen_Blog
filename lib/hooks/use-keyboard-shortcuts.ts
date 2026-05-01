"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export interface Shortcut {
  key: string;
  meta?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const shortcut of shortcutsRef.current) {
        const metaMatch = shortcut.meta ? (e.metaKey || e.ctrlKey) : !(e.metaKey || e.ctrlKey);
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && metaMatch && shiftMatch) {
          if (shortcut.meta || shortcut.shift) {
            e.preventDefault();
            shortcut.action();
            return;
          }
          if (!isInput) {
            e.preventDefault();
            shortcut.action();
            return;
          }
        }
      }
    }

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
}

export function useAdminShortcuts() {
  const router = useRouter();

  useKeyboardShortcuts([
    { key: "c", description: "Create new article", action: () => router.push("/admin/posts/new") },
  ]);
}
