"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { MediaUpload } from "@/components/features/media-upload";
import { MediaGrid } from "@/components/features/media-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchMedia } from "@/lib/actions/media";
import type { MediaItem } from "@/lib/types";

interface Props {
  initialItems: MediaItem[];
  initialTotal: number;
}

export function MediaLibraryClient({ initialItems, initialTotal }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 24;

  async function reload(searchQuery?: string, pageNum = 1) {
    const result = await fetchMedia({
      limit: PAGE_SIZE,
      offset: (pageNum - 1) * PAGE_SIZE,
      search: searchQuery || undefined,
    });
    setItems(result.items);
    setTotal(result.total);
    setPage(pageNum);
  }

  return (
    <div className="w-full max-w-6xl px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-text-primary">
            Media Library
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            {total} {total === 1 ? "file" : "files"}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowUpload(!showUpload)}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Upload
        </Button>
      </div>

      {showUpload && (
        <div className="mb-6">
          <MediaUpload
            onUpload={(media) => {
              setItems((prev) => [media, ...prev]);
              setTotal((prev) => prev + 1);
            }}
          />
        </div>
      )}

      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search by filename or alt text..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            const timeout = setTimeout(() => reload(e.target.value), 300);
            return () => clearTimeout(timeout);
          }}
        />
      </div>

      <MediaGrid
        items={items}
        onDelete={() => {
          reload(search || undefined, page);
          router.refresh();
        }}
      />

      {total > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => reload(search || undefined, page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-text-tertiary">
            Page {page} of {Math.ceil(total / PAGE_SIZE)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(total / PAGE_SIZE)}
            onClick={() => reload(search || undefined, page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
