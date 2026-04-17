import Image from "next/image";
import { format, parseISO } from "date-fns";
import { TagLink } from "@/components/ui/tag-link";
import { Separator } from "@/components/ui/separator";
import { SITE } from "@/lib/constants";
import type { Tag, ContentLocale } from "@/lib/types";

interface ArticleHeaderProps {
  title: string;
  subtitle?: string;
  excerpt?: string;
  date: string;
  tags: Tag[];
  readingTime?: number;
  locale?: ContentLocale;
  coverImage?: string | null;
}

export function ArticleHeader({
  title,
  subtitle,
  excerpt,
  date,
  tags,
  readingTime,
  locale = "en",
  coverImage,
}: ArticleHeaderProps) {
  const authorName = locale === "zh" ? SITE.author.nameZh : SITE.author.name;

  return (
    <header className="mb-12">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[length:var(--text-micro)] text-text-tertiary">
          {authorName}
        </span>
        <span className="text-text-quaternary">&middot;</span>
        <time
          dateTime={date}
          className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary"
        >
          {format(parseISO(date), "MMMM d, yyyy")}
        </time>
        {readingTime && (
          <>
            <span className="text-text-quaternary">&middot;</span>
            <span className="text-[length:var(--text-micro)] text-text-quaternary">
              {readingTime} min read
            </span>
          </>
        )}
      </div>
      <h1 className="font-display text-[length:var(--text-display-lg)] leading-[var(--leading-display)] text-text-primary mt-4">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[length:var(--text-display-sm)] text-text-secondary mt-2 leading-[var(--leading-tight)]">
          {subtitle}
        </p>
      )}
      {excerpt && (
        <p className="text-[length:var(--text-body-lg)] text-text-secondary mt-4 leading-[var(--leading-body)]">
          {excerpt}
        </p>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {tags.map((tag) => (
            <TagLink key={tag.id} tag={tag} locale={locale} />
          ))}
        </div>
      )}
      {coverImage && (
        <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-[var(--radius-lg)]">
          <Image
            src={coverImage}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 42rem"
          />
        </div>
      )}
      <Separator ornament className="mt-8" />
    </header>
  );
}
