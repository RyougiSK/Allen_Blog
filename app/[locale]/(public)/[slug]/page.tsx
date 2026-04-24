import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import { createStaticClient } from "@/utils/supabase/static";
import { TiptapRenderer } from "@/components/features/tiptap-renderer";
import { ArticleHeader } from "@/components/features/article-header";
import { ReadingProgress } from "@/components/features/reading-progress";
import { StructuredData } from "@/components/seo/structured-data";
import { ArticleBottomActions } from "@/components/features/article-bottom-actions";
import { RelatedArticles } from "@/components/features/related-articles";
import { TableOfContents } from "@/components/features/table-of-contents";
import { SITE } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildBlogPostingSchema, buildBreadcrumbSchema } from "@/lib/seo/schemas";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { extractToc } from "@/lib/utils/toc";
import type { Tag, Article, ContentLocale } from "@/lib/types";
import type { Locale } from "@/lib/i18n/types";
import type { Metadata } from "next";

const LOCALE_MAP: Record<string, { content: ContentLocale; dict: Locale }> = {
  en: { content: "en", dict: "en" },
  zh: { content: "zh", dict: "zh-cn" },
};

const getArticleBySlug = cache(async (slug: string) => {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("articles")
    .select("*, article_tags(tag_id, tags(*))")
    .eq("status", "published")
    .eq("en->>slug", slug)
    .single();
  return data;
});

export const revalidate = 60;

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("en")
    .eq("status", "published")
    .neq("en->>slug", "")
    .not("en->>slug", "is", null);

  const slugs = (articles ?? []).map((a) => a.en?.slug).filter(Boolean);
  return slugs.flatMap((slug) => [
    { locale: "en", slug },
    { locale: "zh", slug },
  ]);
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const { content: contentLocale } = LOCALE_MAP[locale] ?? LOCALE_MAP.en;

  const article = await getArticleBySlug(slug);

  if (!article) return { title: "Not Found" };

  const lang = article[contentLocale];
  const title = lang.meta?.meta_title || lang.title;
  const description = lang.meta?.meta_description || lang.excerpt || undefined;

  return {
    title,
    description,
    keywords: lang.meta?.keywords,
    alternates: {
      canonical: `${SITE.url}/${locale}/${slug}`,
      languages: {
        en: `${SITE.url}/en/${slug}`,
        "zh-CN": `${SITE.url}/zh/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE.url}/${locale}/${lang.slug}`,
      locale: locale === "en" ? "en_US" : "zh_CN",
      alternateLocale: locale === "en" ? "zh_CN" : "en_US",
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      images: article.cover_image ? [{ url: article.cover_image }] : undefined,
      authors: [SITE.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.cover_image ? [article.cover_image] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const { content: contentLocale, dict: dictLocale } = LOCALE_MAP[locale] ?? LOCALE_MAP.en;
  const dictionary = await getDictionary(dictLocale);

  const rawArticle = await getArticleBySlug(slug);

  if (!rawArticle) notFound();

  const article: Article & { tags: Tag[] } = {
    ...rawArticle,
    tags: (rawArticle.article_tags ?? []).map(
      (at: { tag_id: string; tags: Tag }) => at.tags,
    ),
  };

  const lang = article[contentLocale];
  const otherLocale: ContentLocale = contentLocale === "en" ? "zh" : "en";
  const otherLang = article[otherLocale];
  const otherUrlLocale = otherLocale === "en" ? "en" : "zh";

  const hasTranslation = otherLang?.completed;
  const readingTime = calculateReadingTime(lang.content);
  const tocItems = extractToc(lang.content);

  const blogPostingSchema = buildBlogPostingSchema(article, contentLocale, readingTime);
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [
    { name: dictionary["nav.home"] ?? "Home", url: `/${locale}` },
    { name: dictionary["nav.writing"], url: `/${locale}/writing` },
    { name: lang.title },
  ]);

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto w-full max-w-[var(--width-content)] px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <Link
            href={`/${locale}/writing`}
            className="inline-flex items-center gap-1.5 text-[length:var(--text-caption)] text-text-tertiary hover:text-text-primary transition-colors duration-[var(--duration-fast)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {dictionary["writing.backToWriting"]}
          </Link>
          {hasTranslation && (
            <Link
              href={`/${otherUrlLocale}/${slug}`}
              className="inline-flex items-center gap-1.5 text-[length:var(--text-caption)] text-text-tertiary hover:text-accent-warm transition-colors duration-[var(--duration-fast)]"
            >
              <Globe className="h-3.5 w-3.5" />
              {dictionary["article.readInOther"]}
            </Link>
          )}
        </div>

        <article>
          <ArticleHeader
            title={lang.title}
            subtitle={lang.subtitle}
            excerpt={lang.excerpt}
            date={article.created_at}
            tags={article.tags}
            readingTime={readingTime}
            locale={contentLocale}
            coverImage={article.cover_image}
          />
          <TableOfContents items={tocItems} />
          <TiptapRenderer content={lang.content} />
        </article>
        <ArticleBottomActions
          title={lang.title}
          description={lang.excerpt}
          url={`${SITE.url}/${locale}/${slug}`}
        />

        <RelatedArticles
          currentArticleId={article.id}
          tagIds={article.tags.map((t) => t.id)}
          locale={contentLocale}
          dictionary={dictionary}
        />

        <StructuredData data={blogPostingSchema} />
        <StructuredData data={breadcrumbSchema} />
      </div>
    </>
  );
}
