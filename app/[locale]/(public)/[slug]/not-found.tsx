import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function ArticleNotFound() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const urlLocale = locale === "zh-cn" ? "zh" : "en";

  return (
    <div className="mx-auto w-full max-w-[var(--width-content)] px-6 py-20 text-center">
      <h1 className="font-display text-[length:var(--text-display-md)] text-text-primary mb-3">
        {dictionary["notFound.title"]}
      </h1>
      <p className="text-text-secondary mb-8">
        {dictionary["notFound.description"]}
      </p>
      <Link
        href={`/${urlLocale}/writing`}
        className="inline-flex items-center gap-1.5 text-[length:var(--text-caption)] text-accent-warm hover:text-accent-warm/80 transition-colors duration-[var(--duration-fast)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {dictionary["notFound.backLink"]}
      </Link>
    </div>
  );
}
