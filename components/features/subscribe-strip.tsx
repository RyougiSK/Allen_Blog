"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";

export function SubscribeStrip() {
  const { t, locale } = useLocale();
  const urlLocale = locale === "zh-cn" ? "zh" : "en";

  return (
    <section className="border-t border-border bg-bg-secondary/50">
      <div className="mx-auto w-full max-w-[var(--width-page)] px-6 py-5 flex items-center justify-between gap-4">
        <p className="text-[length:var(--text-caption)] text-text-tertiary">
          {t("subscribe.description")}
        </p>
        <Link
          href={`/${urlLocale}/subscribe`}
          className="inline-flex items-center gap-2 flex-shrink-0 rounded-[var(--radius-md)] bg-accent-warm text-bg-primary px-4 py-2 text-[length:var(--text-micro)] font-medium transition-colors duration-[var(--duration-fast)] hover:bg-accent-warm/90"
        >
          <Mail className="h-3.5 w-3.5" />
          {t("subscribe.title")}
        </Link>
      </div>
    </section>
  );
}
