"use client";

import { Separator } from "@/components/ui/separator";
import { ShareButtons } from "@/components/features/share-buttons";
import { SubscribeForm } from "@/components/features/subscribe-form";

interface ArticleBottomActionsProps {
  title: string;
  description?: string;
  url: string;
}

export function ArticleBottomActions({ title, description, url }: ArticleBottomActionsProps) {
  return (
    <section className="mt-12">
      <Separator ornament />
      <div className="mt-12">
        <ShareButtons url={url} title={title} description={description} />
      </div>
      <Separator className="my-10" />
      <SubscribeForm variant="compact" />
    </section>
  );
}
