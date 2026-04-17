import Link from "next/link";
import { getLocalizedName } from "@/lib/utils/localized-name";
import type { TagWithCount, ContentLocale } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/types";

interface ThemeCardProps {
  tag: TagWithCount;
  locale?: ContentLocale;
  dictionary?: Dictionary;
}

export function ThemeCard({ tag, locale = "en", dictionary }: ThemeCardProps) {
  const urlLocale = locale === "en" ? "en" : "zh";
  const articleText = dictionary
    ? (tag.postCount === 1 ? dictionary["tags.article"] : dictionary["tags.articles"])?.replace("{count}", String(tag.postCount))
    : `${tag.postCount} ${tag.postCount === 1 ? "article" : "articles"}`;

  return (
    <Link href={`/${urlLocale}/writing?tag=${tag.slug}`} className="block group">
      <article className="rounded-[var(--radius-lg)] border border-border border-l-2 border-l-accent-warm/40 bg-bg-secondary p-6 transition-all duration-[var(--duration-normal)] hover:border-border-emphasis hover:border-l-accent-warm hover:-translate-y-0.5">
        <h3 className="font-display text-[length:var(--text-display-sm)] text-text-primary transition-colors duration-[var(--duration-fast)] group-hover:text-accent-warm">
          {getLocalizedName(tag, locale)}
        </h3>
        <p className="text-[length:var(--text-micro)] text-text-quaternary mt-2">
          {articleText}
        </p>
      </article>
    </Link>
  );
}
