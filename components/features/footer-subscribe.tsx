"use client";

import { SubscribeForm } from "@/components/features/subscribe-form";
import { useLocale } from "@/lib/i18n/locale-context";

export function FooterSubscribe() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[length:var(--text-micro)] text-text-quaternary max-w-[20rem]">
        {t("subscribe.description")}
      </p>
      <SubscribeForm variant="inline" className="max-w-[20rem]" />
    </div>
  );
}
