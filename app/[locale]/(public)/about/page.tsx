import Link from "next/link";
import { SITE } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/types";
import type { Metadata } from "next";

const LOCALE_MAP: Record<string, Locale> = { en: "en", zh: "zh-cn" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "About",
    description: `About ${SITE.author.name} — BI analyst, consultant, and writer based in Australia.`,
    alternates: {
      canonical: `${SITE.url}/${locale}/about`,
      languages: {
        en: `${SITE.url}/en/about`,
        "zh-CN": `${SITE.url}/zh/about`,
      },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictLocale = LOCALE_MAP[locale] ?? "en";
  const d = await getDictionary(dictLocale);

  return (
    <div className="mx-auto w-full max-w-[var(--width-content)] px-6 py-16">
      <header className="mb-12">
        <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary">
          {d["about.tagline"]}
        </p>
        <h1 className="font-display text-[length:var(--text-display-lg)] leading-[var(--leading-display)] text-text-primary mt-4">
          {SITE.author.name}
        </h1>
        <p className="text-[length:var(--text-body-lg)] text-text-secondary mt-4 leading-[var(--leading-body)]">
          {d["site.authorBio"]}
        </p>
      </header>

      <Separator ornament />

      <div className="prose-editorial prose prose-invert max-w-none mt-12">
        <p>{d["about.bio1"]}</p>
        <p>{d["about.bio2"]}</p>
      </div>

      <Separator ornament className="mt-12" />

      <section className="mt-12">
        <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-6">
          {d["about.whatIWrite"]}
        </p>
        <div className="prose-editorial prose prose-invert max-w-none">
          <p>{d["about.whatIWriteBody"]}</p>
        </div>
        <div className="mt-6">
          <Link
            href={`/${locale}/themes`}
            className="text-[length:var(--text-caption)] text-text-tertiary transition-colors duration-[var(--duration-fast)] hover:text-accent-warm"
          >
            {d["about.browseThemes"]} &rarr;
          </Link>
        </div>
      </section>

      <Separator ornament className="mt-12" />

      <blockquote className="mt-12 border-l-2 border-l-accent-warm pl-6">
        <p className="font-display italic text-[length:var(--text-body-lg)] text-accent-warm leading-[var(--leading-body)]">
          {d["about.quote"]}
        </p>
      </blockquote>

      <Separator ornament className="mt-12" />

      <section className="mt-12">
        <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-6">
          {d["about.elsewhere"]}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/${locale}/writing`}
            className="text-[length:var(--text-caption)] text-text-tertiary transition-colors duration-[var(--duration-fast)] hover:text-accent-warm"
          >
            {d["about.readWriting"]} &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
