import { WritingCard } from "@/components/features/writing-card";
import type { ArticleWithTags, ContentLocale } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/types";

interface FeaturedWritingProps {
  posts: ArticleWithTags[];
  locale: ContentLocale;
  dictionary: Dictionary;
}

export function FeaturedWriting({ posts, locale, dictionary }: FeaturedWritingProps) {
  if (posts.length === 0) return null;

  return (
    <section>
      <div className="mx-auto w-full max-w-[var(--width-page)] px-6">
        <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-8">
          {dictionary["home.featured"]}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {posts.map((article) => (
            <WritingCard key={article.id} article={article} locale={locale} featured />
          ))}
        </div>
      </div>
    </section>
  );
}
