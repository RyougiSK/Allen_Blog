import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { SetHtmlLang } from "@/components/features/set-html-lang";
import type { Locale } from "@/lib/i18n/types";

const VALID_LOCALES: Record<string, Locale> = {
  en: "en",
  zh: "zh-cn",
};

const HTML_LANG: Record<string, string> = {
  en: "en",
  zh: "zh",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictLocale = VALID_LOCALES[locale];
  if (!dictLocale) notFound();

  const dictionary = await getDictionary(dictLocale);

  return (
    <LocaleProvider locale={dictLocale} dictionary={dictionary}>
      <SetHtmlLang lang={HTML_LANG[locale] ?? "en"} />
      {children}
    </LocaleProvider>
  );
}
