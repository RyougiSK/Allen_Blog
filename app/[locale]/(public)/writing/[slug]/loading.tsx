import { WritingSkeleton } from "@/components/features/writing-skeleton";

export default function ColumnLoading() {
  return (
    <div className="mx-auto w-full max-w-[var(--width-page)] px-6 py-16">
      <header className="mb-12">
        <div className="h-10 w-48 rounded bg-surface animate-pulse" />
        <div className="h-4 w-72 rounded bg-surface animate-pulse mt-3" />
      </header>
      <WritingSkeleton count={5} />
    </div>
  );
}
