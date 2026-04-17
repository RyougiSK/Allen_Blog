"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { signInWithPassword, signInWithMagicLink, forgotPassword } from "./actions";

type View = "password" | "magic-link" | "forgot";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [view, setView] = useState<View>("password");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    formData.set("redirect", redirectTo);

    startTransition(async () => {
      let result: { error?: string; success?: string } | undefined;

      if (view === "password") {
        result = await signInWithPassword(formData);
      } else if (view === "magic-link") {
        result = await signInWithMagicLink(formData);
      } else {
        result = await forgotPassword(formData);
      }

      if (result?.error) setError(result.error);
      if (result?.success) setSuccess(result.success);
    });
  }

  function switchView(next: View) {
    setView(next);
    setError(null);
    setSuccess(null);
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Link
          href="/"
          className="font-display text-lg text-text-primary transition-colors duration-[var(--duration-fast)] hover:text-accent-warm"
        >
          {SITE.name}
        </Link>
        <h1 className="font-display text-[length:var(--text-display-sm)] text-text-primary mt-6">
          {view === "forgot" ? "Reset password" : "Sign in"}
        </h1>
        <p className="text-[length:var(--text-body-sm)] text-text-secondary mt-2">
          {view === "forgot"
            ? "Enter your email to receive a reset link."
            : view === "magic-link"
              ? "We'll send you a login link."
              : "Enter your credentials to continue."}
        </p>
      </div>

      {error && (
        <p className="text-[length:var(--text-body-sm)] text-danger text-center">
          {error}
        </p>
      )}

      {success && (
        <p className="text-[length:var(--text-body-sm)] text-success text-center">
          {success}
        </p>
      )}

      <form action={handleSubmit} className="space-y-4">
        <Input
          type="email"
          name="email"
          placeholder="Email"
          required
          autoComplete="email"
        />

        {view === "password" && (
          <Input
            type="password"
            name="password"
            placeholder="Password"
            required
            autoComplete="current-password"
          />
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending
            ? "..."
            : view === "forgot"
              ? "Send reset link"
              : view === "magic-link"
                ? "Send magic link"
                : "Sign in"}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-2 text-[length:var(--text-caption)]">
        {view === "password" && (
          <>
            <button
              type="button"
              onClick={() => switchView("magic-link")}
              className="text-text-tertiary transition-colors duration-[var(--duration-fast)] hover:text-accent-warm"
            >
              Use magic link instead
            </button>
            <button
              type="button"
              onClick={() => switchView("forgot")}
              className="text-text-tertiary transition-colors duration-[var(--duration-fast)] hover:text-accent-warm"
            >
              Forgot password?
            </button>
          </>
        )}
        {view === "magic-link" && (
          <button
            type="button"
            onClick={() => switchView("password")}
            className="text-text-tertiary transition-colors duration-[var(--duration-fast)] hover:text-accent-warm"
          >
            Use password instead
          </button>
        )}
        {view === "forgot" && (
          <button
            type="button"
            onClick={() => switchView("password")}
            className="text-text-tertiary transition-colors duration-[var(--duration-fast)] hover:text-accent-warm"
          >
            Back to sign in
          </button>
        )}
      </div>
    </div>
  );
}
