import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ThemeCard } from "@/components/features/theme-card";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocalizedName } from "@/lib/utils/localized-name";
import { fetchCategoriesWithCounts } from "@/lib/actions/categories";
import { SITE } from "@/lib/constants";
import type { TagWithCount, ContentLocale } from "@/lib/types";
import type { Locale } from "@/lib/i18n/types";
import type { Metadata } from "next";

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
  return {
    title: "Themes",
    description: "Topics and themes explored across the writing.",
    alternates: {
      canonical: `${SITE.url}/${locale}/themes`,
      languages: {
        en: `${SITE.url}/en/themes`,
        "zh-CN": `${SITE.url}/zh/themes`,
      },
    },
  };
}

export default async function ThemesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { content: contentLocale, dict: dictLocale } =
    LOCALE_MAP[locale] ?? LOCALE_MAP.en;
  const dictionary = await getDictionary(dictLocale);
  const supabase = await createClient();

  // Fetch categories with article counts
  const categories = await fetchCategoriesWithCounts();

  // Fetch tags with article counts
  const { data: rawTags } = await supabase
    .from("tags")
    .select("*, article_tags(article_id, articles!inner(status, en, zh))")
    .eq("article_tags.articles.status", "published")
    .order("name");

  const col = contentLocale;
  const themes: TagWithCount[] = (rawTags ?? [])
    .map((t) => {
      const validArticles = (t.article_tags ?? []).filter(
        (at: { article_id: string; articles: Record<string, unknown> }) => {
          const art = at.articles as Record<string, unknown>;
          const lang = art[col] as Record<string, unknown> | undefined;
          return lang?.slug && lang.slug !== "";
        },
      );
      return {
        ...t,
        postCount: validArticles.length,
        article_tags: undefined,
      };
    })
    .filter((t: TagWithCount) => t.postCount > 0);

  return (
    <div className="mx-auto w-full max-w-[var(--width-page)] px-6 py-16">
      <header className="mb-12">
        <h1 className="font-display text-[length:var(--text-display-lg)] leading-[var(--leading-display)] text-text-primary">
          {dictionary["themes.title"]}
        </h1>
        <p className="text-[length:var(--text-body)] text-text-secondary mt-3">
          {dictionary["themes.description"]}
        </p>
      </header>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xs font-medium uppercase tracking-[var(--tracking-widest)] text-text-tertiary mb-6">
            {dictionary["categories.label"] ?? "Categories"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${locale}/category/${cat.slug}`}
                className="group rounded-[var(--radius-lg)] border border-border bg-bg-secondary p-6 transition-all duration-[var(--duration-normal)] hover:border-border-emphasis hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
              >
                <h3 className="font-display text-lg text-text-primary transition-colors group-hover:text-accent-warm">
                  {getLocalizedName(cat, contentLocale)}
                </h3>
                {cat.description && (
                  <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                    {cat.description}
                  </p>
                )}
                <p className="text-xs text-text-quaternary mt-3">
                  {cat.articleCount}{" "}
                  {cat.articleCount === 1 ? "article" : "articles"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tags Section */}
      {themes.length > 0 && (
        <section>
          <h2 className="text-xs font-medium uppercase tracking-[var(--tracking-widest)] text-text-tertiary mb-6">
            {dictionary["tags.label"] ?? "Tags"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((tag) => (
              <ThemeCard
                key={tag.id}
                tag={tag}
                locale={contentLocale}
                dictionary={dictionary}
              />
            ))}
          </div>
        </section>
      )}

      {categories.length === 0 && themes.length === 0 && (
        <p className="text-text-tertiary py-12 text-center">
          {dictionary["themes.noThemes"]}
        </p>
      )}
    </div>
  );
}
