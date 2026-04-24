import { Suspense } from "react";
import { FileText } from "lucide-react";
import { createStaticClient } from "@/utils/supabase/static";
import { WritingCard } from "@/components/features/writing-card";
import { WritingHero } from "@/components/features/writing-hero";
import { ArticleSearch } from "@/components/features/article-search";
import { TagLink } from "@/components/ui/tag-link";
import { Pagination } from "@/components/features/pagination";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocalizedName } from "@/lib/utils/localized-name";
import { SITE } from "@/lib/constants";
import type {
  ArticleWithTags,
  Tag,
  Category,
  ContentLocale,
} from "@/lib/types";
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
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Writing",
    description:
      "Thoughts on technology, design, and the things worth thinking about.",
    alternates: {
      canonical: `${SITE.url}/${locale}/writing`,
      languages: {
        en: `${SITE.url}/en/writing`,
        "zh-CN": `${SITE.url}/zh/writing`,
      },
    },
    openGraph: {
      type: "website",
      url: `${SITE.url}/${locale}/writing`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function WritingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    tag?: string;
    category?: string;
    q?: string;
  }>;
}) {
  const { locale } = await params;
  const {
    page: pageParam,
    tag: tagSlug,
    category: categorySlug,
    q: searchQuery,
  } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const { content: contentLocale, dict: dictLocale } =
    LOCALE_MAP[locale] ?? LOCALE_MAP.en;
  const dictionary = await getDictionary(dictLocale);
  const supabase = createStaticClient();

  const hasFilters = !!(tagSlug || categorySlug || searchQuery);
  const isFirstPage = page === 1 && !hasFilters;

  // Build base query
  let query = supabase
    .from("articles")
    .select("*, article_tags(tag_id, tags(*)), categories(*)", {
      count: "exact",
    })
    .eq("status", "published")
    .neq("en->>slug", "")
    .not("en->>slug", "is", null)
    .order("created_at", { ascending: false });

  // Category filter
  if (categorySlug) {
    const { data: catData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (catData) {
      query = query.eq("category_id", catData.id);
    }
  }

  // Tag filter
  if (tagSlug) {
    const { data: tagData } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tagSlug)
      .single();

    if (tagData) {
      const { data: articleIds } = await supabase
        .from("article_tags")
        .select("article_id")
        .eq("tag_id", tagData.id);

      const ids = (articleIds ?? []).map((a) => a.article_id);
      if (ids.length > 0) {
        query = query.in("id", ids);
      } else {
        query = query.in("id", ["__none__"]);
      }
    }
  }

  // Search filter
  if (searchQuery) {
    query = query.or(
      `en->>title.ilike.%${searchQuery}%,en->>excerpt.ilike.%${searchQuery}%,zh->>title.ilike.%${searchQuery}%,zh->>excerpt.ilike.%${searchQuery}%`,
    );
  }

  // Fetch one extra for hero on first page
  const fetchLimit = isFirstPage ? PAGE_SIZE + 1 : PAGE_SIZE;
  query = query.range(offset, offset + fetchLimit - 1);

  const { data: rawArticles, count } = await query;

  const allArticles: ArticleWithTags[] = (rawArticles ?? []).map(
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

  // Split hero from list on first page
  const heroArticle = isFirstPage ? allArticles[0] ?? null : null;
  const listArticles = isFirstPage ? allArticles.slice(1) : allArticles;
  const totalForPagination = isFirstPage
    ? Math.max(0, (count ?? 0) - 1)
    : (count ?? 0);
  const totalPages = Math.ceil(totalForPagination / PAGE_SIZE);

  // Fetch categories and tags for filter bars
  const [{ data: allCategories }, { data: allTags }] = await Promise.all([
    supabase.from("categories").select("*").order("display_order"),
    supabase.from("tags").select("*").order("name"),
  ]);

  // Build base path for pagination
  const filterParams = new URLSearchParams();
  if (tagSlug) filterParams.set("tag", tagSlug);
  if (categorySlug) filterParams.set("category", categorySlug);
  if (searchQuery) filterParams.set("q", searchQuery);
  const filterString = filterParams.toString();
  const basePath = filterString
    ? `/${locale}/writing?${filterString}`
    : `/${locale}/writing`;

  return (
    <div className="mx-auto w-full max-w-[var(--width-page)] px-6 py-16">
      <header className="mb-12">
        <h1 className="font-display text-[length:var(--text-display-lg)] leading-[var(--leading-display)] text-text-primary">
          {dictionary["writing.title"]}
        </h1>
        <p className="text-[length:var(--text-body)] text-text-secondary mt-3">
          {dictionary["writing.description"]}
        </p>
      </header>

      {/* Hero featured post */}
      {heroArticle && (
        <WritingHero
          article={heroArticle}
          locale={contentLocale}
          dictionary={dictionary}
        />
      )}

      {/* Category filter */}
      {(allCategories ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <CategoryPill
            name={dictionary["categories.all"] ?? "All"}
            slug=""
            active={!categorySlug}
            locale={locale}
            tagSlug={tagSlug}
            searchQuery={searchQuery}
          />
          {(allCategories ?? []).map((cat: Category) => (
            <CategoryPill
              key={cat.id}
              name={getLocalizedName(cat, contentLocale)}
              slug={cat.slug}
              active={cat.slug === categorySlug}
              locale={locale}
              tagSlug={tagSlug}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}

      {/* Tag filter + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
        {(allTags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2 flex-1">
            <TagLink
              tag={{
                id: "all",
                name: dictionary["tags.all"],
                name_zh: "",
                slug: "",
                created_at: "",
              }}
              active={!tagSlug}
              size="md"
              locale={contentLocale}
            />
            {(allTags ?? []).map((tag: Tag) => (
              <TagLink
                key={tag.id}
                tag={tag}
                active={tag.slug === tagSlug}
                size="md"
                locale={contentLocale}
              />
            ))}
          </div>
        )}
        <div className="w-full sm:w-64 shrink-0">
          <Suspense>
            <ArticleSearch />
          </Suspense>
        </div>
      </div>

      {/* Article list */}
      {listArticles.length > 0 ? (
        <div>
          {listArticles.map((article) => (
            <WritingCard
              key={article.id}
              article={article}
              locale={contentLocale}
              dictionary={dictionary}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <FileText className="h-10 w-10 text-text-quaternary mb-4" />
          <p className="text-text-secondary text-sm">
            {hasFilters
              ? (dictionary["writing.noResults"] ??
                "No articles matching your filters.")
              : (dictionary["writing.noArticles"] ?? "No articles yet.")}
          </p>
          {hasFilters && (
            <a
              href={`/${locale}/writing`}
              className="mt-3 text-sm text-accent-warm hover:underline"
            >
              {dictionary["writing.clearFilters"] ?? "Clear filters"}
            </a>
          )}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={basePath}
        dictionary={dictionary}
      />
    </div>
  );
}

function CategoryPill({
  name,
  slug,
  active,
  locale,
  tagSlug,
  searchQuery,
}: {
  name: string;
  slug: string;
  active: boolean;
  locale: string;
  tagSlug?: string;
  searchQuery?: string;
}) {
  const params = new URLSearchParams();
  if (slug) params.set("category", slug);
  if (tagSlug) params.set("tag", tagSlug);
  if (searchQuery) params.set("q", searchQuery);
  const qs = params.toString();
  const href = `/${locale}/writing${qs ? `?${qs}` : ""}`;

  return (
    <a
      href={href}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-accent-warm text-bg-primary"
          : "bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover"
      }`}
    >
      {name}
    </a>
  );
}
