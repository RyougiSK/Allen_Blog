"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deletePost, togglePublish } from "@/lib/actions/posts";
import type { PostWithTags } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PostTable({ posts }: { posts: PostWithTags[] }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="text-left text-xs font-medium text-muted px-4 py-3">Title</th>
            <th className="text-left text-xs font-medium text-muted px-4 py-3">Status</th>
            <th className="text-left text-xs font-medium text-muted px-4 py-3">Tags</th>
            <th className="text-left text-xs font-medium text-muted px-4 py-3">Date</th>
            <th className="text-right text-xs font-medium text-muted px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PostRow({ post }: { post: PostWithTags }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleTogglePublish() {
    setLoading(true);
    await togglePublish(post.id, !post.published);
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setLoading(true);
    await deletePost(post.id);
    router.refresh();
    setLoading(false);
  }

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-surface/30 transition-colors">
      <td className="px-4 py-3">
        <Link
          href={`/admin/posts/${post.id}/edit`}
          className="text-sm font-medium hover:text-accent transition-colors"
        >
          {post.title}
        </Link>
      </td>
      <td className="px-4 py-3">
        <Badge variant={post.published ? "success" : "warning"}>
          {post.published ? "Published" : "Draft"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <Badge key={tag.id}>{tag.name}</Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
        {format(parseISO(post.updated_at), "MMM d, yyyy")}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTogglePublish}
            disabled={loading}
            title={post.published ? "Unpublish" : "Publish"}
          >
            {post.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>
          <Link href={`/admin/posts/${post.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
