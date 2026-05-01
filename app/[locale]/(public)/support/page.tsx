import { SITE } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { SupportModule } from "@/components/features/support-module";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/types";
import type { Metadata } from "next";

const LOCALE_MAP: Record<string, Locale> = { en: "en", zh: "zh-cn" };

export const revalidate = 86400;

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
    title: "Support",
    description: `Support ${SITE.author.name}'s writing — help this site stay independent.`,
    alternates: {
      canonical: `${SITE.url}/${locale}/support`,
      languages: {
        en: `${SITE.url}/en/support`,
        "zh-CN": `${SITE.url}/zh/support`,
      },
    },
  };
}

export default async function SupportPage({
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
          {d["support.tagline"]}
        </p>
        <h1 className="font-display text-[length:var(--text-display-lg)] leading-[var(--leading-display)] text-text-primary mt-4">
          {d["support.title"]}
        </h1>
        <p className="text-[length:var(--text-body-lg)] text-text-secondary mt-4 leading-[var(--leading-body)]">
          {d["support.description"]}
        </p>
      </header>

      <Separator ornament />

      <section className="mt-12">
        <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-6">
          {d["support.whyTitle"]}
        </p>
        <div className="prose-editorial prose prose-invert max-w-none">
          <p>{d["support.whyBody"]}</p>
        </div>
      </section>

      <Separator ornament className="mt-12" />

      <section className="mt-12">
        <SupportModule variant="full" />
      </section>

      <Separator ornament className="mt-12" />

      <blockquote className="mt-12 border-l-2 border-l-accent-warm pl-6">
        <p className="font-display italic text-[length:var(--text-body-lg)] text-accent-warm leading-[var(--leading-body)]">
          {d["support.thankYouBody"]}
        </p>
      </blockquote>
    </div>
  );
}
