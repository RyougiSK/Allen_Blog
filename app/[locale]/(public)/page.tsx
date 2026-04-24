import Link from "next/link";
import { createStaticClient } from "@/utils/supabase/static";
import { HeroSection } from "@/components/features/hero-section";
import { SelectedWriting } from "@/components/features/selected-writing";
import { AuthorSection } from "@/components/features/author-section";
import { Reveal } from "@/components/features/reveal";
import { Separator } from "@/components/ui/separator";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { ArticleWithTags, Tag, ThreadWithTags, ContentLocale } from "@/lib/types";
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

  const { data: rawThreads } = await supabase
    .from("threads")
    .select("*, thread_tags(tag_id, tags(*))")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3);

  const recentThreads: ThreadWithTags[] = (rawThreads ?? []).map((t) => {
    const { thread_tags, ...rest } = t as Record<string, unknown> & {
      thread_tags?: { tag_id: string; tags: Tag }[];
    };
    return {
      ...rest,
      tags: (thread_tags ?? []).map((tt) => tt.tags),
    } as ThreadWithTags;
  });

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

      {recentThreads.length > 0 && (
        <Reveal className="mt-[var(--spacing-section)]" delay={80}>
          <div className="mx-auto w-full max-w-[var(--width-content)] px-6">
            <Separator className="mb-[var(--spacing-section)]" />
          </div>
          <section>
            <div className="mx-auto w-full max-w-[var(--width-page)] px-6">
              <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-6">
                {dictionary["home.threads"]}
              </p>
              <div className="space-y-4">
                {recentThreads.map((thread) => {
                  const content =
                    contentLocale === "zh" && thread.content_zh.trim()
                      ? thread.content_zh
                      : thread.content_en;
                  const snippet =
                    content.length > 120 ? content.slice(0, 120) + "…" : content;
                  return (
                    <div
                      key={thread.id}
                      className="border-l-2 border-l-accent-warm/30 pl-4 py-2"
                    >
                      <p className="text-[length:var(--text-body-sm)] text-text-secondary leading-[var(--leading-body)]">
                        {snippet}
                      </p>
                    </div>
                  );
                })}
              </div>
              <Link
                href={`/${urlLocale}/themes`}
                className="inline-block mt-6 text-[length:var(--text-caption)] text-text-tertiary hover:text-accent-warm transition-colors"
              >
                {dictionary["home.viewAll"] ?? "View all"} &rarr;
              </Link>
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
