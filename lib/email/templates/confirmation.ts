import { SITE } from "@/lib/constants";

interface ConfirmationEmailParams {
  token: string;
  locale: "en" | "zh";
}

const content = {
  en: {
    subject: "Confirm your subscription",
    greeting: "Thanks for subscribing.",
    body: "Click the button below to confirm your email address and start receiving new articles.",
    cta: "Confirm Subscription",
    footer: "If you didn't subscribe, you can safely ignore this email.",
  },
  zh: {
    subject: "确认您的订阅",
    greeting: "感谢您的订阅。",
    body: "请点击下方按钮确认您的电子邮箱地址，以开始接收新文章通知。",
    cta: "确认订阅",
    footer: "如果您没有订阅，请忽略此邮件。",
  },
};

export function confirmationEmailSubject(locale: "en" | "zh"): string {
  return content[locale].subject;
}

export function confirmationEmailHtml({ token, locale }: ConfirmationEmailParams): string {
  const t = content[locale];
  const confirmUrl = `${SITE.url}/api/subscribe/confirm?token=${token}`;

  return `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0C0C0E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0C0C0E;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;">
        <tr><td style="padding-bottom:32px;">
          <a href="${SITE.url}" style="color:#A0A0A8;text-decoration:none;font-size:14px;letter-spacing:0.05em;">${SITE.name}</a>
        </td></tr>
        <tr><td style="padding-bottom:16px;">
          <p style="margin:0;color:#EDEDEF;font-size:18px;line-height:1.5;">${t.greeting}</p>
        </td></tr>
        <tr><td style="padding-bottom:32px;">
          <p style="margin:0;color:#A0A0A8;font-size:15px;line-height:1.7;">${t.body}</p>
        </td></tr>
        <tr><td style="padding-bottom:40px;">
          <a href="${confirmUrl}" style="display:inline-block;background-color:#C4A882;color:#0C0C0E;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:500;letter-spacing:0.01em;">${t.cta}</a>
        </td></tr>
        <tr><td style="border-top:1px solid #1E1E23;padding-top:24px;">
          <p style="margin:0;color:#45454D;font-size:12px;line-height:1.6;">${t.footer}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
