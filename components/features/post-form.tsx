"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, PenLine, Columns2, Save, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/components/features/markdown-editor";
import { MarkdownPreview } from "@/components/features/markdown-preview";
import { TagPicker } from "@/components/features/tag-picker";
import { createPost, updatePost } from "@/lib/actions/posts";
import { slugify } from "@/lib/utils";
import type { PostWithTags, Tag } from "@/lib/types";

type ViewMode = "edit" | "split" | "preview";

interface PostFormProps {
  post?: PostWithTags;
  tags: Tag[];
}

export function PostForm({ post, tags }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    post?.tags.map((t) => t.id) ?? []
  );
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [saving, setSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  async function handleSubmit(published: boolean) {
    setSaving(true);
    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("content", content);
    formData.set("excerpt", excerpt);
    formData.set("published", String(published));
    selectedTagIds.forEach((id) => formData.append("tag_ids", id));

    try {
      if (post) {
        await updatePost(post.id, formData);
      } else {
        await createPost(formData);
      }
    } catch {
      // redirect() throws — this is expected
    }
    setSaving(false);
  }

  const viewModeButtons: { mode: ViewMode; icon: React.ElementType; label: string }[] = [
    { mode: "edit", icon: PenLine, label: "Edit" },
    { mode: "split", icon: Columns2, label: "Split" },
    { mode: "preview", icon: Eye, label: "Preview" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold tracking-tight">
          {post ? "Edit Post" : "New Post"}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit(false)}
            disabled={saving || !title.trim()}
          >
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={() => handleSubmit(true)}
            disabled={saving || !title.trim() || !content.trim()}
          >
            <Send className="h-3.5 w-3.5" />
            Publish
          </Button>
        </div>
      </div>

      {/* Meta fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="text-lg font-semibold"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Slug</label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              placeholder="post-slug"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Excerpt</label>
            <Input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description (optional)"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Tags</label>
          <TagPicker
            allTags={tags}
            selectedIds={selectedTagIds}
            onChange={setSelectedTagIds}
          />
        </div>
      </div>

      {/* View mode toggle */}
      <div className="flex items-center gap-1 mb-3">
        {viewModeButtons.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === mode
                ? "bg-surface text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Editor / Preview */}
      <div
        className={
          viewMode === "split"
            ? "grid grid-cols-2 gap-4"
            : ""
        }
      >
        {(viewMode === "edit" || viewMode === "split") && (
          <MarkdownEditor value={content} onChange={setContent} />
        )}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className="rounded-md border border-border overflow-auto min-h-[500px]">
            <MarkdownPreview content={content} />
          </div>
        )}
      </div>
    </div>
  );
}
