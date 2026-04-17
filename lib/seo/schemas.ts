import { SITE } from "@/lib/constants";
import { getLocalizedName } from "@/lib/utils/localized-name";
import type { Article, ContentLocale, Tag } from "@/lib/types";

export function buildBlogPostingSchema(
  article: Article & { tags: Tag[] },
  locale: ContentLocale,
  readingTime: number,
) {
  const lang = article[locale];
  const urlLocale = locale === "en" ? "en" : "zh";
  const inLanguage = locale === "en" ? "en" : "zh-CN";

  const text = lang.content.replace(/<[^>]*>/g, "").replace(/[#*`>\-\[\]!()]/g, "");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: lang.title,
    description: lang.meta?.meta_description || lang.excerpt || undefined,
    image: article.cover_image || undefined,
    datePublished: article.created_at,
    dateModified: article.updated_at || article.created_at,
    author: [
      {
        "@type": "Person",
        name: SITE.author.name,
        url: SITE.url,
        worksFor: {
          "@type": "Organization",
          name: SITE.name,
          url: SITE.url,
        },
      },
    ],
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.url}/${urlLocale}/${lang.slug}`,
    },
    url: `${SITE.url}/${urlLocale}/${lang.slug}`,
    inLanguage,
    wordCount,
    timeRequired: `PT${readingTime}M`,
    keywords: article.tags.map((t) => getLocalizedName(t, locale)),
    ...(article.tags.length > 0 && {
      about: article.tags.map((t) => ({
        "@type": "Thing",
        name: getLocalizedName(t, locale),
      })),
    }),
    articleSection: "Blog",
    isAccessibleForFree: true,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".prose-editorial"],
    },
  };
}

type BreadcrumbItem = { name: string; url?: string };

export function buildBreadcrumbSchema(
  locale: string,
  items: BreadcrumbItem[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url && {
        item: item.url.startsWith("http")
          ? item.url
          : `${SITE.url}${item.url}`,
      }),
    })),
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    author: {
      "@type": "Person",
      name: SITE.author.name,
    },
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.author.name,
    url: SITE.url,
    description: SITE.author.bio,
    knowsAbout: [
      "Business Intelligence",
      "Data Analytics",
      "Technology",
      "Design",
    ],
  };
}
