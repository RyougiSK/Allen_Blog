import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { getLocalizedName } from "@/lib/utils/localized-name";
import type { ArticleWithTags, ContentLocale } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/types";

interface WritingCardProps {
  article: ArticleWithTags;
  locale: ContentLocale;
  featured?: boolean;
  dictionary?: Dictionary;
}

export function WritingCard({
  article,
  locale,
  featured = false,
  dictionary,
}: WritingCardProps) {
  const lang = article[locale];
  const urlLocale = locale === "en" ? "en" : "zh";

  const excerpt =
    lang.excerpt ||
    lang.content
      .slice(0, 160)
      .replace(/[#*`>\-\[\]]/g, "")
      .trim() + "...";

  const readTime = calculateReadingTime(lang.content);

  if (featured) {
    return (
      <Link href={`/${urlLocale}/${lang.slug}`} className="block group">
        <article className="overflow-hidden rounded-[var(--radius-lg)] border border-border border-l-2 border-l-transparent bg-bg-secondary shadow-[var(--shadow-sm)] transition-all duration-[var(--duration-normal)] hover:border-border-emphasis hover:border-l-accent-warm hover:shadow-[var(--shadow-md)] hover:-translate-y-1">
          {article.cover_image && (
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src={article.cover_image}
                alt={lang.title}
                fill
                className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          <div className="p-8">
            <div className="flex items-center gap-2">
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
                {dictionary
                  ? dictionary["reading.minRead"]?.replace(
                      "{count}",
                      String(readTime),
                    )
                  : `${readTime} min read`}
              </span>
            </div>
            <h2 className="font-display text-[length:var(--text-display-sm)] leading-[var(--leading-tight)] text-text-primary mt-3 transition-colors duration-[var(--duration-fast)] group-hover:text-accent-warm">
              {lang.title}
            </h2>
            <p className="text-[length:var(--text-body)] text-text-secondary mt-4 line-clamp-3 leading-[var(--leading-body)]">
              {excerpt}
            </p>
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
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

  return (
    <Link
      href={`/${urlLocale}/${lang.slug}`}
      className="block group py-6 border-b border-border last:border-b-0 transition-colors hover:bg-surface/30 -mx-4 px-4 rounded-[var(--radius-md)]"
    >
      <article className="flex justify-between items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
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
              {dictionary
                ? dictionary["reading.min"]?.replace(
                    "{count}",
                    String(readTime),
                  )
                : `${readTime} min`}
            </span>
          </div>
          <h3 className="font-display text-[length:var(--text-display-sm)] leading-[var(--leading-tight)] text-text-primary mt-1 transition-colors duration-[var(--duration-fast)] group-hover:text-accent-warm">
            {lang.title}
          </h3>
          <p className="text-[length:var(--text-body-sm)] text-text-secondary mt-2 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
          {article.tags.length > 0 && (
            <div className="flex gap-2 mt-2">
              {article.tags.slice(0, 3).map((tag) => (
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
        {article.cover_image && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-md)]">
            <Image
              src={article.cover_image}
              alt={lang.title}
              fill
              className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.08]"
              sizes="64px"
            />
          </div>
        )}
      </article>
    </Link>
  );
}
