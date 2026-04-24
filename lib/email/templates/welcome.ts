import { SITE } from "@/lib/constants";
import { baseLayout } from "./base-layout";

interface WelcomeEmailParams {
  locale: "en" | "zh";
  unsubscribeToken: string;
}

const content = {
  en: {
    subject: "Welcome to The Quiet Way",
    preheader: "Welcome — here's what to expect",
    greeting: "Welcome.",
    body: "You've subscribed to The Quiet Way. From here on, you'll receive a quiet note whenever I publish something new — reflections on psychology, philosophy, and the questions that stay with us.",
    cta: "Visit The Quiet Way",
    signoff: "Thank you for reading.",
  },
  zh: {
    subject: "欢迎订阅静之道",
    preheader: "欢迎——以下是您将收到的内容",
    greeting: "欢迎。",
    body: "您已订阅静之道。从现在起，每当有新文章发布时，您会收到一封简短的邮件通知——关于心理学、哲学，以及那些值得深思的问题。",
    cta: "访问静之道",
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
    <p style="margin:0 0 16px;color:#EDEDEF;font-size:18px;line-height:1.5;">${t.greeting}</p>
    <p style="margin:0 0 32px;color:#A0A0A8;font-size:15px;line-height:1.7;">${t.body}</p>
    <a href="${journalUrl}" style="display:inline-block;background-color:#C4A882;color:#0B0D0F;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:500;letter-spacing:0.02em;">${t.cta}</a>
    <p style="margin:32px 0 0;color:#7a7a88;font-size:14px;line-height:1.6;">${t.signoff}</p>`;

  return baseLayout({
    locale,
    content: inner,
    preheader: t.preheader,
    showUnsubscribe: true,
    unsubscribeUrl,
  });
}
