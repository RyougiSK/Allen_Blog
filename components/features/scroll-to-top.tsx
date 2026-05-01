"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrollPercent =
        window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight);
      setVisible(scrollPercent > 0.4);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      data-focus-hide
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-secondary/80 text-text-tertiary backdrop-blur-md transition-all duration-[var(--duration-normal)] hover:bg-surface hover:text-text-primary hover:border-border-emphasis hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
