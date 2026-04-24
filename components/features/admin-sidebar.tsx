"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
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
} from "lucide-react";
import { signOut } from "@/app/(auth)/login/actions";
import { SITE } from "@/lib/constants";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Articles", icon: FileText, exact: false },
  { href: "/admin/threads", label: "Threads", icon: MessageSquare, exact: false },
  { href: "/admin/types", label: "Types", icon: Layers, exact: false },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen, exact: false },
  { href: "/admin/tags", label: "Tags", icon: Tags, exact: false },
  { href: "/admin/media", label: "Media", icon: ImageIcon, exact: false },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const navContent = (
    <>
      {navItems.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors duration-[var(--duration-fast)] ${
            isActive(href, exact)
              ? "bg-surface text-text-primary"
              : "text-text-tertiary hover:text-text-primary hover:bg-surface/50"
          }`}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}

      <div className="mt-2 pt-2 border-t border-border">
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

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
