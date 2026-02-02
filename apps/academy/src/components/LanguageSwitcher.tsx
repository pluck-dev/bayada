"use client";

import { usePathname } from "next/navigation";
import { i18nConfig, type Locale } from "@bayada/shared/i18n";
import { useDictionary } from "./DictionaryProvider";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const localeLabels: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const dict = useDictionary();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 현재 로케일 추출
  const currentLocale = (i18nConfig.locales.find((locale) =>
    pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  ) ?? i18nConfig.defaultLocale) as Locale;

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 로케일 변경 시 URL의 로케일 부분만 교체
  function switchLocale(newLocale: Locale) {
    const segments = pathname.split("/");
    // segments[0]은 빈 문자열, segments[1]이 현재 로케일
    segments[1] = newLocale;
    window.location.href = segments.join("/");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[color:var(--muted)] transition-colors hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]"
        aria-label={dict.common.language}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{localeLabels[currentLocale]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-[color:var(--border)] bg-white shadow-lg">
          {i18nConfig.locales.map((locale) => (
            <button
              key={locale}
              onClick={() => {
                switchLocale(locale);
                setOpen(false);
              }}
              className={`flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-[color:var(--surface)] ${
                locale === currentLocale
                  ? "font-semibold text-[color:var(--brand)]"
                  : "text-[color:var(--fg)]"
              }`}
            >
              {localeLabels[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
