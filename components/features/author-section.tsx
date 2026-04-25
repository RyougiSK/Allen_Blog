import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/types";

interface AuthorSectionProps {
  dictionary: Dictionary;
  locale: string;
}

export function AuthorSection({ dictionary, locale }: AuthorSectionProps) {
  return (
    <section className="pb-[var(--spacing-section)]">
      <div className="mx-auto w-full max-w-[var(--width-content)] px-6">
        <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-8">
          {dictionary["home.authorLabel"]}
        </p>
        <p className="text-[length:var(--text-body-lg)] text-text-secondary leading-[var(--leading-body)]">
          {dictionary["home.authorIntro"]}
        </p>
        <blockquote className="mt-8 pl-5 border-l-2 border-accent-warm/40 text-[length:var(--text-body)] text-text-tertiary italic leading-[var(--leading-body)]">
          {dictionary["about.quote"]}
        </blockquote>
        <Link
          href={`/${locale}/about`}
          className="inline-block mt-8 text-[length:var(--text-caption)] text-text-tertiary transition-colors duration-[var(--duration-fast)] hover:text-accent-warm whitespace-nowrap"
        >
          {dictionary["home.moreAbout"]} &rarr;
        </Link>
      </div>
    </section>
  );
}
