"use client";

import { useEffect, useState } from "react";
import { FolderOpen } from "lucide-react";
import { fetchCategories } from "@/lib/actions/categories";
import type { Category } from "@/lib/types";

interface CategoryPickerProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[var(--tracking-widest)] text-text-tertiary">
        <FolderOpen className="h-3.5 w-3.5" />
        Category
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-warm/50 focus:border-accent-warm"
      >
        <option value="">None</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}{cat.name_zh ? ` — ${cat.name_zh}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
