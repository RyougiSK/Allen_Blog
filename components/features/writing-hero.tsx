import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { getLocalizedName } from "@/lib/utils/localized-name";
import type { ArticleWithTags, ContentLocale } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/types";

interface WritingHeroProps {
  article: ArticleWithTags;
  locale: ContentLocale;
  dictionary: Dictionary;
}

export function WritingHero({ article, locale, dictionary }: WritingHeroProps) {
  const lang = article[locale];
  const urlLocale = locale === "en" ? "en" : "zh";
  const readTime = calculateReadingTime(lang.content);

  return (
    <Link
      href={`/${urlLocale}/${lang.slug}`}
      className="group block mb-12"
    >
      <article className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg-secondary transition-all duration-[var(--duration-normal)] hover:border-border-emphasis hover:shadow-[var(--shadow-md)]">
        {article.cover_image && (
          <div className="relative aspect-[2.5/1] w-full overflow-hidden">
            <Image
              src={article.cover_image}
              alt={lang.title}
              fill
              className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
              sizes="(max-width: 768px) 100vw, 56rem"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-bg-secondary/40 to-transparent" />
          </div>
        )}
        <div className={`${article.cover_image ? "relative -mt-20 z-10" : ""} p-8`}>
          <div className="flex items-center gap-2 mb-3">
            {article.category && (
              <>
                <span className="text-[length:var(--text-micro)] font-medium text-accent-warm uppercase tracking-[var(--tracking-widest)]">
                  {getLocalizedName(article.category, locale)}
                </span>
                <span className="text-text-quaternary">&middot;</span>
              </>
            )}
            <time
              dateTime={article.created_at}
              className="font-mono text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary"
            >
              {format(parseISO(article.created_at), "MMM d, yyyy")}
            </time>
            <span className="text-text-quaternary">&middot;</span>
            <span className="text-[length:var(--text-micro)] text-text-quaternary">
              {dictionary?.["reading.minRead"]?.replace("{count}", String(readTime)) ?? `${readTime} min read`}
            </span>
          </div>
          <h2 className="font-display text-[length:var(--text-display-lg)] leading-[var(--leading-display)] text-text-primary transition-colors duration-[var(--duration-fast)] group-hover:text-accent-warm">
            {lang.title}
          </h2>
          {lang.subtitle && (
            <p className="text-[length:var(--text-body)] text-text-secondary mt-2">
              {lang.subtitle}
            </p>
          )}
          <p className="text-[length:var(--text-body)] text-text-secondary mt-4 line-clamp-2 leading-[var(--leading-body)]">
            {lang.excerpt}
          </p>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-[length:var(--text-micro)] text-text-quaternary"
                >
                  {getLocalizedName(tag, locale)}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
