import Link from "next/link";
import { WritingCard } from "@/components/features/writing-card";
import type { ArticleWithTags, ContentLocale } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/types";

interface RecentWritingProps {
  posts: ArticleWithTags[];
  locale: ContentLocale;
  dictionary: Dictionary;
}

export function RecentWriting({ posts, locale, dictionary }: RecentWritingProps) {
  if (posts.length === 0) return null;
  const urlLocale = locale === "en" ? "en" : "zh";

  return (
    <section>
      <div className="mx-auto w-full max-w-[var(--width-content)] px-6">
        <div className="flex items-center justify-between mb-8">
          <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary">
            {dictionary["home.recent"]}
          </p>
          <Link
            href={`/${urlLocale}/writing`}
            className="text-[length:var(--text-caption)] text-text-tertiary transition-colors duration-[var(--duration-fast)] hover:text-accent-warm"
          >
            {dictionary["home.viewAll"]} &rarr;
          </Link>
        </div>
        <div>
          {posts.map((article) => (
            <WritingCard key={article.id} article={article} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
