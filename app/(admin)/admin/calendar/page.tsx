import { createClient } from "@/utils/supabase/server";
import { ContentCalendar } from "@/components/features/content-calendar";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("articles")
    .select("id, en, zh, status, created_at, updated_at")
    .in("status", ["published", "draft"])
    .order("created_at", { ascending: false });

  const articles = (data ?? []) as Article[];

  return (
    <div className="w-full max-w-6xl px-8 py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Content Calendar</h1>
      <ContentCalendar articles={articles} />
    </div>
  );
}
