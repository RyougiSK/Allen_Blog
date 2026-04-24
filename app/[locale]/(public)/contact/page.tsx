import { SITE } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { ContactForm } from "@/components/features/contact-form";
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
    title: "Contact",
    description: `Contact ${SITE.author.name} — for interviews, collaborations, speaking engagements, or professional inquiries.`,
    alternates: {
      canonical: `${SITE.url}/${locale}/contact`,
      languages: {
        en: `${SITE.url}/en/contact`,
        "zh-CN": `${SITE.url}/zh/contact`,
      },
    },
  };
}

export default async function ContactPage({
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
          {d["contact.tagline"]}
        </p>
        <h1 className="font-display text-[length:var(--text-display-lg)] leading-[var(--leading-display)] text-text-primary mt-4">
          {d["contact.title"]}
        </h1>
        <p className="text-[length:var(--text-body-lg)] text-text-secondary mt-4 leading-[var(--leading-body)]">
          {d["contact.description"]}
        </p>
      </header>

      <Separator ornament />

      <div className="mt-12">
        <ContactForm />
      </div>

      <p className="text-[length:var(--text-micro)] text-text-quaternary mt-8">
        {d["contact.responseTime"]}
      </p>
    </div>
  );
}
