import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, EyeOff, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [totalResult, publishedResult, draftResult, recentResult] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("published", false),
    supabase.from("posts").select("*").order("updated_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Total Posts", count: totalResult.count ?? 0, icon: FileText },
    { label: "Published", count: publishedResult.count ?? 0, icon: Eye },
    { label: "Drafts", count: draftResult.count ?? 0, icon: EyeOff },
  ];

  const recentPosts = recentResult.data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/admin/posts/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, count, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background">
              <Icon className="h-5 w-5 text-muted" />
            </div>
            <div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Recent Posts</h2>
        {recentPosts.length === 0 ? (
          <Card>
            <p className="text-sm text-muted text-center py-4">
              No posts yet. Create your first one!
            </p>
          </Card>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}/edit`}
                className="flex items-center justify-between px-4 py-3 hover:bg-surface/50 transition-colors border-b border-border last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      post.published ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                  <span className="text-sm font-medium">{post.title}</span>
                </div>
                <span className="text-xs text-muted">
                  {format(parseISO(post.updated_at), "MMM d, yyyy")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
