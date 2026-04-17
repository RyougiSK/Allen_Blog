import { Separator } from "@/components/ui/separator";
import type { Dictionary } from "@/lib/i18n/types";

interface HeroSectionProps {
  dictionary: Dictionary;
}

export function HeroSection({ dictionary }: HeroSectionProps) {
  return (
    <section className="hero-ink-wash relative min-h-[60vh] flex items-center">
      <div className="hero-ink-wash-inner" />
      <div className="relative z-10 mx-auto w-full max-w-[var(--width-page)] px-6 py-24">
        <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary">
          {dictionary["hero.tagline"]}
        </p>
        <h1 className="font-display text-[length:var(--text-display-xl)] leading-[var(--leading-display)] text-text-primary mt-6 max-w-[18ch]">
          {dictionary["hero.title"]}
        </h1>
        <p className="text-[length:var(--text-body-lg)] text-text-secondary mt-6 max-w-[32rem] leading-[var(--leading-body)]">
          {dictionary["hero.subtitle"]}
        </p>
        <Separator ornament className="mt-16" />
      </div>
    </section>
  );
}
