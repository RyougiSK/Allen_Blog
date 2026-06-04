"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  BarChart3,
  FileText,
  MessageSquare,
  Brain,
  Layers,
  FolderOpen,
  Tags,
  ImageIcon,
  Mail,
  Plus,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Search,
  TrendingUp,
  LineChart,
  Activity,
  ChevronRight,
} from "lucide-react";
import { signOut } from "@/app/(auth)/login/actions";
import { SITE } from "@/lib/constants";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact: boolean;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { href: "/admin", label: "Compass", icon: Compass, exact: true },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3, exact: true },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/posts", label: "Articles", icon: FileText, exact: false },
      { href: "/admin/threads", label: "Threads", icon: MessageSquare, exact: false },
      { href: "/admin/film-psyche", label: "作品解析", icon: Brain, exact: false },
    ],
  },
  {
    label: "Taxonomy",
    items: [
      { href: "/admin/types", label: "Types", icon: Layers, exact: false },
      { href: "/admin/categories", label: "Categories", icon: FolderOpen, exact: false },
      { href: "/admin/tags", label: "Tags", icon: Tags, exact: false },
    ],
  },
  {
    label: "Financial",
    items: [
      { href: "/admin/financial", label: "Overview", icon: TrendingUp, exact: true },
      { href: "/admin/financial/markets", label: "Mean Reversion", icon: LineChart, exact: false },
      { href: "/admin/financial/yield-curve", label: "Yield Curve", icon: Activity, exact: false },
      { href: "/admin/financial/spread", label: "Spread", icon: Activity, exact: false },
      { href: "/admin/financial/liquidity", label: "Liquidity", icon: Activity, exact: false },
    ],
  },
  {
    label: "Assets & Audience",
    items: [
      { href: "/admin/media", label: "Media", icon: ImageIcon, exact: false },
      { href: "/admin/subscribers", label: "Subscribers", icon: Mail, exact: false },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-expand groups that contain the active route; others collapse by default
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((group) => {
      if (!group.label) return;
      const hasActive = group.items.some(({ href, exact }) =>
        exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")
      );
      initial[group.label] = hasActive;
    });
    return initial;
  });

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  function toggleGroup(label: string) {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  const navContent = (
    <>
      {navGroups.map((group, gi) => {
        const isCollapsible = group.label !== null;
        const isOpen = !isCollapsible || expanded[group.label!];
        const groupHasActive = group.items.some(({ href, exact }) => isActive(href, exact));

        return (
          <div key={gi} className={gi > 0 ? "mt-2" : ""}>
            {isCollapsible && (
              <button
                onClick={() => toggleGroup(group.label!)}
                className="flex w-full items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-medium transition-colors duration-[var(--duration-fast)] hover:text-text-tertiary group"
              >
                <ChevronRight
                  className={`h-3 w-3 shrink-0 transition-transform duration-150 ${
                    isOpen ? "rotate-90" : ""
                  } ${groupHasActive ? "text-text-tertiary" : "text-text-quaternary"}`}
                />
                <span className={groupHasActive ? "text-text-tertiary" : "text-text-quaternary"}>
                  {group.label}
                </span>
              </button>
            )}
            {isOpen && (
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon, exact }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors duration-[var(--duration-fast)] ${
                      isCollapsible ? "pl-7" : ""
                    } ${
                      isActive(href, exact)
                        ? "bg-surface text-text-primary"
                        : "text-text-tertiary hover:text-text-primary hover:bg-surface/50"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-4 pt-2 border-t border-border">
        <Link
          href="/admin/posts/new"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm text-accent-warm hover:bg-accent-warm/10 transition-colors duration-[var(--duration-fast)]"
        >
          <Plus className="h-4 w-4 shrink-0" />
          New Article
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 border-r border-border bg-bg-secondary h-screen sticky top-0">
        <div className="px-4 py-5 border-b border-border">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-primary transition-colors duration-[var(--duration-fast)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-display">{SITE.name}</span>
          </Link>
        </div>

        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm text-text-quaternary hover:text-text-secondary hover:bg-surface/50 border border-border transition-colors duration-[var(--duration-fast)]"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          {navContent}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm text-text-tertiary hover:text-text-primary hover:bg-surface/50 transition-colors duration-[var(--duration-fast)]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border bg-bg-primary/80 backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-display">{SITE.name}</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -mr-2 text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="nav-overlay fixed inset-0 z-50 bg-bg-primary flex flex-col md:hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-display text-sm text-text-primary">Admin</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 -mr-2 text-text-tertiary hover:text-text-primary transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {navContent}
          </nav>
          <div className="px-3 py-4 border-t border-border">
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm text-text-tertiary hover:text-text-primary hover:bg-surface/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
