import type { Locale } from "./config";
import { i18nConfig } from "./config";

// 딕셔너리 타입 (ko.json 기준)
import type ko from "./dictionaries/ko.json";
export type Dictionary = typeof ko;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ko: () => import("./dictionaries/ko.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  ja: () => import("./dictionaries/ja.json").then((m) => m.default),
  zh: () => import("./dictionaries/zh.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale] ?? dictionaries[i18nConfig.defaultLocale];
  return loader();
}
