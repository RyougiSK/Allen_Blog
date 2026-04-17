import { createClient } from "@/utils/supabase/server";
import { HeroSection } from "@/components/features/hero-section";
import { SelectedWriting } from "@/components/features/selected-writing";
import { ThemeCard } from "@/components/features/theme-card";
import { AuthorSection } from "@/components/features/author-section";
import { Reveal } from "@/components/features/reveal";
import { Separator } from "@/components/ui/separator";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { ArticleWithTags, Tag, TagWithCount, ContentLocale } from "@/lib/types";
import type { Locale } from "@/lib/i18n/types";
import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

const LOCALE_MAP: Record<string, { content: ContentLocale; dict: Locale }> = {
  en: { content: "en", dict: "en" },
  zh: { content: "zh", dict: "zh-cn" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const other = locale === "en" ? "zh" : "en";
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
  const supabase = await createClient();

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

  const { data: rawTags } = await supabase
    .from("tags")
    .select("*, article_tags(article_id)")
    .order("name");

  const articleIds = articles.map((a) => a.id);
  const themes: TagWithCount[] = (rawTags ?? [])
    .map((t) => ({
      ...t,
      postCount: (t.article_tags ?? []).filter(
        (at: { article_id: string }) => articleIds.includes(at.article_id),
      ).length,
      article_tags: undefined,
    }))
    .filter((t: TagWithCount) => t.postCount > 0);

  const featured = articles.slice(0, 2);
  const recent = articles.slice(2);

  const urlLocale = locale === "zh" ? "zh" : "en";

  return (
    <>
      <HeroSection dictionary={dictionary} locale={urlLocale} />

      {(featured.length > 0 || recent.length > 0) && (
        <Reveal className="mt-[var(--spacing-section)]">
          <SelectedWriting
            featured={featured}
            recent={recent}
            locale={contentLocale}
            dictionary={dictionary}
          />
        </Reveal>
      )}

      {themes.length > 0 && (
        <Reveal className="mt-[var(--spacing-section)]" delay={80}>
          <div className="mx-auto w-full max-w-[var(--width-content)] px-6">
            <Separator className="mb-[var(--spacing-section)]" />
          </div>
          <section>
            <div className="mx-auto w-full max-w-[var(--width-page)] px-6">
              <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-8">
                {dictionary["home.threads"]}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {themes.map((tag) => (
                  <ThemeCard key={tag.id} tag={tag} locale={contentLocale} dictionary={dictionary} />
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      )}

      <Reveal className="mt-[var(--spacing-section)]" delay={160}>
        <div className="mx-auto w-full max-w-[var(--width-content)] px-6">
          <Separator ornament className="mb-[var(--spacing-section)]" />
        </div>
        <AuthorSection dictionary={dictionary} locale={urlLocale} />
      </Reveal>

    </>
  );
}
