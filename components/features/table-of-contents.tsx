"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/locale-context";
import type { TocItem } from "@/lib/utils/toc";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");
  const { t } = useLocale();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className="mt-10 rounded-[var(--radius-md)] border border-border bg-bg-secondary p-5">
      <p className="text-[length:var(--text-micro)] font-medium uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-3">
        {t("toc.title")}
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}
          >
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`block text-[length:var(--text-caption)] leading-relaxed transition-colors duration-[var(--duration-fast)] ${
                activeId === item.id
                  ? "text-accent-warm"
                  : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
        <li className="pt-2 border-t border-border mt-2">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-[length:var(--text-caption)] text-text-quaternary hover:text-text-primary transition-colors duration-[var(--duration-fast)]"
          >
            &uarr; {t("scrollToTop.label")}
          </button>
        </li>
      </ul>
    </nav>
  );
}
