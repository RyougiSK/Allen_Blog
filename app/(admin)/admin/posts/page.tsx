import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { PostTable } from "@/components/features/post-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { PostWithTags, Tag } from "@/lib/types";

export default async function AdminPostsPage() {
  const supabase = await createClient();

  const { data: rawPosts } = await supabase
    .from("posts")
    .select("*, post_tags(tag_id, tags(*))")
    .order("updated_at", { ascending: false });

  const posts: PostWithTags[] = (rawPosts ?? []).map((p) => ({
    ...p,
    tags: (p.post_tags ?? []).map(
      (pt: { tag_id: string; tags: Tag }) => pt.tags
    ),
    post_tags: undefined,
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
        <Link href="/admin/posts/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <p className="text-muted mb-4">No posts yet.</p>
          <Link href="/admin/posts/new">
            <Button>Create your first post</Button>
          </Link>
        </div>
      ) : (
        <PostTable posts={posts} />
      )}
    </div>
  );
}
