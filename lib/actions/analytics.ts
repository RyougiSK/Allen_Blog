"use server";

import { createClient } from "@/utils/supabase/server";
import { subDays, format, startOfDay } from "date-fns";

export interface DailyCount {
  date: string;
  count: number;
}

export async function fetchSubscriberGrowth(days: number = 30): Promise<DailyCount[]> {
  const supabase = await createClient();
  const since = subDays(new Date(), days).toISOString();

  const { data } = await supabase
    .from("subscribers")
    .select("created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  const dateMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const key = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
    dateMap.set(key, 0);
  }

  for (const row of data ?? []) {
    const key = format(startOfDay(new Date(row.created_at)), "yyyy-MM-dd");
    dateMap.set(key, (dateMap.get(key) ?? 0) + 1);
  }

  return Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));
}

export async function fetchPublishingActivity(days: number = 30): Promise<DailyCount[]> {
  const supabase = await createClient();
  const since = subDays(new Date(), days).toISOString();

  const { data } = await supabase
    .from("articles")
    .select("created_at")
    .eq("status", "published")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  const dateMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const key = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
    dateMap.set(key, 0);
  }

  for (const row of data ?? []) {
    const key = format(startOfDay(new Date(row.created_at)), "yyyy-MM-dd");
    dateMap.set(key, (dateMap.get(key) ?? 0) + 1);
  }

  return Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));
}
