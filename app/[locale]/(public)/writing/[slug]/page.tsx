import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { WritingCard } from "@/components/features/writing-card";
import { Pagination } from "@/components/features/pagination";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocalizedName } from "@/lib/utils/localized-name";
import { SITE } from "@/lib/constants";
import type { ArticleWithTags, Tag, Category, WritingType, ContentLocale } from "@/lib/types";
import type { Locale } from "@/lib/i18n/types";
import type { Metadata } from "next";

const LOCALE_MAP: Record<string, { content: ContentLocale; dict: Locale }> = {
  en: { content: "en", dict: "en" },
  zh: { content: "zh", dict: "zh-cn" },
};

const PAGE_SIZE = 10;

async function getColumn(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("writing_types")
    .select("*")
    .eq("slug", slug)
    .eq("is_default", false)
    .single();
  return data as WritingType | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { content: contentLocale } = LOCALE_MAP[locale] ?? LOCALE_MAP.en;
  const column = await getColumn(slug);

  if (!column) return {};

  const name = getLocalizedName(column, contentLocale);

  return {
    title: name,
    description: column.description || undefined,
    alternates: {
      canonical: `${SITE.url}/${locale}/writing/${slug}`,
      languages: {
        en: `${SITE.url}/en/writing/${slug}`,
        "zh-CN": `${SITE.url}/zh/writing/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      url: `${SITE.url}/${locale}/writing/${slug}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ColumnPage({
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

  const column = await getColumn(slug);
  if (!column) notFound();

  const supabase = await createClient();

  const { data: rawArticles, count } = await supabase
    .from("articles")
    .select("*, article_tags(tag_id, tags(*)), categories(*)", {
      count: "exact",
    })
    .eq("status", "published")
    .eq("writing_type_id", column.id)
    .neq("en->>slug", "")
    .not("en->>slug", "is", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const articles: ArticleWithTags[] = (rawArticles ?? []).map((a) => {
    const { article_tags, categories, ...rest } = a as Record<string, unknown> & {
      article_tags?: { tag_id: string; tags: Tag }[];
      categories?: Category;
    };
    return {
      ...rest,
      tags: (article_tags ?? []).map((at) => at.tags),
      category: categories ?? null,
    } as ArticleWithTags;
  });

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const basePath = `/${locale}/writing/${slug}`;
  const columnName = getLocalizedName(column, contentLocale);

  return (
    <div className="mx-auto w-full max-w-[var(--width-page)] px-6 py-16">
      <header className="mb-12">
        <h1 className="font-display text-[length:var(--text-display-lg)] leading-[var(--leading-display)] text-text-primary">
          {columnName}
        </h1>
        {column.description && (
          <p className="text-[length:var(--text-body)] text-text-secondary mt-3">
            {column.description}
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
        <div className="flex flex-col items-center py-16 text-center">
          <FileText className="h-10 w-10 text-text-quaternary mb-4" />
          <p className="text-text-secondary text-sm">
            {dictionary["writing.noArticles"]}
          </p>
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
