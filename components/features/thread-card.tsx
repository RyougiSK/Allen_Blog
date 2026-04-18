"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getLocalizedName } from "@/lib/utils/localized-name";
import type { ThreadWithTags, ContentLocale } from "@/lib/types";

interface ThreadCardProps {
  thread: ThreadWithTags;
  locale: ContentLocale;
}

export function ThreadCard({ thread, locale }: ThreadCardProps) {
  const urlLocale = locale === "en" ? "en" : "zh";
  const content = locale === "zh" && thread.content_zh.trim()
    ? thread.content_zh
    : thread.content_en;

  const d = new Date(thread.created_at);
  const time = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;

  return (
    <div className="border-l-2 border-l-accent-warm/30 pl-5 py-4">
      <div className="prose-editorial prose prose-invert prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>

      <div className="flex items-center gap-3 mt-3">
        {thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {thread.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/${urlLocale}/themes?tag=${tag.slug}`}
                className="rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-0.5 text-[length:var(--text-micro)] text-text-tertiary transition-colors hover:text-text-primary hover:border-border-emphasis"
              >
                {getLocalizedName(tag, locale)}
              </Link>
            ))}
          </div>
        )}
        <span className="text-[length:var(--text-micro)] text-text-quaternary ml-auto shrink-0">
          {time}
        </span>
      </div>
    </div>
  );
}
