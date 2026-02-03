"use client";

import { usePathname } from "next/navigation";
import { i18nConfig, type Locale } from "@bayada/shared/i18n";
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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLocale = (i18nConfig.locales.find(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  ) ?? i18nConfig.defaultLocale) as Locale;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(newLocale: Locale) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    window.location.href = segments.join("/");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-[color:var(--border)] px-3 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition-colors hover:border-[color:var(--fg)]/20 hover:text-[color:var(--fg)]"
        aria-label="언어 선택"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{localeLabels[currentLocale]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[140px] overflow-hidden rounded-xl border border-[color:var(--border)] bg-white py-1 shadow-lg">
          {i18nConfig.locales.map((locale) => (
            <button
              key={locale}
              onClick={() => {
                switchLocale(locale);
                setOpen(false);
              }}
              className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-[color:var(--surface)] ${
                locale === currentLocale
                  ? "font-semibold text-[#ce0e2d]"
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
