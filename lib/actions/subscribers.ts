"use server";

import { createServiceClient } from "@/utils/supabase/service";
import { resend, EMAIL_FROM, isEmailConfigured } from "@/lib/email/resend";
import {
  confirmationEmailHtml,
  confirmationEmailSubject,
} from "@/lib/email/templates/confirmation";
import type { ActionResult } from "@/lib/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeEmail(
  email: string,
  locale: "en" | "zh",
): Promise<ActionResult & { message?: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed)) {
    return { success: false, error: "Invalid email address." };
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, status, token")
    .eq("email", trimmed)
    .single();

  if (existing) {
    if (existing.status === "active") {
      return { success: true, message: "already_subscribed" };
    }

    // Re-subscribe or resend confirmation
    const newToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    await supabase
      .from("subscribers")
      .update({
        status: "pending",
        token: newToken,
        preferred_locale: locale,
        unsubscribed_at: null,
      })
      .eq("id", existing.id);

    await sendConfirmationEmail(trimmed, newToken, locale);
    return { success: true, message: "check_email" };
  }

  const { error } = await supabase.from("subscribers").insert({
    email: trimmed,
    preferred_locale: locale,
  });

  if (error) return { success: false, error: "Something went wrong. Please try again." };

  // Fetch the created subscriber to get the auto-generated token
  const { data: created } = await supabase
    .from("subscribers")
    .select("token")
    .eq("email", trimmed)
    .single();

  if (created) {
    await sendConfirmationEmail(trimmed, created.token, locale);
  }

  return { success: true, message: "check_email" };
}

export async function confirmSubscription(
  token: string,
): Promise<ActionResult & { locale?: string }> {
  const supabase = createServiceClient();

  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("id, preferred_locale, status")
    .eq("token", token)
    .single();

  if (!subscriber) {
    return { success: false, error: "Invalid or expired confirmation link." };
  }

  if (subscriber.status === "active") {
    return { success: true, locale: subscriber.preferred_locale };
  }

  const { error } = await supabase
    .from("subscribers")
    .update({ status: "active", confirmed_at: new Date().toISOString() })
    .eq("id", subscriber.id);

  if (error) return { success: false, error: "Something went wrong." };

  return { success: true, locale: subscriber.preferred_locale };
}

export async function unsubscribeByToken(
  token: string,
): Promise<ActionResult & { locale?: string }> {
  const supabase = createServiceClient();

  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("id, preferred_locale")
    .eq("token", token)
    .single();

  if (!subscriber) {
    return { success: false, error: "Invalid unsubscribe link." };
  }

  const { error } = await supabase
    .from("subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("id", subscriber.id);

  if (error) return { success: false, error: "Something went wrong." };

  return { success: true, locale: subscriber.preferred_locale };
}

export async function fetchSubscriberStats(): Promise<{
  total: number;
  active: number;
  pending: number;
}> {
  const supabase = createServiceClient();

  const { count: total } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true });

  const { count: active } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  const { count: pending } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return {
    total: total ?? 0,
    active: active ?? 0,
    pending: pending ?? 0,
  };
}

async function sendConfirmationEmail(
  email: string,
  token: string,
  locale: "en" | "zh",
): Promise<void> {
  if (!isEmailConfigured) {
    console.warn("RESEND_API_KEY not set — skipping confirmation email");
    return;
  }
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: confirmationEmailSubject(locale),
      html: confirmationEmailHtml({ token, locale }),
    });
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
  }
}
