"use server";

import { createServiceClient } from "@/utils/supabase/service";
import { resend, EMAIL_FROM, isEmailConfigured } from "@/lib/email/resend";
import {
  contactNotificationSubject,
  contactNotificationHtml,
} from "@/lib/email/templates/contact-notification";
import {
  contactAutoReplySubject,
  contactAutoReplyHtml,
} from "@/lib/email/templates/contact-auto-reply";
import type { ActionResult } from "@/lib/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactInquiry(
  name: string,
  email: string,
  message: string,
  locale: "en" | "zh",
): Promise<ActionResult> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedMessage = message.trim();

  if (!trimmedName) {
    return { success: false, error: "Name is required." };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { success: false, error: "Invalid email address." };
  }

  if (!trimmedMessage) {
    return { success: false, error: "Message is required." };
  }

  if (trimmedMessage.length > 5000) {
    return { success: false, error: "Message is too long (max 5000 characters)." };
  }

  const supabase = createServiceClient();

  const { error } = await supabase.from("contact_inquiries").insert({
    name: trimmedName,
    email: trimmedEmail,
    inquiry_type: "other",
    message: trimmedMessage,
    locale,
  });

  if (error) {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  await Promise.allSettled([
    sendNotificationEmail(trimmedName, trimmedEmail, trimmedMessage),
    sendAutoReplyEmail(trimmedName, trimmedEmail, trimmedMessage, locale),
  ]);

  return { success: true };
}

async function sendNotificationEmail(
  name: string,
  email: string,
  message: string,
): Promise<void> {
  if (!isEmailConfigured) {
    console.warn("RESEND_API_KEY not set — skipping contact notification email");
    return;
  }
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: process.env.CONTACT_EMAIL || "chenhm03@gmail.com",
      subject: contactNotificationSubject(name),
      html: contactNotificationHtml({ name, email, message }),
    });
  } catch (err) {
    console.error("Failed to send contact notification email:", err);
  }
}

async function sendAutoReplyEmail(
  name: string,
  email: string,
  message: string,
  locale: "en" | "zh",
): Promise<void> {
  if (!isEmailConfigured) {
    console.warn("RESEND_API_KEY not set — skipping contact auto-reply email");
    return;
  }
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: contactAutoReplySubject(locale),
      html: contactAutoReplyHtml({ name, message, locale }),
    });
  } catch (err) {
    console.error("Failed to send contact auto-reply email:", err);
  }
}
