import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { SITE, SUPPORT } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
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
    description: `Support ${SITE.author.name}'s writing — help keep this space independent and ad-free.`,
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

  const tiers = [
    { label: d["support.coffeeLabel"], price: d["support.coffeePrice"], href: SUPPORT.stripe.coffee },
    { label: d["support.mealLabel"], price: d["support.mealPrice"], href: SUPPORT.stripe.meal },
    { label: d["support.patronLabel"], price: d["support.patronPrice"], href: SUPPORT.stripe.patron },
  ];

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

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-3">
            {d["support.internationalTitle"]}
          </p>
          <p className="text-[length:var(--text-body-sm)] text-text-secondary mb-6">
            {d["support.internationalDescription"]}
          </p>
          <div className="flex flex-col gap-3">
            {tiers.map(({ label, price, href }) => (
              <a
                key={label}
                href={href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between rounded-[var(--radius-md)] border border-border px-4 py-3 text-sm transition-all duration-[var(--duration-fast)] ${
                  href
                    ? "text-text-primary hover:border-accent-warm hover:text-accent-warm"
                    : "text-text-quaternary pointer-events-none opacity-50"
                }`}
              >
                <span>{label}</span>
                <span className="flex items-center gap-2 text-text-tertiary">
                  {price}
                  {href && <ExternalLink className="h-3.5 w-3.5" />}
                </span>
              </a>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-3">
            {d["support.chinaTitle"]}
          </p>
          <p className="text-[length:var(--text-body-sm)] text-text-secondary mb-6">
            {d["support.chinaDescription"]}
          </p>
          <div className="flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-white p-4">
            <Image
              src={SUPPORT.alipay.qrCode}
              alt="Alipay QR Code"
              width={200}
              height={200}
              className="h-auto w-full max-w-[200px]"
            />
          </div>
        </Card>
      </div>

      <Separator ornament className="mt-12" />

      <blockquote className="mt-12 border-l-2 border-l-accent-warm pl-6">
        <p className="font-display italic text-[length:var(--text-body-lg)] text-accent-warm leading-[var(--leading-body)]">
          {d["support.thankYouBody"]}
        </p>
      </blockquote>
    </div>
  );
}
