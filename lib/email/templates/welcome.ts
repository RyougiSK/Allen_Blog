import { SITE } from "@/lib/constants";
import { baseLayout } from "./base-layout";

interface WelcomeEmailParams {
  locale: "en" | "zh";
  unsubscribeToken: string;
}

const content = {
  en: {
    subject: "Welcome",
    preheader: "Thank you for subscribing",
    greeting: "Welcome.",
    body: "You've joined the mailing list. I'll send a short note when there's something new — usually about what I've been noticing or sitting with lately.",
    cta: "Visit the site",
    signoff: "Thank you for reading.",
  },
  zh: {
    subject: "欢迎",
    preheader: "感谢你的订阅",
    greeting: "欢迎。",
    body: "你已加入邮件列表。有新文章时我会发一封简短的通知。",
    cta: "访问网站",
    signoff: "感谢您的阅读。",
  },
};

export function welcomeEmailSubject(locale: "en" | "zh"): string {
  return content[locale].subject;
}

export function welcomeEmailHtml({ locale, unsubscribeToken }: WelcomeEmailParams): string {
  const t = content[locale];
  const siteLocale = locale === "zh" ? "zh-cn" : "en";
  const journalUrl = `${SITE.url}/${siteLocale}`;
  const unsubscribeUrl = `${SITE.url}/api/subscribe/unsubscribe?token=${unsubscribeToken}`;

  const inner = `
    <p style="margin:0 0 16px;color:#111827;font-size:18px;line-height:1.5;">${t.greeting}</p>
    <p style="margin:0 0 32px;color:#4b5563;font-size:15px;line-height:1.7;">${t.body}</p>
    <a href="${journalUrl}" style="display:inline-block;background-color:#111827;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:500;letter-spacing:0.02em;">${t.cta}</a>
    <p style="margin:32px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">${t.signoff}</p>`;

  return baseLayout({
    locale,
    content: inner,
    preheader: t.preheader,
    showUnsubscribe: true,
    unsubscribeUrl,
  });
}
