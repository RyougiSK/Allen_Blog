"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const segments = pathname.split("/");
  const currentLocale = segments[1] === "zh" ? "zh" : "en";

  useEffect(() => {
    const altSegments = pathname.split("/");
    altSegments[1] = currentLocale === "en" ? "zh" : "en";
    router.prefetch(altSegments.join("/") || "/");
  }, [pathname, currentLocale, router]);

  function switchLocale(next: "en" | "zh") {
    if (next === currentLocale) return;
    segments[1] = next;
    const newPath = segments.join("/") || "/";
    document.cookie = `locale=${next === "zh" ? "zh-cn" : "en"}; path=/; max-age=31536000; SameSite=Lax`;
    router.push(newPath);
  }

  return (
    <div className="flex items-center gap-1 text-[length:var(--text-micro)]">
      <button
        onClick={() => switchLocale("en")}
        className={`transition-colors duration-[var(--duration-fast)] ${
          currentLocale === "en"
            ? "text-accent-warm"
            : "text-text-tertiary hover:text-text-primary"
        }`}
      >
        EN
      </button>
      <span className="text-text-quaternary">/</span>
      <button
        onClick={() => switchLocale("zh")}
        className={`transition-colors duration-[var(--duration-fast)] ${
          currentLocale === "zh"
            ? "text-accent-warm"
            : "text-text-tertiary hover:text-text-primary"
        }`}
      >
        中文
      </button>
    </div>
  );
}
