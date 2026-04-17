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
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-bg-primary/80 backdrop-blur-md animate-[fade-in-up_var(--duration-normal)_var(--ease-out-expo)]">
      <div className="mx-auto flex w-full max-w-[var(--width-page)] items-center justify-between gap-4 px-6 py-3">
        {status === "success" ? (
          <p className="text-[length:var(--text-caption)] text-accent-warm">
            {t("subscribe.checkEmail")}
          </p>
        ) : (
          <>
            <p className="hidden sm:block text-[length:var(--text-caption)] text-text-tertiary flex-shrink-0">
              {t("floatingSubscribe.description")}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2 max-w-[24rem] ml-auto">
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
          </>
        )}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-text-quaternary hover:text-text-tertiary transition-colors duration-[var(--duration-fast)]"
          aria-label={t("floatingSubscribe.dismiss")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
