import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { SITE } from "@/lib/constants";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") ?? "en";
  const col = locale === "zh" ? "zh" : "en";

  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("en, zh, created_at, updated_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (articles ?? [])
    .filter((a) => {
      const lang = a[col] as { slug?: string; title?: string; completed?: boolean } | null;
      return lang?.slug && lang?.completed;
    })
    .map((a) => {
      const lang = a[col] as {
        slug: string;
        title: string;
        excerpt?: string;
        meta?: { meta_description?: string };
      };
      const description = lang.meta?.meta_description || lang.excerpt || "";
      return `
    <item>
      <title>${escapeXml(lang.title)}</title>
      <link>${SITE.url}/${locale}/${lang.slug}</link>
      <guid isPermaLink="true">${SITE.url}/${locale}/${lang.slug}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${new Date(a.created_at).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(SITE.author.name)}</dc:creator>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)} Blog</title>
    <link>${SITE.url}/${locale}/writing</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${locale === "zh" ? "zh-CN" : "en"}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/feed.xml?locale=${locale}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
