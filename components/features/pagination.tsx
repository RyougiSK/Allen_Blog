import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/types";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  dictionary?: Dictionary;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  dictionary,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const separator = basePath.includes("?") ? "&" : "?";
  const prev = dictionary?.["pagination.previous"] ?? "Previous";
  const next = dictionary?.["pagination.next"] ?? "Next";

  return (
    <div className="flex items-center justify-center gap-4 pt-8">
      {currentPage > 1 ? (
        <Link
          href={`${basePath}${separator}page=${currentPage - 1}`}
          className="flex items-center gap-1 text-[length:var(--text-caption)] text-text-tertiary hover:text-text-primary transition-colors duration-[var(--duration-fast)]"
        >
          <ChevronLeft className="h-4 w-4" />
          {prev}
        </Link>
      ) : (
        <span className="flex items-center gap-1 text-[length:var(--text-caption)] text-text-quaternary">
          <ChevronLeft className="h-4 w-4" />
          {prev}
        </span>
      )}
      <span className="text-[length:var(--text-caption)] text-text-tertiary">
        {currentPage} / {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link
          href={`${basePath}${separator}page=${currentPage + 1}`}
          className="flex items-center gap-1 text-[length:var(--text-caption)] text-text-tertiary hover:text-text-primary transition-colors duration-[var(--duration-fast)]"
        >
          {next}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 text-[length:var(--text-caption)] text-text-quaternary">
          {next}
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}
