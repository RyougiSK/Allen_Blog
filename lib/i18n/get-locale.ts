import { cookies } from "next/headers";
import type { Locale } from "./types";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value;
  return locale === "zh-cn" ? "zh-cn" : "en";
}
