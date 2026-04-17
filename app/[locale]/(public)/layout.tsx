import { Navbar } from "@/components/features/navbar";
import { Footer } from "@/components/features/footer";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/types";

const LOCALE_MAP: Record<string, Locale> = { en: "en", zh: "zh-cn" };

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictLocale = LOCALE_MAP[locale] ?? "en";
  const dictionary = await getDictionary(dictLocale);

  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer dictionary={dictionary} />
    </div>
  );
}
