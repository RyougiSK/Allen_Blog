import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { PostContent } from "@/components/features/post-content";
import { Badge } from "@/components/ui/badge";
import type { Tag } from "@/lib/types";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: rawPost } = await supabase
    .from("posts")
    .select("*, post_tags(tag_id, tags(*))")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!rawPost) notFound();

  const post = {
    ...rawPost,
    tags: (rawPost.post_tags ?? []).map(
      (pt: { tag_id: string; tags: Tag }) => pt.tags
    ),
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to posts
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted mb-3">
            <Calendar className="h-3.5 w-3.5" />
            <time dateTime={post.created_at}>
              {format(parseISO(post.created_at), "MMMM d, yyyy")}
            </time>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            {post.title}
          </h1>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag: Tag) => (
                <Badge key={tag.id}>{tag.name}</Badge>
              ))}
            </div>
          )}
        </header>

        <PostContent content={post.content} />
      </article>
    </div>
  );
}
