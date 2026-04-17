import Link from "next/link";
import { SITE } from "@/lib/constants";
import { FooterSubscribe } from "@/components/features/footer-subscribe";
import type { Dictionary } from "@/lib/i18n/types";

interface FooterProps {
  dictionary: Dictionary;
}

export function Footer({ dictionary }: FooterProps) {
  const locale = dictionary["nav.writing"] ? (dictionary["nav.about"] === "关于" ? "zh" : "en") : "en";

  const footerLinks = [
    { href: `/${locale}/writing`, label: dictionary["nav.writing"] },
    { href: `/${locale}/themes`, label: dictionary["nav.themes"] },
    { href: `/${locale}/about`, label: dictionary["nav.about"] },
    { href: `/${locale}/subscribe`, label: dictionary["subscribe.button"] },
  ];

  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-[var(--width-page)] px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/${locale}`}
            className="font-display text-text-tertiary transition-colors duration-[var(--duration-fast)] hover:text-text-primary"
          >
            {SITE.name}
          </Link>
          <nav className="flex items-center gap-6">
            {footerLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[length:var(--text-micro)] text-text-quaternary transition-colors duration-[var(--duration-fast)] hover:text-text-tertiary"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-border">
          <FooterSubscribe />
        </div>
        <div className="mt-8 flex items-center justify-between text-[length:var(--text-micro)] text-text-quaternary">
          <span>&copy; {new Date().getFullYear()} {SITE.name}</span>
          <span>{dictionary["footer.builtWith"]}</span>
        </div>
      </div>
    </footer>
  );
}
