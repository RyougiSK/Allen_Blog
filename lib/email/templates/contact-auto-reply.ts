import { SITE } from "@/lib/constants";
import { baseLayout, escapeHtml } from "./base-layout";

interface ContactAutoReplyParams {
  name: string;
  message: string;
  locale: "en" | "zh";
}

const content = {
  en: {
    subject: `Message received — ${SITE.name}`,
    preheader: "Thank you for reaching out — I'll get back to you soon",
    greeting: (name: string) => `Hi ${name},`,
    body: "Thank you for reaching out. I've received your message and will get back to you within a few business days.",
    yourMessage: "Your message:",
    signoff: "Best regards,",
    author: "Allen Chen",
  },
  zh: {
    subject: `已收到您的消息 — ${SITE.name}`,
    preheader: "感谢您的来信——我会尽快回复",
    greeting: (name: string) => `${name}，你好，`,
    body: "感谢您的来信。我已收到您的消息，将在几个工作日内回复您。",
    yourMessage: "您的消息：",
    signoff: "此致，",
    author: "Allen Chen",
  },
};

export function contactAutoReplySubject(locale: "en" | "zh"): string {
  return content[locale].subject;
}

export function contactAutoReplyHtml({ name, message, locale }: ContactAutoReplyParams): string {
  const t = content[locale];

  const inner = `
    <p style="margin:0 0 16px;color:#EDEDEF;font-size:18px;line-height:1.5;">${t.greeting(escapeHtml(name))}</p>
    <p style="margin:0 0 32px;color:#A0A0A8;font-size:15px;line-height:1.7;">${t.body}</p>
    <div style="margin-bottom:32px;">
      <p style="margin:0 0 12px;color:#7a7a88;font-size:13px;">${t.yourMessage}</p>
      <div style="border-left:2px solid #2a2a35;padding-left:16px;">
        <p style="margin:0;color:#7a7a88;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
    </div>
    <p style="margin:0;color:#7a7a88;font-size:14px;line-height:1.6;">${t.signoff}</p>`;

  return baseLayout({
    locale,
    content: inner,
    preheader: t.preheader,
  });
}
