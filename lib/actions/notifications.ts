"use server";

import { createServiceClient } from "@/utils/supabase/service";
import { resend, EMAIL_FROM, isEmailConfigured } from "@/lib/email/resend";
import {
  newArticleEmailHtml,
  newArticleEmailSubject,
} from "@/lib/email/templates/new-article";
import type { Article, Subscriber } from "@/lib/types";

export async function notifySubscribersOfNewArticle(
  articleId: string,
): Promise<void> {
  const supabase = createServiceClient();

  // Check if notification already sent for this article
  const { data: existing } = await supabase
    .from("notification_log")
    .select("id")
    .eq("article_id", articleId)
    .single();

  if (existing) return;

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .single();

  if (!article || article.status !== "published") return;

  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("*")
    .eq("status", "active");

  if (!subscribers || subscribers.length === 0) return;

  if (!isEmailConfigured) {
    console.warn("RESEND_API_KEY not set — skipping notification emails");
    return;
  }

  const typedArticle = article as Article;
  const typedSubscribers = subscribers as Subscriber[];

  const enSubscribers = typedSubscribers.filter((s) => s.preferred_locale === "en");
  const zhSubscribers = typedSubscribers.filter((s) => s.preferred_locale === "zh");

  let totalSent = 0;
  let hasError = false;

  for (const [locale, group] of [["en", enSubscribers], ["zh", zhSubscribers]] as const) {
    if (group.length === 0) continue;

    const emails = group.map((subscriber) => ({
      from: EMAIL_FROM,
      to: subscriber.email,
      subject: newArticleEmailSubject(typedArticle, locale),
      html: newArticleEmailHtml({
        article: typedArticle,
        locale,
        unsubscribeToken: subscriber.token,
      }),
    }));

    try {
      await resend.batch.send(emails);
      totalSent += group.length;
    } catch (err) {
      console.error(`Failed to send notification emails (${locale}):`, err);
      hasError = true;
    }
  }

  await supabase.from("notification_log").insert({
    article_id: articleId,
    recipient_count: totalSent,
    status: hasError ? (totalSent > 0 ? "partial" : "failed") : "sent",
  });
}
