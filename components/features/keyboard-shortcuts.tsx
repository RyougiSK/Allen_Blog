"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";

const SHORTCUTS = [
  { section: "Global", items: [
    { keys: ["⌘", "K"], description: "Open command palette" },
    { keys: ["C"], description: "Create new article" },
    { keys: ["?"], description: "Show keyboard shortcuts" },
  ]},
  { section: "Navigation", items: [
    { keys: ["G", "D"], description: "Go to Dashboard" },
    { keys: ["G", "A"], description: "Go to Articles" },
    { keys: ["G", "T"], description: "Go to Threads" },
    { keys: ["G", "M"], description: "Go to Media" },
    { keys: ["G", "S"], description: "Go to Subscribers" },
  ]},
  { section: "Editor", items: [
    { keys: ["⌘", "S"], description: "Save draft" },
    { keys: ["⌘", "⏎"], description: "Publish" },
    { keys: ["⌘", "⇧", "L"], description: "Toggle language" },
  ]},
];

export function KeyboardShortcutsProvider() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [pendingG, setPendingG] = useState(false);
  const router = useRouter();

  useKeyboardShortcuts([
    { key: "?", description: "Show shortcuts", action: () => setHelpOpen((v) => !v) },
    { key: "c", description: "New article", action: () => router.push("/admin/posts/new") },
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (pendingG) {
        setPendingG(false);
        clearTimeout(timer);
        const key = e.key.toLowerCase();
        const routes: Record<string, string> = {
          d: "/admin",
          a: "/admin/posts",
          t: "/admin/threads",
          m: "/admin/media",
          s: "/admin/subscribers",
        };
        if (routes[key]) {
          e.preventDefault();
          router.push(routes[key]);
        }
        return;
      }

      if (e.key.toLowerCase() === "g") {
        setPendingG(true);
        timer = setTimeout(() => setPendingG(false), 800);
      }
    }

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      clearTimeout(timer);
    };
  }, [pendingG, router]);

  if (!helpOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setHelpOpen(false)} />
      <div className="relative w-full max-w-md mx-4 bg-bg-secondary border border-border rounded-[var(--radius-lg)] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">Keyboard Shortcuts</h2>
          <Button variant="ghost" size="icon" onClick={() => setHelpOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5">
          {SHORTCUTS.map((section) => (
            <div key={section.section}>
              <h3 className="text-[10px] uppercase tracking-wider text-text-quaternary font-medium mb-2">
                {section.section}
              </h3>
              <div className="space-y-1.5">
                {section.items.map((item) => (
                  <div key={item.description} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key) => (
                        <kbd
                          key={key}
                          className="inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 rounded border border-border bg-surface text-[11px] text-text-tertiary font-mono"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
