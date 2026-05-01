import { SITE } from "@/lib/constants";
import { baseLayout } from "./base-layout";

interface ConfirmationEmailParams {
  token: string;
  locale: "en" | "zh";
}

const content = {
  en: {
    subject: "Confirm your email",
    preheader: "One step to confirm",
    greeting: "Thank you.",
    body: "This link confirms your email address. After that, you'll hear from me when there's something new.",
    cta: "Confirm",
    footer: "If this wasn't you, no action needed.",
    context: `You subscribed at ${SITE.url.replace("https://", "")}`,
  },
  zh: {
    subject: "确认你的邮箱",
    preheader: "一步确认",
    greeting: "谢谢你。",
    body: "点击下方链接确认你的邮箱地址。之后有新文章时你会收到通知。",
    cta: "确认",
    footer: "如果这不是你的操作，无需理会。",
    context: `您在 ${SITE.url.replace("https://", "")} 订阅`,
  },
};

export function confirmationEmailSubject(locale: "en" | "zh"): string {
  return content[locale].subject;
}

export function confirmationEmailHtml({ token, locale }: ConfirmationEmailParams): string {
  const t = content[locale];
  const confirmUrl = `${SITE.url}/api/subscribe/confirm?token=${token}`;

  const inner = `
    <p style="margin:0 0 16px;color:#111827;font-size:18px;line-height:1.5;">${t.greeting}</p>
    <p style="margin:0 0 32px;color:#4b5563;font-size:15px;line-height:1.7;">${t.body}</p>
    <a href="${confirmUrl}" style="display:inline-block;background-color:#111827;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:500;letter-spacing:0.02em;">${t.cta}</a>
    <p style="margin:24px 0 0;color:#6b7280;font-size:12px;line-height:1.6;">${t.footer}</p>
    <p style="margin:8px 0 0;color:#9ca3af;font-size:11px;">${t.context}</p>`;

  return baseLayout({
    locale,
    content: inner,
    preheader: t.preheader,
  });
}
