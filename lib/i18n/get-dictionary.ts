import { cache } from "react";
import type { Locale, Dictionary } from "./types";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  "zh-cn": () => import("./dictionaries/zh-cn.json").then((m) => m.default),
};

export const getDictionary = cache(
  async (locale: Locale): Promise<Dictionary> => {
    return dictionaries[locale]();
  },
);
