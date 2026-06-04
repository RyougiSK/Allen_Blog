import { createStaticClient } from "@/utils/supabase/static";
import { HeroSection } from "@/components/features/hero-section";
import { SelectedWriting } from "@/components/features/selected-writing";
import { ReflectionSection } from "@/components/features/reflection-section";
import { Reveal } from "@/components/features/reveal";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { ArticleWithTags, Tag, ContentLocale } from "@/lib/types";
import type { Locale } from "@/lib/i18n/types";
import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

const LOCALE_MAP: Record<string, { content: ContentLocale; dict: Locale }> = {
  en: { content: "en", dict: "en" },
  zh: { content: "zh", dict: "zh-cn" },
};

export const revalidate = 60;

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: {
      languages: {
        en: `${SITE.url}/en`,
        "zh-CN": `${SITE.url}/zh`,
      },
      canonical: `${SITE.url}/${locale}`,
    },
    openGraph: {
      url: `${SITE.url}/${locale}`,
      locale: locale === "en" ? "en_US" : "zh_CN",
      alternateLocale: locale === "en" ? "zh_CN" : "en_US",
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { content: contentLocale, dict: dictLocale } = LOCALE_MAP[locale] ?? LOCALE_MAP.en;
  const dictionary = await getDictionary(dictLocale);
  const supabase = createStaticClient();

  const { data: rawArticles } = await supabase
    .from("articles")
    .select("*, article_tags(tag_id, tags(*))")
    .eq("status", "published")
    .neq("en->>slug", "")
    .not("en->>slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(6);

  const articles: ArticleWithTags[] = (rawArticles ?? []).map((a) => ({
    ...a,
    tags: (a.article_tags ?? []).map(
      (at: { tag_id: string; tags: Tag }) => at.tags,
    ),
    article_tags: undefined,
  }));

  const featured = articles.slice(0, 2);
  const recent = articles.slice(2);

  const urlLocale = locale === "zh" ? "zh" : "en";

  return (
    <>
      <HeroSection dictionary={dictionary} locale={urlLocale} />

      {(featured.length > 0 || recent.length > 0) && (
        <Reveal className="mt-[var(--spacing-section)]" delay={80}>
          <SelectedWriting
            featured={featured}
            recent={recent}
            locale={contentLocale}
            dictionary={dictionary}
          />
        </Reveal>
      )}

      <Reveal className="mt-16" delay={160}>
        <ReflectionSection dictionary={dictionary} locale={urlLocale} />
      </Reveal>
    </>
  );
}
