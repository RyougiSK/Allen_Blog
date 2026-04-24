import { fetchAllThreads } from "@/lib/actions/threads";
import { fetchAllTags } from "@/lib/actions/tags";
import { ThreadTable } from "@/components/features/thread-table";
import { ThreadComposer } from "./thread-composer";

export const dynamic = "force-dynamic";

export default async function ThreadsPage() {
  const [threads, tags] = await Promise.all([
    fetchAllThreads(),
    fetchAllTags(),
  ]);

  return (
    <div className="w-full max-w-6xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-lg font-medium text-text-primary">Threads</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Short thoughts and observations. Lower barrier than a full article.
        </p>
      </div>

      <div className="mb-6">
        <ThreadComposer allTags={tags} />
      </div>

      <ThreadTable threads={threads} allTags={tags} />
    </div>
  );
}
