"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  MessageSquare,
  Tags,
  FolderOpen,
  Mail,
  Plus,
  LayoutDashboard,
  ImageIcon,
  Layers,
} from "lucide-react";
import { globalSearch, type SearchResult } from "@/lib/actions/search";

interface CommandAction {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section: "navigation" | "actions";
}

const ACTIONS: CommandAction[] = [
  { id: "new-article", label: "New Article", href: "/admin/posts/new", icon: Plus, section: "actions" },
  { id: "nav-dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard, section: "navigation" },
  { id: "nav-articles", label: "Articles", href: "/admin/posts", icon: FileText, section: "navigation" },
  { id: "nav-threads", label: "Threads", href: "/admin/threads", icon: MessageSquare, section: "navigation" },
  { id: "nav-types", label: "Types", href: "/admin/types", icon: Layers, section: "navigation" },
  { id: "nav-categories", label: "Categories", href: "/admin/categories", icon: FolderOpen, section: "navigation" },
  { id: "nav-tags", label: "Tags", href: "/admin/tags", icon: Tags, section: "navigation" },
  { id: "nav-media", label: "Media", href: "/admin/media", icon: ImageIcon, section: "navigation" },
  { id: "nav-subscribers", label: "Subscribers", href: "/admin/subscribers", icon: Mail, section: "navigation" },
];

const TYPE_ICONS: Record<SearchResult["type"], React.ComponentType<{ className?: string }>> = {
  article: FileText,
  thread: MessageSquare,
  tag: Tags,
  category: FolderOpen,
  subscriber: Mail,
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const res = await globalSearch(q);
      setResults(res);
      setLoading(false);
      setActiveIndex(0);
    }, 200);
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    doSearch(value);
  }

  const filteredActions = query.trim()
    ? ACTIONS.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : ACTIONS;

  const allItems: { type: "action" | "result"; data: CommandAction | SearchResult }[] = [];

  if (results.length > 0) {
    for (const r of results) {
      allItems.push({ type: "result", data: r });
    }
  }
  for (const a of filteredActions) {
    allItems.push({ type: "action", data: a });
  }

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % allItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + allItems.length) % allItems.length);
    } else if (e.key === "Enter" && allItems.length > 0) {
      e.preventDefault();
      const item = allItems[activeIndex];
      if (item.type === "action") {
        navigate((item.data as CommandAction).href);
      } else {
        navigate((item.data as SearchResult).href);
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-lg mx-4 bg-bg-secondary border border-border rounded-[var(--radius-lg)] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-text-quaternary shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search articles, threads, or type a command..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-quaternary focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border text-[10px] text-text-quaternary">
            ESC
          </kbd>
        </div>

        <div className="max-h-[320px] overflow-y-auto py-2">
          {loading && (
            <div className="px-4 py-3 text-xs text-text-quaternary">Searching...</div>
          )}

          {!loading && results.length > 0 && (
            <div className="mb-1">
              <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-text-quaternary font-medium">
                Results
              </div>
              {results.map((result, i) => {
                const Icon = TYPE_ICONS[result.type];
                const idx = i;
                return (
                  <button
                    key={result.id}
                    onClick={() => navigate(result.href)}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                      activeIndex === idx
                        ? "bg-surface text-text-primary"
                        : "text-text-secondary hover:bg-surface/50"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-text-quaternary" />
                    <span className="flex-1 truncate">{result.title}</span>
                    {result.subtitle && (
                      <span className="text-[10px] text-text-quaternary capitalize">{result.subtitle}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {filteredActions.length > 0 && (
            <>
              {filteredActions.some((a) => a.section === "actions") && (
                <div className="mb-1">
                  <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-text-quaternary font-medium">
                    Actions
                  </div>
                  {filteredActions
                    .filter((a) => a.section === "actions")
                    .map((action) => {
                      const idx = allItems.findIndex(
                        (item) => item.type === "action" && (item.data as CommandAction).id === action.id,
                      );
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => navigate(action.href)}
                          className={`flex w-full items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                            activeIndex === idx
                              ? "bg-surface text-text-primary"
                              : "text-text-secondary hover:bg-surface/50"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-text-quaternary" />
                          <span className="flex-1">{action.label}</span>
                        </button>
                      );
                    })}
                </div>
              )}

              {filteredActions.some((a) => a.section === "navigation") && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-text-quaternary font-medium">
                    Navigation
                  </div>
                  {filteredActions
                    .filter((a) => a.section === "navigation")
                    .map((action) => {
                      const idx = allItems.findIndex(
                        (item) => item.type === "action" && (item.data as CommandAction).id === action.id,
                      );
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => navigate(action.href)}
                          className={`flex w-full items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                            activeIndex === idx
                              ? "bg-surface text-text-primary"
                              : "text-text-secondary hover:bg-surface/50"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-text-quaternary" />
                          <span className="flex-1">{action.label}</span>
                        </button>
                      );
                    })}
                </div>
              )}
            </>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && filteredActions.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-text-quaternary">
              No results found
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-text-quaternary">
          <span><kbd className="px-1 py-0.5 rounded border border-border">↑↓</kbd> Navigate</span>
          <span><kbd className="px-1 py-0.5 rounded border border-border">↵</kbd> Open</span>
          <span><kbd className="px-1 py-0.5 rounded border border-border">esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
