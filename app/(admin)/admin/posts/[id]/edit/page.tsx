import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PostForm } from "@/components/features/post-form";
import type { PostWithTags, Tag } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [postResult, tagsResult] = await Promise.all([
    supabase
      .from("posts")
      .select("*, post_tags(tag_id, tags(*))")
      .eq("id", id)
      .single(),
    supabase.from("tags").select("*").order("name"),
  ]);

  if (!postResult.data) notFound();

  const rawPost = postResult.data;
  const post: PostWithTags = {
    ...rawPost,
    tags: (rawPost.post_tags ?? []).map(
      (pt: { tag_id: string; tags: Tag }) => pt.tags
    ),
  };

  const tags: Tag[] = tagsResult.data ?? [];

  return <PostForm post={post} tags={tags} />;
}
