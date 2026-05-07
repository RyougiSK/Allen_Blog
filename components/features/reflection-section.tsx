import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/types";

interface ReflectionSectionProps {
  dictionary: Dictionary;
  locale: string;
}

export function ReflectionSection({ dictionary, locale }: ReflectionSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[var(--width-content)] px-6 text-center py-8">
      <div className="ornament-dot" />
      <p className="font-display text-[length:var(--text-body-lg)] text-text-secondary italic leading-[var(--leading-body)] max-w-[28rem] mx-auto">
        {dictionary["home.reflectionQuote"]}
      </p>
      <div className="mt-12">
        <Link
          href={`/${locale}/subscribe`}
          className="text-[length:var(--text-body-sm)] text-text-tertiary hover:text-text-secondary transition-colors duration-[var(--duration-normal)] border-b border-border hover:border-text-tertiary"
        >
          {dictionary["subscribe.title"]}
        </Link>
      </div>
    </section>
  );
}
