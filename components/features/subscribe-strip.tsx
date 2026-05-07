"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";

export function SubscribeStrip() {
  const { t, locale } = useLocale();
  const urlLocale = locale === "zh-cn" ? "zh" : "en";

  return (
    <section className="border-t border-border/60">
      <div className="mx-auto w-full max-w-[var(--width-page)] px-6 py-6 flex items-center justify-between gap-4">
        <p className="text-[length:var(--text-caption)] text-text-tertiary">
          {t("subscribe.description")}
        </p>
        <Link
          href={`/${urlLocale}/subscribe`}
          className="inline-flex items-center gap-2 flex-shrink-0 rounded-[var(--radius-lg)] border border-accent-warm/40 text-accent-warm px-4 py-2 text-[length:var(--text-micro)] font-medium transition-colors duration-[var(--duration-fast)] hover:bg-accent-warm/10"
        >
          {t("subscribe.title")}
        </Link>
      </div>
    </section>
  );
}
