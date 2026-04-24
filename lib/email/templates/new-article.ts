import { SITE } from "@/lib/constants";
import { baseLayout } from "./base-layout";
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
  },
  zh: {
    subjectPrefix: "新文章：",
    cta: "阅读文章",
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
  const preheaderText = lang.excerpt.length > 80 ? lang.excerpt.slice(0, 80) + "..." : lang.excerpt;

  const coverImageHtml = article.cover_image
    ? `<img src="${article.cover_image}" alt="" width="480" style="width:100%;height:auto;display:block;border-radius:8px 8px 0 0;" />`
    : "";

  const subtitleHtml = lang.subtitle
    ? `<p style="margin:0 0 12px;color:#A0A0A8;font-size:15px;line-height:1.5;">${lang.subtitle}</p>`
    : "";

  const inner = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #2a2a35;border-radius:8px;overflow:hidden;mso-table-lspace:0pt;mso-table-rspace:0pt;">
      ${coverImageHtml ? `<tr><td>${coverImageHtml}</td></tr>` : ""}
      <tr><td style="padding:24px;">
        <h1 style="margin:0 0 8px;color:#EDEDEF;font-size:22px;font-weight:400;line-height:1.3;">${lang.title}</h1>
        ${subtitleHtml}
        <p style="margin:0;color:#7a7a88;font-size:14px;line-height:1.7;">${excerpt}</p>
      </td></tr>
    </table>
    <div style="padding-top:28px;">
      <a href="${articleUrl}" style="display:inline-block;background-color:#C4A882;color:#0B0D0F;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:500;letter-spacing:0.02em;">${t.cta}</a>
    </div>`;

  return baseLayout({
    locale,
    content: inner,
    preheader: preheaderText,
    showUnsubscribe: true,
    unsubscribeUrl,
  });
}
