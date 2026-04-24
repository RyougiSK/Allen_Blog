import { baseLayout, escapeHtml } from "./base-layout";

interface ContactNotificationParams {
  name: string;
  email: string;
  message: string;
}

export function contactNotificationSubject(name: string): string {
  return `New inquiry from ${name}`;
}

export function contactNotificationHtml({ name, email, message }: ContactNotificationParams): string {
  const inner = `
    <p style="margin:0 0 24px;color:#EDEDEF;font-size:18px;line-height:1.5;">New contact inquiry</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="padding:8px 0;color:#7a7a88;font-size:13px;width:80px;vertical-align:top;">Name</td>
        <td style="padding:8px 0;color:#EDEDEF;font-size:14px;">${escapeHtml(name)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#7a7a88;font-size:13px;vertical-align:top;">Email</td>
        <td style="padding:8px 0;color:#EDEDEF;font-size:14px;"><a href="mailto:${escapeHtml(email)}" style="color:#C4A882;text-decoration:none;">${escapeHtml(email)}</a></td>
      </tr>
    </table>
    <div style="margin-top:24px;padding-top:24px;border-top:1px solid #2a2a35;">
      <p style="margin:0 0 12px;color:#7a7a88;font-size:13px;">Message</p>
      <div style="background-color:#22222e;border-radius:6px;padding:16px;">
        <p style="margin:0;color:#A0A0A8;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
    </div>
    <div style="padding-top:28px;">
      <a href="mailto:${escapeHtml(email)}" style="display:inline-block;background-color:#C4A882;color:#0B0D0F;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:500;letter-spacing:0.02em;">Reply to ${escapeHtml(name)}</a>
    </div>`;

  return baseLayout({
    locale: "en",
    content: inner,
    preheader: `New inquiry from ${name}`,
    showSignoff: false,
  });
}
