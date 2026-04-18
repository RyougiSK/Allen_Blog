"use client";

import { useEffect, useState } from "react";
import { Layers } from "lucide-react";
import { fetchWritingTypes } from "@/lib/actions/writing-types";
import type { WritingType } from "@/lib/types";

interface WritingTypePickerProps {
  value: string | null;
  onChange: (writingTypeId: string | null) => void;
}

export function WritingTypePicker({ value, onChange }: WritingTypePickerProps) {
  const [types, setTypes] = useState<WritingType[]>([]);

  useEffect(() => {
    fetchWritingTypes().then(setTypes);
  }, []);

  const defaultTypes = types.filter((t) => t.is_default);
  const columnTypes = types.filter((t) => !t.is_default);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[var(--tracking-widest)] text-text-tertiary">
        <Layers className="h-3.5 w-3.5" />
        Writing Type
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-warm/50 focus:border-accent-warm"
      >
        <option value="">None</option>
        {defaultTypes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}{t.name_zh ? ` — ${t.name_zh}` : ""}
          </option>
        ))}
        {columnTypes.length > 0 && (
          <optgroup label="Columns">
            {columnTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}{t.name_zh ? ` — ${t.name_zh}` : ""}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
}
