"use client";

import { useState, useEffect } from "react";
import { Share2 } from "lucide-react";
import { ShareButtonItem } from "@/components/features/share-button-item";
import { CopyLinkButton } from "@/components/features/copy-link-button";
import { useLocale } from "@/lib/i18n/locale-context";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

const PLATFORMS = ["twitter", "facebook", "linkedin", "whatsapp", "telegram", "email"] as const;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsMobile(check && window.innerWidth < 768);
  }, []);
  return isMobile;
}

export function ShareButtons({ url, title, description, className = "" }: ShareButtonsProps) {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useLocale();

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const showNativeOnly = isMobile && canNativeShare;

  async function handleNativeShare() {
    try {
      await navigator.share({ title, text: description, url });
    } catch {
      // User cancelled
    }
  }

  return (
    <div className={className}>
      <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-4">
        {t("share.title")}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {showNativeOnly ? (
          <button
            onClick={handleNativeShare}
            aria-label={t("share.nativeShare")}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-md)] text-text-tertiary transition-colors duration-[var(--duration-fast)] hover:text-text-primary hover:bg-bg-tertiary"
          >
            <Share2 className="h-[18px] w-[18px]" />
            <span className="text-[length:var(--text-micro)]">{t("share.nativeShare")}</span>
          </button>
        ) : (
          PLATFORMS.map((platform) => (
            <ShareButtonItem
              key={platform}
              platform={platform}
              url={url}
              title={title}
              description={description}
            />
          ))
        )}
        <CopyLinkButton url={url} showLabel={showNativeOnly} />
      </div>
    </div>
  );
}
