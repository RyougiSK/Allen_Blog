import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { createStaticClient } from "@/utils/supabase/static";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import type { Article, ContentLocale, Tag } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/types";

interface RelatedArticlesProps {
  currentArticleId: string;
  tagIds: string[];
  locale: ContentLocale;
  dictionary: Dictionary;
}

async function fetchRelatedArticles(
  currentId: string,
  tagIds: string[],
  limit = 3,
): Promise<(Article & { tags: Tag[] })[]> {
  if (tagIds.length === 0) return [];

  const supabase = createStaticClient();

  const { data: relatedTagRows } = await supabase
    .from("article_tags")
    .select("article_id")
    .in("tag_id", tagIds)
    .neq("article_id", currentId);

  if (!relatedTagRows || relatedTagRows.length === 0) return [];

  const articleIds = [...new Set(relatedTagRows.map((r) => r.article_id))];

  const { data: articles } = await supabase
    .from("articles")
    .select("*, article_tags(tag_id, tags(*))")
    .in("id", articleIds.slice(0, limit))
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!articles) return [];

  return articles.map((a) => ({
    ...a,
    tags: (a.article_tags ?? []).map(
      (at: { tag_id: string; tags: Tag }) => at.tags,
    ),
  })) as (Article & { tags: Tag[] })[];
}

export async function RelatedArticles({
  currentArticleId,
  tagIds,
  locale,
  dictionary,
}: RelatedArticlesProps) {
  const articles = await fetchRelatedArticles(currentArticleId, tagIds);

  if (articles.length === 0) return null;

  const urlLocale = locale === "en" ? "en" : "zh";

  return (
    <section className="mt-16">
      <h2 className="font-display text-[length:var(--text-body-lg)] text-text-secondary mb-8">
        {dictionary["article.relatedArticles"] ?? "Keep reading"}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => {
          const lang = article[locale];
          const readTime = calculateReadingTime(lang.content);
          return (
            <Link
              key={article.id}
              href={`/${urlLocale}/${lang.slug}`}
              className="group block rounded-[var(--radius-lg)] border border-border bg-bg-secondary p-5 transition-all duration-[var(--duration-normal)] hover:border-border-emphasis hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              {article.cover_image && (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-md)] mb-4">
                  <Image
                    src={article.cover_image}
                    alt={lang.title}
                    fill
                    className="object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
              <time
                dateTime={article.created_at}
                className="font-mono text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary"
              >
                {format(parseISO(article.created_at), "MMM d, yyyy")}
                <span className="mx-1.5">&middot;</span>
                {dictionary["reading.min"]?.replace("{count}", String(readTime)) ?? `${readTime} min`}
              </time>
              <h3 className="font-display text-[length:var(--text-body)] leading-[var(--leading-tight)] text-text-primary mt-2 transition-colors duration-[var(--duration-fast)] group-hover:text-accent-warm">
                {lang.title}
              </h3>
              {lang.excerpt && (
                <p className="text-[length:var(--text-caption)] text-text-tertiary mt-2 line-clamp-2 leading-relaxed">
                  {lang.excerpt}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
