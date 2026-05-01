import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nid = url.searchParams.get("nid");
  const sid = url.searchParams.get("sid");

  if (nid && sid) {
    const supabase = await createClient();
    await supabase.from("email_events").insert({
      notification_id: nid,
      subscriber_id: sid,
      event_type: "open",
    });
  }

  return new NextResponse(TRANSPARENT_GIF, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
