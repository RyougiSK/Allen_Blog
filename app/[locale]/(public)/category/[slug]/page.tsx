import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { content: contentLocale } = LOCALE_MAP[locale] ?? LOCALE_MAP.en;
  const { data: category } = await supabase
    .from("categories")
    .select("name, name_zh, description")
    .eq("slug", slug)
    .single();

  if (!category) return {};

  const localName = getLocalizedName(category, contentLocale);
  return {
    title: localName,
    description: category.description || `Articles about ${localName}`,
    alternates: {
      canonical: `${SITE.url}/${locale}/category/${slug}`,
      languages: {
        en: `${SITE.url}/en/category/${slug}`,
        "zh-CN": `${SITE.url}/zh/category/${slug}`,
      },
    },
  };
}

export default async function CategoryArchivePage({
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
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: rawArticles, count } = await supabase
    .from("articles")
    .select("*, article_tags(tag_id, tags(*)), categories(*)", { count: "exact" })
    .eq("status", "published")
    .eq("category_id", category.id)
    .neq("en->>slug", "")
    .not("en->>slug", "is", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const articles: ArticleWithTags[] = (rawArticles ?? []).map(
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

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="mx-auto w-full max-w-[var(--width-page)] px-6 py-16">
      <header className="mb-12">
        <p className="text-[length:var(--text-micro)] font-medium text-accent-warm uppercase tracking-[var(--tracking-widest)] mb-2">
          {dictionary["categories.label"] ?? "Category"}
        </p>
        <h1 className="font-display text-[length:var(--text-display-lg)] leading-[var(--leading-display)] text-text-primary">
          {getLocalizedName(category as Category, contentLocale)}
        </h1>
        {(category as Category).description && (
          <p className="text-[length:var(--text-body)] text-text-secondary mt-3">
            {(category as Category).description}
          </p>
        )}
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
        basePath={`/${locale}/category/${slug}`}
        dictionary={dictionary}
      />
    </div>
  );
}
