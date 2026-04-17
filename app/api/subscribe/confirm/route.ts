import { NextRequest, NextResponse } from "next/server";
import { confirmSubscription } from "@/lib/actions/subscribers";
import { SITE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${SITE.url}/en/subscribe`);
  }

  const result = await confirmSubscription(token);
  const locale = result.locale ?? "en";

  if (result.success) {
    return NextResponse.redirect(`${SITE.url}/${locale}/subscribe?confirmed=true`);
  }

  return NextResponse.redirect(`${SITE.url}/${locale}/subscribe?error=invalid_token`);
}
