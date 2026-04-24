import { NextRequest, NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/actions/subscribers";
import { SITE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${SITE.url}/en`);
  }

  const result = await unsubscribeByToken(token);
  const locale = result.locale ?? "en";

  if (result.success) {
    return NextResponse.redirect(`${SITE.url}/${locale}/subscribe?unsubscribed=true`);
  }

  return NextResponse.redirect(`${SITE.url}/${locale}/subscribe?error=invalid_token`);
}
