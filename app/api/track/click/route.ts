import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");
  const nid = url.searchParams.get("nid");
  const sid = url.searchParams.get("sid");

  if (nid && sid) {
    const supabase = await createClient();
    await supabase.from("email_events").insert({
      notification_id: nid,
      subscriber_id: sid,
      event_type: "click",
      link_url: targetUrl,
    });
  }

  if (targetUrl) {
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.redirect(new URL("/", request.url));
}
