import { WritingSkeleton } from "@/components/features/writing-skeleton";

export default function WritingLoading() {
  return (
    <div className="mx-auto w-full max-w-[var(--width-page)] px-6 py-16">
      <header className="mb-12">
        <div className="h-10 w-48 rounded bg-surface animate-pulse" />
        <div className="h-4 w-80 rounded bg-surface animate-pulse mt-3" />
      </header>
      <div className="flex flex-wrap gap-2 mb-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 rounded-full bg-surface animate-pulse"
          />
        ))}
      </div>
      <WritingSkeleton count={5} />
    </div>
  );
}
