"use server";

import { createClient } from "@/utils/supabase/server";

export interface CampaignStats {
  id: string;
  article_id: string;
  article_title: string;
  sent_at: string;
  recipient_count: number;
  open_count: number;
  click_count: number;
  open_rate: number;
  click_rate: number;
}

export async function fetchCampaignStats(): Promise<CampaignStats[]> {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("notification_log")
    .select("id, article_id, sent_at, recipient_count, status")
    .eq("status", "sent")
    .order("sent_at", { ascending: false })
    .limit(20);

  if (!logs || logs.length === 0) return [];

  const logIds = logs.map((l) => l.id);
  const articleIds = logs.map((l) => l.article_id).filter(Boolean);

  const [eventsRes, articlesRes] = await Promise.all([
    supabase
      .from("email_events")
      .select("notification_id, event_type")
      .in("notification_id", logIds),
    supabase
      .from("articles")
      .select("id, en")
      .in("id", articleIds),
  ]);

  const events = eventsRes.data ?? [];
  const articles = articlesRes.data ?? [];

  const articleMap = new Map(
    articles.map((a) => [a.id, (a.en as { title?: string })?.title || "Untitled"]),
  );

  return logs.map((log) => {
    const logEvents = events.filter((e) => e.notification_id === log.id);
    const opens = logEvents.filter((e) => e.event_type === "open").length;
    const clicks = logEvents.filter((e) => e.event_type === "click").length;
    const recipientCount = log.recipient_count || 1;

    return {
      id: log.id,
      article_id: log.article_id,
      article_title: articleMap.get(log.article_id) ?? "Unknown",
      sent_at: log.sent_at,
      recipient_count: recipientCount,
      open_count: opens,
      click_count: clicks,
      open_rate: Math.round((opens / recipientCount) * 100),
      click_rate: Math.round((clicks / recipientCount) * 100),
    };
  });
}
