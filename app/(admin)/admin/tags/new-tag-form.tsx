"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/use-toast";
import { createTag } from "@/lib/actions/tags";

export function NewTagForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("name_zh", nameZh.trim());

    const result = await createTag(formData);

    if (result.success) {
      setName("");
      setNameZh("");
      addToast({ message: "Tag created", variant: "success" });
      router.refresh();
    } else {
      setError(result.error ?? "Failed to create tag");
      addToast({ message: result.error ?? "Failed to create tag", variant: "error" });
    }
    setLoading(false);
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface/50 p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-medium text-text-tertiary mb-1">
            Name (EN)
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. next.js"
          />
        </div>
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-medium text-text-tertiary mb-1">
            Name (中文)
          </label>
          <Input
            value={nameZh}
            onChange={(e) => setNameZh(e.target.value)}
            placeholder="e.g. 前端开发"
          />
        </div>
        <Button type="submit" size="md" loading={loading} disabled={!name.trim()}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </form>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
