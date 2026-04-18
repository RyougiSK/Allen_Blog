import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { fetchPublishedThreads } from "@/lib/actions/threads";
import { ThreadCard } from "@/components/features/thread-card";
import { Pagination } from "@/components/features/pagination";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocalizedName } from "@/lib/utils/localized-name";
import { SITE } from "@/lib/constants";
import { format, parseISO } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import type { ContentLocale, Tag } from "@/lib/types";
import type { Locale } from "@/lib/i18n/types";
import type { Metadata } from "next";

const LOCALE_MAP: Record<string, { content: ContentLocale; dict: Locale }> = {
  en: { content: "en", dict: "en" },
  zh: { content: "zh", dict: "zh-cn" },
};

const PAGE_SIZE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { dict: dictLocale } = LOCALE_MAP[locale] ?? LOCALE_MAP.en;
  const dictionary = await getDictionary(dictLocale);

  return {
    title: dictionary["themes.title"] ?? "Threads",
    description: dictionary["themes.description"],
    alternates: {
      canonical: `${SITE.url}/${locale}/themes`,
      languages: {
        en: `${SITE.url}/en/themes`,
        "zh-CN": `${SITE.url}/zh/themes`,
      },
    },
  };
}

export default async function ThreadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const { locale } = await params;
  const { page: pageParam, tag: tagSlug } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const { content: contentLocale, dict: dictLocale } =
    LOCALE_MAP[locale] ?? LOCALE_MAP.en;
  const dictionary = await getDictionary(dictLocale);
  const supabase = await createClient();

  const { threads, total } = await fetchPublishedThreads({
    limit: PAGE_SIZE,
    offset,
    tagSlug,
  });

  const { data: allTags } = await supabase
    .from("tags")
    .select("*")
    .order("name");

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filterParams = new URLSearchParams();
  if (tagSlug) filterParams.set("tag", tagSlug);
  const filterString = filterParams.toString();
  const basePath = filterString
    ? `/${locale}/themes?${filterString}`
    : `/${locale}/themes`;

  const dateFmtLocale = contentLocale === "zh" ? zhCN : enUS;

  let lastDate = "";

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

      {/* Tag filter */}
      {(allTags ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href={`/${locale}/themes`}
            className={`rounded-[var(--radius-sm)] border px-3 py-1 text-[length:var(--text-caption)] transition-colors ${
              !tagSlug
                ? "border-accent-warm/30 bg-accent-warm/10 text-accent-warm"
                : "border-border bg-surface text-text-tertiary hover:text-text-primary hover:border-border-emphasis"
            }`}
          >
            {dictionary["categories.all"] ?? "All"}
          </Link>
          {(allTags ?? []).map((tag: Tag) => (
            <Link
              key={tag.id}
              href={`/${locale}/themes?tag=${tag.slug}`}
              className={`rounded-[var(--radius-sm)] border px-3 py-1 text-[length:var(--text-caption)] transition-colors ${
                tag.slug === tagSlug
                  ? "border-accent-warm/30 bg-accent-warm/10 text-accent-warm"
                  : "border-border bg-surface text-text-tertiary hover:text-text-primary hover:border-border-emphasis"
              }`}
            >
              {getLocalizedName(tag, contentLocale)}
            </Link>
          ))}
        </div>
      )}

      {/* Thread feed with date grouping */}
      {threads.length > 0 ? (
        <div className="space-y-1">
          {threads.map((thread) => {
            const dateStr = format(parseISO(thread.created_at), "MMMM d, yyyy", {
              locale: dateFmtLocale,
            });
            const showDate = dateStr !== lastDate;
            lastDate = dateStr;

            return (
              <div key={thread.id}>
                {showDate && (
                  <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary pt-8 pb-4 first:pt-0">
                    {dateStr}
                  </p>
                )}
                <ThreadCard thread={thread} locale={contentLocale} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <MessageSquare className="h-10 w-10 text-text-quaternary mb-4" />
          <p className="text-text-secondary text-sm">
            {dictionary["themes.noThemes"]}
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
