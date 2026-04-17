export function WritingSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-6 border-b border-border last:border-b-0">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-20 rounded bg-surface animate-pulse" />
                <div className="h-3 w-12 rounded bg-surface animate-pulse" />
              </div>
              <div className="h-5 w-3/4 rounded bg-surface animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-full rounded bg-surface animate-pulse" />
                <div className="h-3.5 w-2/3 rounded bg-surface animate-pulse" />
              </div>
            </div>
            <div className="h-12 w-12 rounded-[var(--radius-md)] bg-surface animate-pulse shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
