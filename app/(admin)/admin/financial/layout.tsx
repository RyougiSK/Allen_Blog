"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, LineChart, GitBranch, Activity, Droplets } from "lucide-react";

const tabs = [
  { href: "/admin/financial", label: "Overview", icon: TrendingUp, exact: true },
  { href: "/admin/financial/markets", label: "Mean Reversion", icon: LineChart, exact: false },
  { href: "/admin/financial/yield-curve", label: "Yield Curve", icon: GitBranch, exact: true },
  { href: "/admin/financial/spread", label: "Spread", icon: Activity, exact: true },
  { href: "/admin/financial/liquidity", label: "Liquidity", icon: Droplets, exact: true },
];

export default function FinancialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  // Hide top-level tabs when on a detail page (has breadcrumb instead)
  const isDetailPage = /\/admin\/financial\/markets\/[^/]+/.test(pathname);

  return (
    <div className="w-full max-w-7xl px-8 py-10">
      {!isDetailPage && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-display text-text-primary">
              Financial Monitor
            </h1>
            <p className="text-sm text-text-tertiary mt-1">
              Mean reversion analysis across global markets
            </p>
          </div>

          <nav className="flex gap-1 border-b border-border pb-px mb-6">
            {tabs.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-t-md transition-colors duration-[var(--duration-fast)] border-b-2 -mb-px ${
                  isActive(href, exact)
                    ? "border-accent-warm text-text-primary bg-surface/50"
                    : "border-transparent text-text-tertiary hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </>
      )}

      {children}
    </div>
  );
}
