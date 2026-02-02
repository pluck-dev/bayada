"use client";

import { usePathname, useRouter } from "next/navigation";
import { i18nConfig, type Locale } from "@bayada/shared";
import { useDictionary } from "./DictionaryProvider";

const localeLabels: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const dict = useDictionary();

  // 현재 locale 추출
  const currentLocale =
    (i18nConfig.locales.find((locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    ) as Locale) ?? i18nConfig.defaultLocale;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as Locale;
    // 현재 경로에서 locale 부분만 교체
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "") || "/";
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      className="rounded-lg border border-[color:var(--border)] bg-white px-2 py-1.5 text-sm text-[color:var(--fg)] outline-none hover:bg-[color:var(--surface)] focus:ring-2 focus:ring-[#ce0e2d]/20"
      title={dict.common.language}
    >
      {i18nConfig.locales.map((locale) => (
        <option key={locale} value={locale}>
          {localeLabels[locale]}
        </option>
      ))}
    </select>
  );
}
