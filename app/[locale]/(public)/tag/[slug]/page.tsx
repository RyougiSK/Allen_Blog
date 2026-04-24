import { cache } from "react";
import { notFound } from "next/navigation";
import { createStaticClient } from "@/utils/supabase/static";
import { WritingCard } from "@/components/features/writing-card";
import { Pagination } from "@/components/features/pagination";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocalizedName } from "@/lib/utils/localized-name";
import { SITE } from "@/lib/constants";
import type { ArticleWithTags, Tag, Category, ContentLocale } from "@/lib/types";
import type { Locale } from "@/lib/i18n/types";
import type { Metadata } from "next";

const LOCALE_MAP: Record<string, { content: ContentLocale; dict: Locale }> = {
  en: { content: "en", dict: "en" },
  zh: { content: "zh", dict: "zh-cn" },
};

const PAGE_SIZE = 10;

export const revalidate = 60;

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data: tags } = await supabase.from("tags").select("slug");

  return (tags ?? []).flatMap((t) => [
    { locale: "en", slug: t.slug },
    { locale: "zh", slug: t.slug },
  ]);
}

const getTagBySlug = cache(async (slug: string) => {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("tags")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { content: contentLocale } = LOCALE_MAP[locale] ?? LOCALE_MAP.en;
  const tag = await getTagBySlug(slug);

  if (!tag) return {};

  const localName = getLocalizedName(tag, contentLocale);
  return {
    title: `${localName} — Writing`,
    description: `Articles tagged with ${localName}`,
    alternates: {
      canonical: `${SITE.url}/${locale}/tag/${slug}`,
      languages: {
        en: `${SITE.url}/en/tag/${slug}`,
        "zh-CN": `${SITE.url}/zh/tag/${slug}`,
      },
    },
  };
}

export default async function TagArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const { content: contentLocale, dict: dictLocale } =
    LOCALE_MAP[locale] ?? LOCALE_MAP.en;
  const dictionary = await getDictionary(dictLocale);

  const tag = await getTagBySlug(slug);

  if (!tag) notFound();

  const supabase = createStaticClient();

  // Get article IDs for this tag
  const { data: articleTagRows } = await supabase
    .from("article_tags")
    .select("article_id")
    .eq("tag_id", tag.id);

  const articleIds = (articleTagRows ?? []).map((r) => r.article_id);

  let articles: ArticleWithTags[] = [];
  let totalPages = 0;

  if (articleIds.length > 0) {
    const { data: rawArticles, count } = await supabase
      .from("articles")
      .select("*, article_tags(tag_id, tags(*)), categories(*)", {
        count: "exact",
      })
      .eq("status", "published")
      .in("id", articleIds)
      .neq("en->>slug", "")
      .not("en->>slug", "is", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    articles = (rawArticles ?? []).map(
      (a) => {
        const { article_tags, categories, ...rest } = a as Record<string, unknown> & {
          article_tags?: { tag_id: string; tags: Tag }[];
          categories?: Category;
        };
        return {
          ...rest,
          tags: (article_tags ?? []).map((at) => at.tags),
          category: categories ?? null,
        } as ArticleWithTags;
      },
    );

    totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  }

  return (
    <div className="mx-auto w-full max-w-[var(--width-page)] px-6 py-16">
      <header className="mb-12">
        <p className="text-[length:var(--text-micro)] font-medium text-accent-warm uppercase tracking-[var(--tracking-widest)] mb-2">
          {dictionary["tags.label"] ?? "Tag"}
        </p>
        <h1 className="font-display text-[length:var(--text-display-lg)] leading-[var(--leading-display)] text-text-primary">
          {getLocalizedName(tag as Tag, contentLocale)}
        </h1>
      </header>

      {articles.length > 0 ? (
        <div>
          {articles.map((article) => (
            <WritingCard
              key={article.id}
              article={article}
              locale={contentLocale}
              dictionary={dictionary}
            />
          ))}
        </div>
      ) : (
        <p className="text-text-tertiary py-12 text-center text-sm">
          {dictionary["writing.noArticles"] ?? "No articles yet."}
        </p>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/${locale}/tag/${slug}`}
        dictionary={dictionary}
      />
    </div>
  );
}
