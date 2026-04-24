"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Trash2, RotateCw, Mail, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/features/pagination";
import { useToast } from "@/lib/hooks/use-toast";
import {
  deleteSubscriber,
  resendConfirmation,
} from "@/lib/actions/subscribers";
import type { Subscriber, SubscriberStatus } from "@/lib/types";

const STATUS_TABS: { label: string; value: SubscriberStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Unsubscribed", value: "unsubscribed" },
];

const STATUS_VARIANT: Record<SubscriberStatus, "success" | "warning" | "default"> = {
  active: "success",
  pending: "warning",
  unsubscribed: "default",
};

interface SubscriberTableProps {
  initialData: {
    subscribers: Subscriber[];
    total: number;
    page: number;
    limit: number;
  };
  initialStatus?: string;
  initialSearch?: string;
}

export function SubscriberTable({
  initialData,
  initialStatus,
  initialSearch,
}: SubscriberTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(initialSearch ?? "");
  const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activeStatus = initialStatus ?? "";
  const { subscribers, total, page, limit } = initialData;
  const totalPages = Math.ceil(total / limit);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val) params.set(key, val);
        else params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams, startTransition],
  );

  function handleStatusFilter(status: string) {
    updateParams({ status: status || undefined, search: searchValue || undefined });
  }

  function handleSearch(query: string) {
    setSearchValue(query);
    const timeout = setTimeout(() => {
      updateParams({ search: query || undefined, status: activeStatus || undefined });
    }, 300);
    return () => clearTimeout(timeout);
  }

  async function handleResend(subscriber: Subscriber) {
    const result = await resendConfirmation(subscriber.id);
    if (result.success) {
      toast.addToast({ message: "Confirmation email resent", variant: "success" });
    } else {
      toast.addToast({ message: result.error ?? "Failed to resend", variant: "error" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteSubscriber(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (result.success) {
      toast.addToast({ message: "Subscriber deleted", variant: "success" });
      router.refresh();
    } else {
      toast.addToast({ message: result.error ?? "Failed to delete", variant: "error" });
    }
  }

  const basePath = (() => {
    const params = new URLSearchParams();
    if (activeStatus) params.set("status", activeStatus);
    if (searchValue) params.set("search", searchValue);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  })();

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {STATUS_TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleStatusFilter(value)}
              className={`rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium transition-colors duration-[var(--duration-fast)] ${
                activeStatus === value
                  ? "bg-surface text-text-primary"
                  : "text-text-tertiary hover:text-text-primary hover:bg-surface/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-quaternary" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full rounded-[var(--radius-md)] border border-border bg-surface pl-9 pr-8 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:outline-none focus:ring-2 focus:ring-accent-warm/50 focus:border-accent-warm"
          />
          {searchValue && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-text-quaternary hover:text-text-primary transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Mail className="h-8 w-8 text-text-quaternary mb-3" />
          <p className="text-sm font-medium text-text-secondary">
            {activeStatus || searchValue ? "No subscribers match your filters" : "No subscribers yet"}
          </p>
        </div>
      ) : (
        <div className="rounded-[var(--radius-md)] border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">Email</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">Locale</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">Subscribed</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-text-tertiary">Confirmed</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-text-tertiary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-text-primary">{sub.email}</td>
                  <td className="px-4 py-3">
                    <Badge>{sub.preferred_locale === "zh" ? "中文" : "EN"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[sub.status]}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-tertiary whitespace-nowrap">
                    {format(parseISO(sub.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-tertiary whitespace-nowrap">
                    {sub.confirmed_at
                      ? format(parseISO(sub.confirmed_at), "MMM d, yyyy")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      {sub.status === "pending" && (
                        <Tooltip label="Resend confirmation">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResend(sub)}
                          >
                            <RotateCw className="h-3.5 w-3.5" />
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip label="Delete">
                        <Button
                          variant="ghost-danger"
                          size="icon"
                          onClick={() => setDeleteTarget(sub)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={basePath}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.email ?? ""}"?`}
        description="This subscriber will be permanently removed."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
