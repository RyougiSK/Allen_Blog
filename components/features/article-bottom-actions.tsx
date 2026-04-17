"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { ShareButtons } from "@/components/features/share-buttons";
import { SubscribeForm } from "@/components/features/subscribe-form";
import { useLocale } from "@/lib/i18n/locale-context";

interface ArticleBottomActionsProps {
  title: string;
  description?: string;
  url: string;
}

export function ArticleBottomActions({ title, description, url }: ArticleBottomActionsProps) {
  const pathname = usePathname();
  const routeLocale = pathname.split("/")[1] === "zh" ? "zh" : "en";
  const { t } = useLocale();

  return (
    <section className="mt-12">
      <Separator ornament />
      <div className="mt-12">
        <ShareButtons url={url} title={title} description={description} />
      </div>
      <Separator className="my-10" />
      <SubscribeForm variant="compact" />
      <Separator className="my-10" />
      <div className="flex items-baseline gap-2">
        <p className="text-[length:var(--text-body-sm)] text-text-secondary">
          {t("articleBottom.supportPrompt")}
        </p>
        <Link
          href={`/${routeLocale}/support`}
          className="text-[length:var(--text-body-sm)] text-accent-warm transition-colors duration-[var(--duration-fast)] hover:text-text-primary"
        >
          {t("articleBottom.supportLink")} &rarr;
        </Link>
      </div>
    </section>
  );
}
