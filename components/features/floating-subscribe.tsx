"use client";

import { useState, useEffect, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";
import { subscribeEmail } from "@/lib/actions/subscribers";

const DISMISSED_KEY = "floating-subscribe-dismissed";

export function FloatingSubscribe() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { t, locale } = useLocale();
  const pathname = usePathname();

  const isSubscribePage = pathname.includes("/subscribe");

  useEffect(() => {
    if (isSubscribePage) return;

    const wasDismissed = sessionStorage.getItem(DISMISSED_KEY) === "true";
    if (wasDismissed) return;

    setDismissed(false);

    function handleScroll() {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setVisible(scrollPercent > 0.3);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSubscribePage]);

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, "true");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    const dbLocale = locale === "zh-cn" ? "zh" : "en";

    try {
      const result = await subscribeEmail(email.trim(), dbLocale as "en" | "zh");
      setStatus(result.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (dismissed || isSubscribePage || !visible) return null;

  return (
    <div className="fixed bottom-6 right-20 z-40 w-80 rounded-[var(--radius-lg)] border border-border bg-bg-secondary/90 shadow-[var(--shadow-lg)] backdrop-blur-md animate-[fade-in-up_var(--duration-normal)_var(--ease-out-expo)]">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          {status === "success" ? (
            <p className="text-[length:var(--text-caption)] text-accent-warm">
              {t("subscribe.checkEmail")}
            </p>
          ) : (
            <p className="text-[length:var(--text-caption)] text-text-tertiary">
              {t("floatingSubscribe.description")}
            </p>
          )}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-0.5 text-text-quaternary hover:text-text-tertiary transition-colors duration-[var(--duration-fast)]"
            aria-label={t("floatingSubscribe.dismiss")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {status !== "success" && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
      </div>
    </div>
  );
}
