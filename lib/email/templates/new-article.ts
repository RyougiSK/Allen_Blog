import { SITE } from "@/lib/constants";
import type { Article } from "@/lib/types";

interface NewArticleEmailParams {
  article: Article;
  locale: "en" | "zh";
  unsubscribeToken: string;
}

const content = {
  en: {
    subjectPrefix: "New article:",
    cta: "Read Article",
    unsubscribe: "Unsubscribe",
  },
  zh: {
    subjectPrefix: "新文章：",
    cta: "阅读文章",
    unsubscribe: "退订",
  },
};

export function newArticleEmailSubject(article: Article, locale: "en" | "zh"): string {
  const lang = article[locale];
  const otherLocale = locale === "en" ? "zh" : "en";
  const title = lang.completed ? lang.title : article[otherLocale].title;
  return `${content[locale].subjectPrefix} ${title}`;
}

export function newArticleEmailHtml({ article, locale, unsubscribeToken }: NewArticleEmailParams): string {
  const t = content[locale];
  const otherLocale = locale === "en" ? "zh" : "en";
  const lang = article[locale].completed ? article[locale] : article[otherLocale];
  const urlLocale = article[locale].completed ? locale : otherLocale;
  const articleUrl = `${SITE.url}/${urlLocale}/${lang.slug}`;
  const unsubscribeUrl = `${SITE.url}/api/subscribe/unsubscribe?token=${unsubscribeToken}`;
  const excerpt = lang.excerpt.length > 200 ? lang.excerpt.slice(0, 200) + "..." : lang.excerpt;

  const coverImageHtml = article.cover_image
    ? `<tr><td style="padding-bottom:24px;">
        <img src="${article.cover_image}" alt="" width="480" style="width:100%;max-width:480px;height:auto;border-radius:8px;display:block;" />
      </td></tr>`
    : "";

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
        ${coverImageHtml}
        <tr><td style="padding-bottom:12px;">
          <h1 style="margin:0;color:#EDEDEF;font-size:22px;font-weight:400;line-height:1.3;">${lang.title}</h1>
        </td></tr>
        ${lang.subtitle ? `<tr><td style="padding-bottom:16px;"><p style="margin:0;color:#A0A0A8;font-size:16px;line-height:1.5;">${lang.subtitle}</p></td></tr>` : ""}
        <tr><td style="padding-bottom:32px;">
          <p style="margin:0;color:#6B6B74;font-size:15px;line-height:1.7;">${excerpt}</p>
        </td></tr>
        <tr><td style="padding-bottom:40px;">
          <a href="${articleUrl}" style="display:inline-block;background-color:#C4A882;color:#0C0C0E;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:500;letter-spacing:0.01em;">${t.cta}</a>
        </td></tr>
        <tr><td style="border-top:1px solid #1E1E23;padding-top:24px;">
          <a href="${unsubscribeUrl}" style="color:#45454D;font-size:12px;text-decoration:underline;">${t.unsubscribe}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
