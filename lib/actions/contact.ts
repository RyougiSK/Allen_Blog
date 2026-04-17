"use server";

import { createServiceClient } from "@/utils/supabase/service";
import { resend, EMAIL_FROM, isEmailConfigured } from "@/lib/email/resend";
import {
  contactNotificationSubject,
  contactNotificationHtml,
} from "@/lib/email/templates/contact-notification";
import type { ActionResult, InquiryType } from "@/lib/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TYPES: InquiryType[] = ["interview", "collaboration", "speaking", "other"];

export async function submitContactInquiry(
  name: string,
  email: string,
  inquiryType: string,
  message: string,
  referralSource: string,
  locale: "en" | "zh",
): Promise<ActionResult> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedMessage = message.trim();
  const trimmedReferral = referralSource.trim() || null;

  if (!trimmedName) {
    return { success: false, error: "Name is required." };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { success: false, error: "Invalid email address." };
  }

  if (!VALID_TYPES.includes(inquiryType as InquiryType)) {
    return { success: false, error: "Invalid inquiry type." };
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
    inquiry_type: inquiryType,
    message: trimmedMessage,
    referral_source: trimmedReferral,
    locale,
  });

  if (error) {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  await sendNotificationEmail(trimmedName, trimmedEmail, inquiryType as InquiryType, trimmedMessage, trimmedReferral);

  return { success: true };
}

async function sendNotificationEmail(
  name: string,
  email: string,
  inquiryType: InquiryType,
  message: string,
  referralSource: string | null,
): Promise<void> {
  if (!isEmailConfigured) {
    console.warn("RESEND_API_KEY not set — skipping contact notification email");
    return;
  }
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: "hello@hanmingchen.com",
      subject: contactNotificationSubject(name, inquiryType),
      html: contactNotificationHtml({ name, email, inquiryType, message, referralSource }),
    });
  } catch (err) {
    console.error("Failed to send contact notification email:", err);
  }
}
