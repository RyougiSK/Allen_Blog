import { SITE } from "@/lib/constants";
import { SubscribeForm } from "@/components/features/subscribe-form";
import { Separator } from "@/components/ui/separator";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { SubscribeConfirmation } from "./subscribe-confirmation";
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
    title: "Subscribe",
    description: `Subscribe to ${SITE.name} — occasional dispatches on technology, design, and the things worth thinking about.`,
    alternates: {
      canonical: `${SITE.url}/${locale}/subscribe`,
      languages: {
        en: `${SITE.url}/en/subscribe`,
        "zh-CN": `${SITE.url}/zh/subscribe`,
      },
    },
  };
}

export default async function SubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ confirmed?: string; error?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const dictLocale = LOCALE_MAP[locale] ?? "en";
  const dictionary = await getDictionary(dictLocale);

  return (
    <div className="mx-auto w-full max-w-[var(--width-content)] px-6 py-24 text-center">
      <Separator ornament />
      <h1 className="font-display text-[length:var(--text-display-lg)] text-text-primary mt-10">
        {dictionary["subscribe.pageHeading"]}
      </h1>
      <p className="text-[length:var(--text-body-md)] text-text-secondary mt-4 max-w-[32rem] mx-auto leading-[var(--leading-body)]">
        {dictionary["subscribe.pageDescription"]}
      </p>

      <SubscribeConfirmation
        confirmed={query.confirmed === "true"}
        error={query.error === "invalid_token"}
        dictionary={dictionary}
      />

      <div className="mt-10">
        <SubscribeForm variant="full" className="bg-transparent py-0" />
      </div>
    </div>
  );
}
