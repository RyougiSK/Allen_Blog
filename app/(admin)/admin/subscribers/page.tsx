import {
  fetchSubscribers,
  fetchSubscriberStats,
} from "@/lib/actions/subscribers";
import { SubscriberTable } from "@/components/features/subscriber-table";
import type { SubscriberStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const { page: pageParam, status, search } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));

  const validStatuses: SubscriberStatus[] = ["active", "pending", "unsubscribed"];
  const statusFilter = validStatuses.includes(status as SubscriberStatus)
    ? (status as SubscriberStatus)
    : undefined;

  const [data, stats] = await Promise.all([
    fetchSubscribers({
      page,
      limit: 20,
      status: statusFilter,
      search: search || undefined,
    }),
    fetchSubscriberStats(),
  ]);

  return (
    <div className="w-full max-w-6xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-lg font-medium text-text-primary">Subscribers</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          {stats.active} active, {stats.pending} pending of {stats.total} total
        </p>
      </div>
      <SubscriberTable
        initialData={data}
        initialStatus={status}
        initialSearch={search}
      />
    </div>
  );
}
