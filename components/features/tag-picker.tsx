"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X, ChevronDown, Search } from "lucide-react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [adding, setAdding] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTags = tags.filter((t) => selectedIds.includes(t.id));
  const availableTags = tags.filter(
    (t) =>
      !selectedIds.includes(t.id) &&
      (t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.name_zh && t.name_zh.includes(search))),
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function remove(id: string) {
    onChange(selectedIds.filter((t) => t !== id));
  }

  function add(id: string) {
    onChange([...selectedIds, id]);
    setSearch("");
  }

  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setAdding(true);
    const formData = new FormData();
    formData.set("name", newTagName.trim());
    const result = await createTag(formData);

    if (result.success && result.tag) {
      setTags((prev) => [...prev, result.tag!].sort((a, b) => a.name.localeCompare(b.name)));
      onChange([...selectedIds, result.tag.id]);
      setNewTagName("");
    }
    setAdding(false);
  }

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => remove(tag.id)}
              className="transition-colors"
            >
              <Badge variant="success">
                {tag.name}{tag.name_zh ? ` — ${tag.name_zh}` : ""}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* Dropdown to pick existing tags */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
            setSearch("");
          }}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:border-border-emphasis transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add tag
          <ChevronDown className="h-3 w-3" />
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-[var(--radius-md)] border border-border bg-bg-primary shadow-[var(--shadow-lg)]">
            {/* Search */}
            <div className="relative border-b border-border px-2 py-1.5">
              <Search className="absolute left-3.5 top-1/2 h-3 w-3 -translate-y-1/2 text-text-quaternary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tags..."
                className="w-full bg-transparent pl-5 pr-2 py-0.5 text-xs text-text-primary placeholder:text-text-quaternary focus:outline-none"
                autoFocus
              />
            </div>

            {/* Available tags list */}
            <div className="max-h-40 overflow-y-auto py-1">
              {availableTags.length > 0 ? (
                availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      add(tag.id);
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-1.5 text-xs text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
                  >
                    {tag.name}{tag.name_zh ? ` — ${tag.name_zh}` : ""}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-text-quaternary">
                  {search ? "No matching tags" : "All tags selected"}
                </p>
              )}
            </div>

            {/* Create new tag inline */}
            <form
              onSubmit={(e) => {
                handleCreateTag(e);
                setDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 border-t border-border px-2 py-1.5"
            >
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Create new..."
                className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-quaternary focus:outline-none"
              />
              <button
                type="submit"
                disabled={adding || !newTagName.trim()}
                className="rounded px-1.5 py-0.5 text-xs text-accent-warm hover:bg-accent-warm/10 transition-colors disabled:opacity-50"
              >
                Create
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
