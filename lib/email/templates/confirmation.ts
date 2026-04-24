import { SITE } from "@/lib/constants";
import { baseLayout } from "./base-layout";

interface ConfirmationEmailParams {
  token: string;
  locale: "en" | "zh";
}

const content = {
  en: {
    subject: "Confirm your subscription",
    preheader: "Confirm your email to start receiving articles",
    greeting: "Thanks for subscribing.",
    body: "Click the button below to confirm your email address and start receiving new articles.",
    cta: "Confirm Subscription",
    footer: "If you didn't subscribe, you can safely ignore this email.",
    context: `You subscribed at ${SITE.url.replace("https://", "")}`,
  },
  zh: {
    subject: "确认您的订阅",
    preheader: "请确认您的邮箱以接收文章通知",
    greeting: "感谢您的订阅。",
    body: "请点击下方按钮确认您的电子邮箱地址，以开始接收新文章通知。",
    cta: "确认订阅",
    footer: "如果您没有订阅，请忽略此邮件。",
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
    <p style="margin:0 0 16px;color:#EDEDEF;font-size:18px;line-height:1.5;">${t.greeting}</p>
    <p style="margin:0 0 32px;color:#A0A0A8;font-size:15px;line-height:1.7;">${t.body}</p>
    <a href="${confirmUrl}" style="display:inline-block;background-color:#C4A882;color:#0B0D0F;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:500;letter-spacing:0.02em;">${t.cta}</a>
    <p style="margin:24px 0 0;color:#55556a;font-size:12px;line-height:1.6;">${t.footer}</p>
    <p style="margin:8px 0 0;color:#3a3a48;font-size:11px;">${t.context}</p>`;

  return baseLayout({
    locale,
    content: inner,
    preheader: t.preheader,
  });
}
