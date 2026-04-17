"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push("/admin");
    });
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="font-display text-lg text-text-primary">{SITE.name}</p>
        <h1 className="font-display text-[length:var(--text-display-sm)] text-text-primary mt-6">
          Set new password
        </h1>
        <p className="text-[length:var(--text-body-sm)] text-text-secondary mt-2">
          Choose a new password for your account.
        </p>
      </div>

      {error && (
        <p className="text-[length:var(--text-body-sm)] text-danger text-center">
          {error}
        </p>
      )}

      <form action={handleSubmit} className="space-y-4">
        <Input
          type="password"
          name="password"
          placeholder="New password"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <Input
          type="password"
          name="confirm"
          placeholder="Confirm password"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
