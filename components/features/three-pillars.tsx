import type { Dictionary } from "@/lib/i18n/types";

interface ThreePillarsProps {
  dictionary: Dictionary;
}

const pillars = [
  { key: "self", accentClass: "border-l-accent-self" },
  { key: "nature", accentClass: "border-l-accent-nature-light" },
  { key: "living", accentClass: "border-l-accent-living" },
] as const;

export function ThreePillars({ dictionary }: ThreePillarsProps) {
  return (
    <section className="mx-auto w-full max-w-[var(--width-page)] px-6">
      <p className="text-[length:var(--text-caption)] text-text-quaternary text-center mb-16 tracking-[var(--tracking-wide)]">
        {dictionary["home.pillarsTitle"]}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
        {pillars.map(({ key, accentClass }) => (
          <div
            key={key}
            className={`border-l-2 ${accentClass} pl-6 py-2`}
          >
            <p className="font-display text-[length:var(--text-body-lg)] text-text-primary leading-[var(--leading-tight)] italic">
              {dictionary[`pillar.${key}.question`]}
            </p>
            <p className="mt-4 text-[length:var(--text-body-sm)] text-text-tertiary leading-[var(--leading-body)]">
              {dictionary[`pillar.${key}.subtext`]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
