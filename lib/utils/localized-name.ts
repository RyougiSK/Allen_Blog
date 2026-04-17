import type { ContentLocale } from "@/lib/types";

export function getLocalizedName(
  item: { name: string; name_zh?: string },
  locale: ContentLocale,
): string {
  if (locale === "zh" && item.name_zh) return item.name_zh;
  return item.name;
}
