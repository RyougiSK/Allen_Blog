import Link from "next/link";
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

      {/* Layer 1: Ink-wash atmospheric background */}
      <div className="hero-ink-wash-bg absolute inset-0" />

      {/* Layer 2: Dark overlay for text readability */}
      <div className="hero-overlay absolute inset-0" />

      {/* Layer 3: Content */}
      <div className="relative z-10 mx-auto w-full max-w-[var(--width-page)] px-6 py-32 text-center">
        <p className="hero-entrance hero-stagger-1 text-[length:var(--text-caption)] uppercase tracking-[var(--tracking-widest)] text-text-tertiary">
          {dictionary["hero.tagline"]}
        </p>
        <h1 className="hero-entrance hero-stagger-2 font-display text-[length:var(--text-display-lg)] sm:text-[length:var(--text-display-xl)] leading-[var(--leading-display)] text-text-primary mt-8">
          {locale === "en" ? dictionary["hero.title"] : dictionary["hero.title"]}
        </h1>
        {locale === "en" && (
          <p className="hero-entrance hero-stagger-2 font-display text-[length:var(--text-display-sm)] sm:text-[length:var(--text-display-md)] leading-[var(--leading-display)] text-text-secondary mt-3">
            {dictionary["hero.titleZh"]}
          </p>
        )}
        {locale !== "en" && (
          <p className="hero-entrance hero-stagger-2 font-display text-[length:var(--text-display-sm)] sm:text-[length:var(--text-display-md)] leading-[var(--leading-display)] text-text-secondary mt-3">
            The Quiet Way
          </p>
        )}
        <div className="hero-entrance hero-stagger-4 mt-14">
          <Link
            href={`/${locale}/writing`}
            className="hero-cta-button inline-flex items-center gap-3 px-8 py-3.5 border border-accent-warm/40 text-accent-warm font-medium text-[length:var(--text-body)] rounded-[var(--radius-lg)] transition-all duration-[var(--duration-normal)]"
          >
            {dictionary["home.heroCta"]}
          </Link>
        </div>
        <p className="hero-entrance hero-stagger-5 text-[length:var(--text-micro)] text-text-quaternary mt-6">
          {dictionary["home.heroMicro"]}
        </p>
      </div>

      {/* Layer 4: Scroll indicator */}
      <ScrollIndicator />
    </section>
  );
}
