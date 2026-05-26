"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import type { ETLJobLog } from "@/lib/types/financial";

export function ETLStatusPanel({ jobs }: { jobs: ETLJobLog[] }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const lastJob = jobs[0];

  async function handleTrigger(fresh = false) {
    setRunning(true);
    setResult(null);
    try {
      const url = fresh
        ? "/api/admin/financial-etl?fresh=1"
        : "/api/admin/financial-etl";
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setResult(`Done: ${data.indexes} indexes, ${data.priceRows} rows, ${data.analyses} analyses`);
        router.refresh();
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (e) {
      setResult(`Failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="p-4 rounded-lg border border-border bg-surface/30">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-text-primary">ETL Status</h3>
          {lastJob && (
            <p className="text-xs text-text-tertiary mt-0.5">
              Last run: {new Date(lastJob.started_at).toLocaleString()} —{" "}
              <span
                className={
                  lastJob.status === "completed"
                    ? "text-green-400"
                    : lastJob.status === "failed"
                      ? "text-red-400"
                      : "text-yellow-400"
                }
              >
                {lastJob.status}
              </span>
            </p>
          )}
          {!lastJob && (
            <p className="text-xs text-text-quaternary mt-0.5">No runs yet</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTrigger(false)}
            disabled={running}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-accent-warm/10 text-accent-warm hover:bg-accent-warm/20 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${running ? "animate-spin" : ""}`} />
            {running ? "Running..." : "Update"}
          </button>
          <button
            onClick={() => handleTrigger(true)}
            disabled={running}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-text-tertiary hover:text-text-primary hover:bg-surface/50 disabled:opacity-50 transition-colors"
          >
            Re-fetch All
          </button>
        </div>
      </div>
      {result && (
        <p className="text-xs text-text-secondary mt-2 p-2 rounded bg-bg-primary/50">
          {result}
        </p>
      )}
    </div>
  );
}
