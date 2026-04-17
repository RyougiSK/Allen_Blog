export default function PostLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 animate-pulse">
      <div className="h-4 w-24 bg-border/60 rounded mb-8" />
      <div className="h-4 w-32 bg-border/40 rounded mb-3" />
      <div className="h-8 w-3/4 bg-border/60 rounded mb-4" />
      <div className="flex gap-2 mb-8">
        <div className="h-5 w-16 bg-border/40 rounded-full" />
        <div className="h-5 w-20 bg-border/40 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-border/40 rounded w-full" />
        <div className="h-4 bg-border/40 rounded w-5/6" />
        <div className="h-4 bg-border/40 rounded w-4/5" />
        <div className="h-4 bg-border/40 rounded w-full" />
        <div className="h-4 bg-border/40 rounded w-3/4" />
      </div>
    </div>
  );
}
