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
    preheader: "Thank you for writing — I'll reply soon",
    greeting: (name: string) => `Hi ${name},`,
    body: "Thank you for writing. I've received your message and will reply within a few days.",
    yourMessage: "Your message:",
    signoff: "",
    author: "Allen Chen",
  },
  zh: {
    subject: `已收到您的消息 — ${SITE.name}`,
    preheader: "感谢您的来信——我会尽快回复",
    greeting: (name: string) => `${name}，你好，`,
    body: "谢谢你的来信。我收到了，几天内会回复。",
    yourMessage: "您的消息：",
    signoff: "",
    author: "Allen Chen",
  },
};

export function contactAutoReplySubject(locale: "en" | "zh"): string {
  return content[locale].subject;
}

export function contactAutoReplyHtml({ name, message, locale }: ContactAutoReplyParams): string {
  const t = content[locale];

  const inner = `
    <p style="margin:0 0 16px;color:#111827;font-size:18px;line-height:1.5;">${t.greeting(escapeHtml(name))}</p>
    <p style="margin:0 0 32px;color:#4b5563;font-size:15px;line-height:1.7;">${t.body}</p>
    <div style="margin-bottom:32px;">
      <p style="margin:0 0 12px;color:#6b7280;font-size:13px;">${t.yourMessage}</p>
      <div style="border-left:2px solid #e5e7eb;padding-left:16px;">
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
    </div>
    ${t.signoff ? `<p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">${t.signoff}</p>` : ""}`;

  return baseLayout({
    locale,
    content: inner,
    preheader: t.preheader,
  });
}
