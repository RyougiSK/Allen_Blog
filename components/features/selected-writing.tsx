import Link from "next/link";
import { WritingCard } from "@/components/features/writing-card";
import type { ArticleWithTags, ContentLocale } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/types";

interface SelectedWritingProps {
  featured: ArticleWithTags[];
  recent: ArticleWithTags[];
  locale: ContentLocale;
  dictionary: Dictionary;
}

export function SelectedWriting({
  featured,
  recent,
  locale,
  dictionary,
}: SelectedWritingProps) {
  if (featured.length === 0 && recent.length === 0) return null;
  const urlLocale = locale === "en" ? "en" : "zh";

  return (
    <section id="selected-writing">
      <div className="mx-auto w-full max-w-[var(--width-page)] px-6">
        <div className="flex items-center justify-between mb-8">
          <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary">
            {dictionary["home.selected"]}
          </p>
          <Link
            href={`/${urlLocale}/writing`}
            className="text-[length:var(--text-caption)] text-text-tertiary transition-colors duration-[var(--duration-fast)] hover:text-accent-warm"
          >
            {dictionary["home.viewAll"]} &rarr;
          </Link>
        </div>

        {featured.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {featured.map((article) => (
              <WritingCard
                key={article.id}
                article={article}
                locale={locale}
                featured
              />
            ))}
          </div>
        )}

        {recent.length > 0 && (
          <div className={featured.length > 0 ? "mt-4" : ""}>
            {recent.map((article) => (
              <WritingCard
                key={article.id}
                article={article}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
