import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/features/animated-counter";
import { Sparkline } from "@/components/features/sparkline";
import { FileText, Eye, EyeOff, Mail, Plus, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fetchSubscriberStats } from "@/lib/actions/subscribers";
import { fetchSubscriberGrowth, fetchPublishingActivity } from "@/lib/actions/analytics";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    totalResult,
    publishedResult,
    draftResult,
    recentResult,
    subscriberStats,
    subscriberGrowth,
    publishingActivity,
  ] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("articles").select("*").order("updated_at", { ascending: false }).limit(5),
    fetchSubscriberStats(),
    fetchSubscriberGrowth(30),
    fetchPublishingActivity(30),
  ]);

  const stats = [
    { label: "Total Articles", count: totalResult.count ?? 0, icon: FileText },
    { label: "Published", count: publishedResult.count ?? 0, icon: Eye },
    { label: "Drafts", count: draftResult.count ?? 0, icon: EyeOff },
    { label: "Subscribers", count: subscriberStats.active, icon: Mail },
  ];

  const recentArticles = recentResult.data ?? [];
  const subscriberData = subscriberGrowth.map((d) => d.count);
  const publishData = publishingActivity.map((d) => d.count);
  const totalNewSubscribers = subscriberData.reduce((a, b) => a + b, 0);
  const totalPublished30d = publishData.reduce((a, b) => a + b, 0);

  return (
    <div className="w-full max-w-6xl px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/admin/posts/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Article
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
        {stats.map(({ label, count, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-bg-primary">
              <Icon className="h-5 w-5 text-text-tertiary" />
            </div>
            <div>
              <p className="text-2xl font-bold"><AnimatedCounter value={count} /></p>
              <p className="text-xs text-text-tertiary">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-text-tertiary" />
              <h3 className="text-sm font-medium text-text-secondary">Subscriber Growth</h3>
            </div>
            <span className="text-xs text-text-quaternary">
              +{totalNewSubscribers} last 30 days
            </span>
          </div>
          <Sparkline data={subscriberData} width={400} height={48} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-text-tertiary" />
              <h3 className="text-sm font-medium text-text-secondary">Publishing Activity</h3>
            </div>
            <span className="text-xs text-text-quaternary">
              {totalPublished30d} articles in 30 days
            </span>
          </div>
          <Sparkline data={publishData} width={400} height={48} color="var(--color-success)" fillColor="var(--color-success)" />
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Recent Articles</h2>
        {recentArticles.length === 0 ? (
          <Card>
            <p className="text-sm text-text-tertiary text-center py-4">
              No articles yet. Create your first one!
            </p>
          </Card>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            {recentArticles.map((article) => {
              const title = article.en?.title || article.zh?.title || "Untitled";
              return (
                <Link
                  key={article.id}
                  href={`/admin/posts/${article.id}/edit`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-surface/50 transition-colors border-b border-border last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        article.status === "published" ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <span className="text-sm font-medium">{title}</span>
                    <div className="flex items-center gap-1 ml-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          article.en?.completed ? "bg-emerald-400" : "bg-text-quaternary"
                        }`}
                        title="EN"
                      />
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          article.zh?.completed ? "bg-emerald-400" : "bg-text-quaternary"
                        }`}
                        title="ZH"
                      />
                    </div>
                  </div>
                  <span className="text-xs text-text-tertiary">
                    {format(parseISO(article.updated_at), "MMM d, yyyy")}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
