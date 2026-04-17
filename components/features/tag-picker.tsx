"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createTag } from "@/lib/actions/tags";
import type { Tag } from "@/lib/types";

interface TagPickerProps {
  allTags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TagPicker({ allTags, selectedIds, onChange }: TagPickerProps) {
  const [tags, setTags] = useState<Tag[]>(allTags);
  const [newTagName, setNewTagName] = useState("");
  const [adding, setAdding] = useState(false);

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((t) => t !== id)
        : [...selectedIds, id]
    );
  }

  async function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setAdding(true);
    const formData = new FormData();
    formData.set("name", newTagName.trim());
    const result = await createTag(formData);

    if (result.success && result.tag) {
      setTags((prev) => [...prev, result.tag!]);
      onChange([...selectedIds, result.tag.id]);
      setNewTagName("");
    }
    setAdding(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => {
          const selected = selectedIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className="transition-colors"
            >
              <Badge variant={selected ? "success" : "default"}>
                {tag.name}
                {selected && <X className="h-3 w-3 ml-1" />}
              </Badge>
            </button>
          );
        })}
      </div>
      <form onSubmit={handleAddTag} className="flex items-center gap-2">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag..."
          className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 w-32"
        />
        <button
          type="submit"
          disabled={adding || !newTagName.trim()}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted hover:text-foreground transition-colors disabled:opacity-50"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </form>
    </div>
  );
}
