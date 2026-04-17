import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PostWithTags } from "@/lib/types";

export function PostCard({ post }: { post: PostWithTags }) {
  const excerpt =
    post.excerpt || post.content.slice(0, 160).replace(/[#*`>\-\[\]]/g, "").trim() + "...";

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-muted/50">
        <div className="flex items-center gap-2 text-xs text-muted mb-3">
          <Calendar className="h-3 w-3" />
          <time dateTime={post.created_at}>
            {format(parseISO(post.created_at), "MMMM d, yyyy")}
          </time>
        </div>
        <h3 className="text-lg font-semibold tracking-tight mb-2 group-hover:text-accent transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-muted leading-relaxed mb-3">{excerpt}</p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag.id}>{tag.name}</Badge>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
