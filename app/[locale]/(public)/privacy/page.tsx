import { SITE } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
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
    title: "Privacy Policy",
    description: `Privacy Policy for ${SITE.name}`,
    alternates: {
      canonical: `${SITE.url}/${locale}/privacy`,
      languages: {
        en: `${SITE.url}/en/privacy`,
        "zh-CN": `${SITE.url}/zh/privacy`,
      },
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictLocale = LOCALE_MAP[locale] ?? "en";
  const d = await getDictionary(dictLocale);

  const sections = [
    { title: d["privacy.collectTitle"], body: d["privacy.collectBody"] },
    { title: d["privacy.useTitle"], body: d["privacy.useBody"] },
    { title: d["privacy.thirdPartyTitle"], body: d["privacy.thirdPartyBody"] },
    { title: d["privacy.cookiesTitle"], body: d["privacy.cookiesBody"] },
    { title: d["privacy.rightsTitle"], body: d["privacy.rightsBody"] },
    { title: d["privacy.retentionTitle"], body: d["privacy.retentionBody"] },
    { title: d["privacy.contactTitle"], body: d["privacy.contactBody"] },
  ];

  return (
    <div className="mx-auto w-full max-w-[var(--width-content)] px-6 py-16">
      <header className="mb-12">
        <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary">
          {d["privacy.tagline"]}
        </p>
        <h1 className="font-display text-[length:var(--text-display-lg)] leading-[var(--leading-display)] text-text-primary mt-4">
          {d["privacy.title"]}
        </h1>
        <p className="text-[length:var(--text-body-lg)] text-text-secondary mt-4 leading-[var(--leading-body)]">
          {d["privacy.description"]}
        </p>
        <p className="text-[length:var(--text-micro)] text-text-quaternary mt-2">
          {d["privacy.lastUpdated"]}
        </p>
      </header>

      <Separator ornament />

      {sections.map(({ title, body }, i) => (
        <section key={title} className="mt-12">
          <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-6">
            {title}
          </p>
          <div className="prose-editorial prose prose-invert max-w-none">
            <p>{body}</p>
          </div>
          {i < sections.length - 1 && <Separator ornament className="mt-12" />}
        </section>
      ))}
    </div>
  );
}
