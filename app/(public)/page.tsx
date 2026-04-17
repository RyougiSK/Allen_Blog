import { createClient } from "@/utils/supabase/server";
import { PostCard } from "@/components/features/post-card";
import { Pagination } from "@/components/features/pagination";
import type { PostWithTags, Tag } from "@/lib/types";

const PAGE_SIZE = 10;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();

  const { data: rawPosts, count } = await supabase
    .from("posts")
    .select("*, post_tags(tag_id, tags(*))", { count: "exact" })
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const posts: PostWithTags[] = (rawPosts ?? []).map((p) => ({
    ...p,
    tags: (p.post_tags ?? []).map(
      (pt: { tag_id: string; tags: Tag }) => pt.tags
    ),
    post_tags: undefined,
  }));

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Latest Posts</h2>
        <p className="text-muted text-base">
          {posts.length === 0
            ? "No posts published yet. Check back soon."
            : `${count} post${count === 1 ? "" : "s"} published`}
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <p className="text-muted">Nothing here yet. Start writing!</p>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath="/" />
    </div>
  );
}
