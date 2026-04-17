"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SITE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/locale-context";
import { LanguageSwitcher } from "@/components/features/language-switcher";

function useRouteLocale(): string {
  const pathname = usePathname();
  const seg = pathname.split("/")[1];
  return seg === "zh" ? "zh" : "en";
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLocale();
  const routeLocale = useRouteLocale();

  const navItems = [
    { href: `/${routeLocale}/writing`, label: t("nav.writing") },
    { href: `/${routeLocale}/themes`, label: t("nav.themes") },
    { href: `/${routeLocale}/about`, label: t("nav.about") },
  ];

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
