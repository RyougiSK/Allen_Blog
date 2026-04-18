"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { SITE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/locale-context";
import { LanguageSwitcher } from "@/components/features/language-switcher";
import type { WritingType } from "@/lib/types";

function useRouteLocale(): string {
  const pathname = usePathname();
  const seg = pathname.split("/")[1];
  return seg === "zh" ? "zh" : "en";
}

function localizedName(item: WritingType, locale: string): string {
  if (locale === "zh" && item.name_zh) return item.name_zh;
  return item.name;
}

interface NavbarProps {
  writingTypes?: WritingType[];
}

export function Navbar({ writingTypes = [] }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileWritingOpen, setMobileWritingOpen] = useState(false);
  const { t } = useLocale();
  const routeLocale = useRouteLocale();

  const defaultType = writingTypes.find((wt) => wt.is_default);
  const columns = writingTypes.filter((wt) => !wt.is_default);

  const navItems = [
    { href: `/${routeLocale}/themes`, label: t("nav.themes") },
    { href: `/${routeLocale}/about`, label: t("nav.about") },
    { href: `/${routeLocale}/contact`, label: t("nav.contact") },
  ];

  const writingHref = `/${routeLocale}/writing`;
  const writingActive =
    pathname === writingHref || pathname.startsWith(writingHref + "/");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[var(--width-page)] items-center justify-between px-6 h-16">
          <Link
            href={`/${routeLocale}`}
            className="font-display text-lg text-text-primary transition-colors duration-[var(--duration-fast)] hover:text-accent-warm"
          >
            {SITE.name}
          </Link>

          <nav className="hidden sm:flex items-center gap-8">
            <WritingDropdown
              label={t("nav.writing")}
              href={writingHref}
              active={writingActive}
              defaultType={defaultType}
              columns={columns}
              locale={routeLocale}
              t={t}
            />
            {navItems.map(({ href, label }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative text-[length:var(--text-caption)] tracking-[var(--tracking-wide)] transition-colors duration-[var(--duration-fast)] pb-0.5 ${
                    isActive
                      ? "text-text-primary"
                      : "text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-warm rounded-full" />
                  )}
                </Link>
              );
            })}
            <LanguageSwitcher />
          </nav>

          <button
            onClick={() => setMobileOpen(true)}
            className="sm:hidden p-2 -mr-2 text-text-tertiary hover:text-text-primary transition-colors duration-[var(--duration-fast)]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="nav-overlay fixed inset-0 z-50 bg-bg-primary flex flex-col">
          <div className="flex items-center justify-between px-6 h-16">
            <Link
              href={`/${routeLocale}`}
              onClick={() => setMobileOpen(false)}
              className="font-display text-lg text-text-primary"
            >
              {SITE.name}
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 -mr-2 text-text-tertiary hover:text-text-primary transition-colors duration-[var(--duration-fast)]"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-10">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setMobileWritingOpen((v) => !v)}
                className={`flex items-center gap-2 font-display text-[length:var(--text-display-sm)] transition-colors duration-[var(--duration-fast)] ${
                  writingActive
                    ? "text-accent-warm"
                    : "text-text-tertiary hover:text-text-primary"
                }`}
              >
                {t("nav.writing")}
                <ChevronDown
                  className={`h-5 w-5 transition-transform duration-200 ${
                    mobileWritingOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileWritingOpen && (
                <div className="mt-4 flex flex-col items-center gap-3">
                  {defaultType && (
                    <Link
                      href={`/${routeLocale}/writing/blog`}
                      onClick={() => setMobileOpen(false)}
                      className="text-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {localizedName(defaultType, routeLocale)}
                    </Link>
                  )}
                  {columns.map((col) => (
                    <Link
                      key={col.id}
                      href={`/${routeLocale}/writing/${col.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="text-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {localizedName(col, routeLocale)}
                    </Link>
                  ))}
                  <Link
                    href={writingHref}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    {t("nav.writingDropdown.allWriting")}
                  </Link>
                </div>
              )}
            </div>

            {navItems.map(({ href, label }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`font-display text-[length:var(--text-display-sm)] transition-colors duration-[var(--duration-fast)] ${
                    isActive
                      ? "text-accent-warm"
                      : "text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <div className="mt-6">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

function WritingDropdown({
  label,
  href,
  active,
  defaultType,
  columns,
  locale,
  t,
}: {
  label: string;
  href: string;
  active: boolean;
  defaultType?: WritingType;
  columns: WritingType[];
  locale: string;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 250);
  }, [clearCloseTimer]);

  const handleMouseEnter = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={href}
        aria-haspopup="true"
        aria-expanded={open}
        className={`relative text-[length:var(--text-caption)] tracking-[var(--tracking-wide)] transition-colors duration-[var(--duration-fast)] pb-0.5 inline-flex items-center gap-1 ${
          active
            ? "text-text-primary"
            : "text-text-tertiary hover:text-text-primary"
        }`}
      >
        {label}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
        {active && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-warm rounded-full" />
        )}
      </Link>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
          <div className="min-w-[200px] rounded-[var(--radius-lg)] border border-border bg-bg-primary shadow-lg py-2">
            {defaultType && (
              <Link
                href={`/${locale}/writing/blog`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors"
              >
                {localizedName(defaultType, locale)}
              </Link>
            )}

            {columns.length > 0 && (
              <>
                <div className="mx-3 my-1.5 border-t border-border" />
                <div className="px-4 py-1.5 text-xs font-medium text-text-quaternary uppercase tracking-[var(--tracking-widest)]">
                  {t("nav.writingDropdown.columns")}
                </div>
                {columns.map((col) => (
                  <Link
                    key={col.id}
                    href={`/${locale}/writing/${col.slug}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors"
                  >
                    {localizedName(col, locale)}
                  </Link>
                ))}
              </>
            )}

            <div className="mx-3 my-1.5 border-t border-border" />
            <Link
              href={href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-xs text-text-tertiary hover:text-text-primary hover:bg-surface/50 transition-colors"
            >
              {t("nav.writingDropdown.allWriting")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
