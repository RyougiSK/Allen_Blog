import Link from "next/link";
import { getLocalizedName } from "@/lib/utils/localized-name";
import type { Tag, ContentLocale } from "@/lib/types";

interface TagLinkProps {
  tag: Tag;
  active?: boolean;
  size?: "sm" | "md";
  locale?: ContentLocale;
}

export function TagLink({ tag, active = false, size = "sm", locale = "en" }: TagLinkProps) {
  const urlLocale = locale === "en" ? "en" : "zh";
  const sizeClasses =
    size === "sm"
      ? "text-[length:var(--text-micro)] px-2 py-0.5"
      : "text-[length:var(--text-caption)] px-3 py-1";

  return (
    <Link
      href={tag.slug ? `/${urlLocale}/writing?tag=${tag.slug}` : `/${urlLocale}/writing`}
      className={`inline-flex items-center rounded-[var(--radius-sm)] border transition-colors duration-[var(--duration-fast)] ${sizeClasses} ${
        active
          ? "border-accent-warm/30 bg-accent-warm/10 text-accent-warm"
          : "border-border bg-surface text-text-tertiary hover:text-text-primary hover:border-border-emphasis"
      }`}
    >
      {getLocalizedName(tag, locale)}
    </Link>
  );
}
