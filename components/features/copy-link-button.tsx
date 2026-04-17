"use client";

import { useState } from "react";
import { Link, Check } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";

interface CopyLinkButtonProps {
  url: string;
  showLabel?: boolean;
  className?: string;
}

export function CopyLinkButton({ url, showLabel = false, className = "" }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useLocale();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? t("share.copied") : t("share.copyLink")}
      className={`inline-flex items-center gap-1.5 h-9 rounded-[var(--radius-md)] transition-colors duration-[var(--duration-fast)] ${
        copied
          ? "text-accent-warm"
          : "text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary"
      } ${showLabel ? "px-3" : "w-9 justify-center"} ${className}`}
    >
      {copied ? (
        <Check className="h-[18px] w-[18px]" />
      ) : (
        <Link className="h-[18px] w-[18px]" />
      )}
      {showLabel && (
        <span className="text-[length:var(--text-micro)]">
          {copied ? t("share.copied") : t("share.copyLink")}
        </span>
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? t("share.copied") : ""}
      </span>
    </button>
  );
}
