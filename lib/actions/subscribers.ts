"use server";

import { createServiceClient } from "@/utils/supabase/service";
import { resend, EMAIL_FROM, isEmailConfigured } from "@/lib/email/resend";
import {
  welcomeEmailSubject,
  welcomeEmailHtml,
} from "@/lib/email/templates/welcome";
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

    await supabase
      .from("subscribers")
      .update({
        status: "active",
        preferred_locale: locale,
        confirmed_at: new Date().toISOString(),
        unsubscribed_at: null,
      })
      .eq("id", existing.id);

    await sendWelcomeEmail(trimmed, locale, existing.token);
    return { success: true, message: "subscribed" };
  }

  const { error } = await supabase.from("subscribers").insert({
    email: trimmed,
    preferred_locale: locale,
    status: "active",
    confirmed_at: new Date().toISOString(),
  });

  if (error) return { success: false, error: "Something went wrong. Please try again." };

  const { data: created } = await supabase
    .from("subscribers")
    .select("token")
    .eq("email", trimmed)
    .single();

  if (created) {
    await sendWelcomeEmail(trimmed, locale, created.token);
  }

  return { success: true, message: "subscribed" };
}

export async function confirmSubscription(
  token: string,
): Promise<ActionResult & { locale?: string }> {
  const supabase = createServiceClient();

  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("id, email, preferred_locale, status, token")
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

  await sendWelcomeEmail(subscriber.email, subscriber.preferred_locale as "en" | "zh", subscriber.token);

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

async function sendWelcomeEmail(
  email: string,
  locale: "en" | "zh",
  unsubscribeToken: string,
): Promise<void> {
  if (!isEmailConfigured) {
    console.warn("RESEND_API_KEY not set — skipping welcome email");
    return;
  }
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: welcomeEmailSubject(locale),
      html: welcomeEmailHtml({ locale, unsubscribeToken }),
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}
