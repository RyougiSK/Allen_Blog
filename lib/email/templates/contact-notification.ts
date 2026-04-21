import { SITE } from "@/lib/constants";

interface ContactNotificationParams {
  name: string;
  email: string;
  message: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function contactNotificationSubject(name: string): string {
  return `New inquiry from ${name}`;
}

export function contactNotificationHtml({ name, email, message }: ContactNotificationParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0C0C0E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0C0C0E;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;">
        <tr><td style="padding-bottom:32px;">
          <a href="${SITE.url}" style="color:#A0A0A8;text-decoration:none;font-size:14px;letter-spacing:0.05em;">${SITE.name}</a>
        </td></tr>
        <tr><td style="padding-bottom:16px;">
          <p style="margin:0;color:#EDEDEF;font-size:18px;line-height:1.5;">New contact inquiry</p>
        </td></tr>
        <tr><td style="padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;color:#6B6B74;font-size:13px;width:100px;vertical-align:top;">Name</td>
              <td style="padding:8px 0;color:#EDEDEF;font-size:14px;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6B6B74;font-size:13px;vertical-align:top;">Email</td>
              <td style="padding:8px 0;color:#EDEDEF;font-size:14px;"><a href="mailto:${escapeHtml(email)}" style="color:#C4A882;text-decoration:none;">${escapeHtml(email)}</a></td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="border-top:1px solid #1E1E23;padding-top:24px;padding-bottom:24px;">
          <p style="margin:0 0 8px;color:#6B6B74;font-size:13px;">Message</p>
          <p style="margin:0;color:#A0A0A8;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
        </td></tr>
        <tr><td style="border-top:1px solid #1E1E23;padding-top:24px;">
          <p style="margin:0;color:#45454D;font-size:12px;">Sent via ${SITE.url}/contact</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
