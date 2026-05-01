"use client";

import { useState, useLayoutEffect, useEffect, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";

const STORAGE_KEY = "focus-mode";

export function FocusModeToggle() {
  const [active, setActive] = useState(false);
  const { t } = useLocale();

  useLayoutEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setActive(true);
      document.documentElement.dataset.focusMode = "true";
    }
    return () => {
      delete document.documentElement.dataset.focusMode;
    };
  }, []);

  const toggle = useCallback(() => {
    setActive((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.dataset.focusMode = "true";
        sessionStorage.setItem(STORAGE_KEY, "true");
      } else {
        delete document.documentElement.dataset.focusMode;
        sessionStorage.removeItem(STORAGE_KEY);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggle();
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggle]);

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 text-[length:var(--text-caption)] text-text-tertiary hover:text-text-primary transition-colors duration-[var(--duration-fast)]"
      aria-label={t(active ? "focusMode.exit" : "focusMode.enter")}
      title={t(active ? "focusMode.exit" : "focusMode.enter")}
    >
      {active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">
        {t(active ? "focusMode.exit" : "focusMode.enter")}
      </span>
    </button>
  );
}
