"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function ArticleSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const updateSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
        params.delete("page");
      } else {
        params.delete("q");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-quaternary" />
      <input
        type="search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          const timeout = setTimeout(() => updateSearch(e.target.value), 300);
          return () => clearTimeout(timeout);
        }}
        placeholder="Search articles..."
        className="w-full rounded-[var(--radius-md)] border border-border bg-surface pl-9 pr-8 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:outline-none focus:ring-2 focus:ring-accent-warm/50 focus:border-accent-warm"
      />
      {value && (
        <button
          onClick={() => {
            setValue("");
            updateSearch("");
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-text-quaternary hover:text-text-primary transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
