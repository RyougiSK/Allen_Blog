import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const SUPPORTED_LOCALES = ["en", "zh"];
const DEFAULT_LOCALE = "en";

const SKIP_PREFIXES = [
  "/admin",
  "/login",
  "/reset-password",
  "/auth",
  "/api",
  "/_next",
  "/favicon",
  "/sitemap.xml",
  "/robots.txt",
  "/feed.xml",
];

function getPathnameLocale(pathname: string): string | null {
  const segments = pathname.split("/");
  const first = segments[1];
  return SUPPORTED_LOCALES.includes(first) ? first : null;
}

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get("locale")?.value;
  if (cookie === "zh-cn" || cookie === "zh") return "zh";
  if (cookie === "en") return "en";

  const acceptLang = request.headers.get("accept-language") ?? "";
  if (acceptLang.startsWith("zh")) return "zh";

  return DEFAULT_LOCALE;
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) {
    return response;
  }

  if (pathname === "/") {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  if (getPathnameLocale(pathname)) {
    return response;
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
