"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface PageSizeSelectProps {
  value: number;
  options: readonly number[];
}

export function PageSizeSelect({ value, options }: PageSizeSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(newSize: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("size", newSize);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 text-[length:var(--text-caption)] text-text-tertiary">
      <span>Show</span>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-1 text-[length:var(--text-caption)] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-warm/50"
      >
        {options.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <span>per page</span>
    </div>
  );
}
