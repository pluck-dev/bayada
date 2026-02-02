"use client";

import { usePathname } from "next/navigation";
import { i18nConfig } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { useDictionary } from "./DictionaryProvider";

const localeLabels: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const dict = useDictionary();

  // 현재 로케일 추출
  const currentLocale = i18nConfig.locales.find(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  ) ?? i18nConfig.defaultLocale;

  // 로케일 변경 시 URL 경로 생성
  function getLocalePath(locale: Locale) {
    // 현재 경로에서 로케일 부분 제거
    const segments = pathname.split("/");
    if (i18nConfig.locales.includes(segments[1] as Locale)) {
      segments[1] = locale;
    } else {
      segments.splice(1, 0, locale);
    }
    return segments.join("/") || "/";
  }

  return (
    <div className="flex items-center gap-1">
      {i18nConfig.locales.map((locale) => (
        <a
          key={locale}
          href={getLocalePath(locale)}
          className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
            locale === currentLocale
              ? "bg-[#ce0e2d] text-white"
              : "text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]"
          }`}
        >
          {localeLabels[locale]}
        </a>
      ))}
    </div>
  );
}
