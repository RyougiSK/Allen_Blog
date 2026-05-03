import { Navbar } from "@/components/features/navbar";
import { Footer } from "@/components/features/footer";
import { SubscribeStrip } from "@/components/features/subscribe-strip";
import { ScrollToTop } from "@/components/features/scroll-to-top";
import { ImageLightbox } from "@/components/features/image-lightbox";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { fetchNavWritingTypes } from "@/lib/actions/writing-types";
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
  const [dictionary, writingTypes] = await Promise.all([
    getDictionary(dictLocale),
    fetchNavWritingTypes(),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Navbar writingTypes={writingTypes} />
      <main className="flex-1">{children}</main>
      <SubscribeStrip />
      <Footer dictionary={dictionary} />
      <ScrollToTop />
      <ImageLightbox />
    </div>
  );
}
