"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/lib/i18n/locale-context";
import { subscribeEmail } from "@/lib/actions/subscribers";

interface SubscribeFormProps {
  variant?: "full" | "compact" | "inline";
  className?: string;
}

export function SubscribeForm({ variant = "full", className = "" }: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "subscribed" | "already_subscribed" | "error">("idle");
  const { t, locale } = useLocale();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    const dbLocale = locale === "zh-cn" ? "zh" : "en";

    try {
      const result = await subscribeEmail(email.trim(), dbLocale as "en" | "zh");
      if (result.success) {
        setStatus(result.message === "already_subscribed" ? "already_subscribed" : "subscribed");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const feedbackMessage = status === "subscribed"
    ? t("subscribe.subscribed")
    : status === "already_subscribed"
      ? t("subscribe.alreadySubscribed")
      : status === "error"
        ? t("subscribe.error")
        : null;

  const feedbackColor = status === "error"
    ? "text-[var(--color-danger)]"
    : "text-accent-warm";

  const isSubmitted = status === "subscribed" || status === "already_subscribed";

  if (variant === "inline") {
    return (
      <div className={className}>
        {isSubmitted ? (
          <p className={`text-[length:var(--text-micro)] ${feedbackColor}`}>
            {feedbackMessage}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-[length:var(--text-micro)] h-8"
            />
            <Button type="submit" size="sm" loading={status === "loading"} className="flex-shrink-0">
              {t("subscribe.button")}
            </Button>
          </form>
        )}
        {status === "error" && (
          <p className={`text-[length:var(--text-micro)] ${feedbackColor} mt-1`}>
            {feedbackMessage}
          </p>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={className}>
        <h3 className="font-display text-[length:var(--text-display-sm)] text-text-primary">
          {t("articleBottom.enjoyedThis")}
        </h3>
        <p className="text-[length:var(--text-body-sm)] text-text-secondary mt-2">
          {t("articleBottom.subscribeDescription")}
        </p>
        {isSubmitted ? (
          <p className={`text-[length:var(--text-body-sm)] ${feedbackColor} mt-4`}>
            {feedbackMessage}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 mt-4 max-w-[24rem]">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" loading={status === "loading"} className="flex-shrink-0">
              {t("subscribe.button")}
            </Button>
          </form>
        )}
        {status === "error" && !isSubmitted && (
          <p className={`text-[length:var(--text-micro)] ${feedbackColor} mt-2`}>
            {feedbackMessage}
          </p>
        )}
        <p className="text-[length:var(--text-micro)] text-text-quaternary mt-3">
          {t("subscribe.noSpam")}
        </p>
      </div>
    );
  }

  // variant === "full" (default)
  return (
    <section className={`bg-bg-secondary py-16 ${className}`}>
      <div className="mx-auto w-full max-w-[var(--width-content)] px-6 text-center">
        <Separator ornament />
        <h2 className="font-display text-[length:var(--text-display-md)] text-text-primary mt-8">
          {t("subscribe.title")}
        </h2>
        <p className="text-[length:var(--text-body-sm)] text-text-secondary mt-3 max-w-[28rem] mx-auto">
          {t("subscribe.description")}
        </p>
        {isSubmitted ? (
          <p className={`text-[length:var(--text-body-sm)] ${feedbackColor} mt-6`}>
            {feedbackMessage}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex gap-3 mt-6 max-w-[24rem] mx-auto"
          >
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" loading={status === "loading"} className="flex-shrink-0">
              {t("subscribe.button")}
            </Button>
          </form>
        )}
        {status === "error" && !isSubmitted && (
          <p className={`text-[length:var(--text-micro)] text-[var(--color-danger)] mt-3`}>
            {feedbackMessage}
          </p>
        )}
        <p className="text-[length:var(--text-micro)] text-text-quaternary mt-3">
          {t("subscribe.noSpam")}
        </p>
      </div>
    </section>
  );
}
