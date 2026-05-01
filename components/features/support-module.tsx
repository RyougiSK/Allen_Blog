"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, ChevronDown } from "lucide-react";
import { SUPPORT } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/locale-context";

interface SupportModuleProps {
  variant: "compact" | "full";
}

export function SupportModule({ variant }: SupportModuleProps) {
  const { t } = useLocale();
  const [qrOpen, setQrOpen] = useState(false);

  if (variant === "compact") {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface/50 p-6 sm:p-8">
        <p className="font-display text-[length:var(--text-body-lg)] text-text-primary leading-[var(--leading-body)]">
          {t("support.compactTitle")}
        </p>
        <p className="mt-3 text-[length:var(--text-body-sm)] text-text-secondary leading-[var(--leading-body)]">
          {t("support.compactBody")}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={SUPPORT.stripe.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-accent-warm/40 px-4 py-2 text-sm text-accent-warm transition-all duration-[var(--duration-fast)] hover:bg-accent-warm/10"
          >
            {t("support.stripeButton")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={() => setQrOpen(!qrOpen)}
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-accent-warm/40 px-4 py-2 text-sm text-accent-warm transition-all duration-[var(--duration-fast)] hover:bg-accent-warm/10"
          >
            {t("support.alipayButton")}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-[var(--duration-fast)] ${qrOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>
        <div
          className={`grid transition-all duration-300 ease-[var(--ease-default)] ${qrOpen ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="flex items-center justify-center rounded-[var(--radius-md)] bg-white p-4 sm:max-w-[200px]">
              <Image
                src={SUPPORT.alipay.qrCode}
                alt="Alipay QR Code"
                width={180}
                height={180}
                className="h-auto w-full max-w-[180px]"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface/50 p-6 sm:p-8">
        <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-2">
          {t("support.internationalTitle")}
        </p>
        <p className="text-[length:var(--text-body-sm)] text-text-secondary leading-[var(--leading-body)]">
          {t("support.internationalDescription")}
        </p>
        <a
          href={SUPPORT.stripe.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-accent-warm/40 px-5 py-2.5 text-sm text-accent-warm transition-all duration-[var(--duration-fast)] hover:bg-accent-warm/10"
        >
          {t("support.stripeButton")}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-surface/50 p-6 sm:p-8">
        <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-2">
          {t("support.chinaTitle")}
        </p>
        <p className="text-[length:var(--text-body-sm)] text-text-secondary leading-[var(--leading-body)]">
          {t("support.chinaDescription")}
        </p>
        <ol className="mt-4 list-inside list-decimal space-y-1 text-[length:var(--text-body-sm)] text-text-tertiary">
          <li>{t("support.alipayStep1")}</li>
          <li>{t("support.alipayStep2")}</li>
          <li>{t("support.alipayStep3")}</li>
        </ol>
        <div className="mt-5 flex items-center justify-center rounded-[var(--radius-md)] bg-white p-4 sm:max-w-[220px]">
          <Image
            src={SUPPORT.alipay.qrCode}
            alt="Alipay QR Code"
            width={200}
            height={200}
            className="h-auto w-full max-w-[200px]"
          />
        </div>
      </div>
    </div>
  );
}
