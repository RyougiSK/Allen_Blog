"use client";

import type { Dictionary } from "@/lib/i18n/types";

interface SubscribeConfirmationProps {
  confirmed: boolean;
  error: boolean;
  dictionary: Dictionary;
}

export function SubscribeConfirmation({ confirmed, error, dictionary }: SubscribeConfirmationProps) {
  if (confirmed) {
    return (
      <div className="mt-8 rounded-[var(--radius-lg)] border border-border bg-bg-secondary px-6 py-4 max-w-[28rem] mx-auto">
        <p className="text-[length:var(--text-body-sm)] text-accent-warm">
          {dictionary["subscribe.confirmed"]}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-[var(--radius-lg)] border border-border bg-bg-secondary px-6 py-4 max-w-[28rem] mx-auto">
        <p className="text-[length:var(--text-body-sm)] text-[var(--color-danger)]">
          {dictionary["subscribe.invalidToken"]}
        </p>
      </div>
    );
  }

  return null;
}
