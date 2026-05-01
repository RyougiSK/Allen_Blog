"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function ArticleError({ reset }: { reset: () => void }) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <div className="mx-auto w-full max-w-[var(--width-content)] px-6 py-24 text-center">
      <h1 className="font-display text-[length:var(--text-display-sm)] text-text-primary mb-4">
        Something went wrong
      </h1>
      <p className="text-text-secondary mb-8">
        This page could not be loaded. Please try again.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-accent-warm px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-warm/90"
        >
          Try again
        </button>
        <Link
          href={`/${locale}/writing`}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary hover:border-border-emphasis"
        >
          Back to writing
        </Link>
      </div>
    </div>
  );
}
