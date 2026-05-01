import { SITE } from "@/lib/constants";

interface BaseLayoutOptions {
  locale: "en" | "zh";
  content: string;
  preheader?: string;
  showUnsubscribe?: boolean;
  unsubscribeUrl?: string;
  showSignoff?: boolean;
}

const footerText = {
  en: { unsubscribe: "Unsubscribe" },
  zh: { unsubscribe: "退订" },
};

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function baseLayout({
  locale,
  content,
  preheader,
  showUnsubscribe = false,
  unsubscribeUrl,
  showSignoff = true,
}: BaseLayoutOptions): string {
  const t = footerText[locale];

  const preheaderHtml = preheader
    ? `<span style="display:none;font-size:1px;color:#111118;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</span>`
    : "";

  const unsubscribeHtml =
    showUnsubscribe && unsubscribeUrl
      ? `<a href="${unsubscribeUrl}" style="color:#6b7280;font-size:12px;text-decoration:underline;">${t.unsubscribe}</a><span style="color:#9ca3af;margin:0 8px;">&middot;</span>`
      : "";

  const signoffHtml = showSignoff
    ? `<tr><td style="padding:8px 36px 24px;">
        <p style="margin:0;color:#6b7280;font-size:14px;font-style:italic;">— Allen</p>
      </td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  ${preheaderHtml}
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f9fafb;padding:40px 16px;mso-table-lspace:0pt;mso-table-rspace:0pt;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;mso-table-lspace:0pt;mso-table-rspace:0pt;">

        <!-- Branded Header -->
        <tr><td style="padding:32px 0;text-align:center;border-bottom:1px solid #e5e7eb;">
          <a href="${SITE.url}" style="text-decoration:none;">
            <img src="${SITE.logo}" alt="${SITE.name}" width="56" height="56" style="display:block;margin:0 auto 16px;width:56px;height:56px;border-radius:12px;border:0;" />
          </a>
          <a href="${SITE.url}" style="color:#111827;text-decoration:none;font-size:14px;letter-spacing:0.12em;text-transform:uppercase;display:block;">${SITE.name}</a>
          <span style="color:#6b7280;font-size:11px;letter-spacing:0.05em;display:block;margin-top:4px;">${SITE.nameZh}</span>
        </td></tr>

        <!-- Content -->
        <tr><td style="padding:32px 36px;">
          ${content}
        </td></tr>

        <!-- Sign-off -->
        ${signoffHtml}

        <!-- Footer -->
        <tr><td style="border-top:1px solid #e5e7eb;padding:20px 36px;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;line-height:1.8;">
            ${unsubscribeHtml}<a href="${SITE.url}" style="color:#6b7280;font-size:12px;text-decoration:none;">${SITE.url.replace("https://", "")}</a>
          </p>
          <p style="margin:0;color:#9ca3af;font-size:11px;">
            &copy; ${new Date().getFullYear()} ${SITE.name}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
