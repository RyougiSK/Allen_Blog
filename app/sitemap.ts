import { createClient } from "@/utils/supabase/server";
import { SITE } from "@/lib/constants";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("en, zh, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of ["en", "zh"] as const) {
    entries.push({
      url: `${SITE.url}/${locale}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          en: `${SITE.url}/en`,
          "zh-CN": `${SITE.url}/zh`,
        },
      },
    });

    entries.push({
      url: `${SITE.url}/${locale}/writing`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          en: `${SITE.url}/en/writing`,
          "zh-CN": `${SITE.url}/zh/writing`,
        },
      },
    });

    entries.push({
      url: `${SITE.url}/${locale}/themes`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE.url}/en/themes`,
          "zh-CN": `${SITE.url}/zh/themes`,
        },
      },
    });

    entries.push({
      url: `${SITE.url}/${locale}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: {
        languages: {
          en: `${SITE.url}/en/about`,
          "zh-CN": `${SITE.url}/zh/about`,
        },
      },
    });

    entries.push({
      url: `${SITE.url}/${locale}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          en: `${SITE.url}/en/contact`,
          "zh-CN": `${SITE.url}/zh/contact`,
        },
      },
    });

    entries.push({
      url: `${SITE.url}/${locale}/support`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: {
        languages: {
          en: `${SITE.url}/en/support`,
          "zh-CN": `${SITE.url}/zh/support`,
        },
      },
    });
  }

  for (const article of articles ?? []) {
    const en = article.en as { slug?: string; completed?: boolean } | null;
    const zh = article.zh as { slug?: string; completed?: boolean } | null;
    const slug = en?.slug;

    if (!slug) continue;

    const alternates: Record<string, string> = {};
    if (en?.completed) alternates.en = `${SITE.url}/en/${slug}`;
    if (zh?.completed) alternates["zh-CN"] = `${SITE.url}/zh/${slug}`;

    if (en?.completed) {
      entries.push({
        url: `${SITE.url}/en/${slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: alternates },
      });
    }

    if (zh?.completed) {
      entries.push({
        url: `${SITE.url}/zh/${slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
