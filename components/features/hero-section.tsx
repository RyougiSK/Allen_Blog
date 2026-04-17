import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollIndicator } from "@/components/features/scroll-indicator";
import { SITE } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/types";

interface HeroSectionProps {
  dictionary: Dictionary;
  locale: string;
}

export function HeroSection({ dictionary, locale }: HeroSectionProps) {
  return (
    <section className="hero-cinematic relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Layer 0: Background video (hidden on mobile for bandwidth) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={SITE.hero.poster}
        className="hero-video absolute inset-0 h-full w-full object-cover hidden sm:block"
      >
        <source src={SITE.hero.video} type="video/mp4" />
      </video>

      {/* Layer 1: Ink-wash fallback (always present, visible before/without video) */}
      <div className="hero-ink-wash-bg absolute inset-0" />

      {/* Layer 2: Dark overlay for text readability */}
      <div className="hero-overlay absolute inset-0" />

      {/* Layer 3: Content */}
      <div className="relative z-10 mx-auto w-full max-w-[var(--width-page)] px-6 py-24 text-center">
        <p className="hero-entrance hero-stagger-1 text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-accent-warm">
          {dictionary["hero.tagline"]}
        </p>
        <h1 className="hero-entrance hero-stagger-2 font-display text-[length:var(--text-display-md)] sm:text-[length:var(--text-display-xl)] leading-[var(--leading-display)] text-text-primary mt-6 mx-auto max-w-[18ch]">
          {dictionary["hero.title"]}
        </h1>
        <p className="hero-entrance hero-stagger-3 text-[length:var(--text-body-lg)] text-text-secondary mt-6 mx-auto max-w-[32rem] leading-[var(--leading-body)]">
          {dictionary["hero.subtitle"]}
        </p>
        <div className="hero-entrance hero-stagger-4 mt-12">
          <Link
            href={`/${locale}/writing`}
            className="hero-cta-button inline-flex items-center gap-3 px-8 py-3.5 bg-accent-warm text-bg-primary font-medium text-[length:var(--text-body)] rounded-[var(--radius-md)] transition-all duration-[var(--duration-normal)]"
          >
            {dictionary["home.heroCta"]}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="hero-entrance hero-stagger-5 text-[length:var(--text-micro)] text-text-quaternary mt-5">
          {dictionary["home.heroMicro"]}
        </p>
      </div>

      {/* Layer 4: Scroll indicator */}
      <ScrollIndicator />
    </section>
  );
}
