"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { mainNavigation, getLabel, getTitle } from "@/data/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface MobileMenuProps {
  locale: string;
  onClose: () => void;
}

export function MobileMenu({ locale, onClose }: MobileMenuProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  function toggleSection(label: string) {
    setOpenSection((prev) => (prev === label ? null : label));
  }

  return (
    <div className="border-t border-[color:var(--border)] bg-white lg:hidden">
      <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        {mainNavigation.map((item) => (
          <div key={item.label} className="border-b border-[color:var(--border)] last:border-b-0">
            {item.children ? (
              <>
                <button
                  className="flex w-full items-center justify-between px-2 py-3 text-sm font-medium text-[color:var(--fg)]"
                  onClick={() => toggleSection(item.label)}
                >
                  <span>{getLabel(item, locale)}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      openSection === item.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSection === item.label && (
                  <div className="pb-3 pl-2">
                    {item.children.map((group) => (
                      <div key={group.title} className="mb-3">
                        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                          {getTitle(group, locale)}
                        </p>
                        {group.items.map((link) => (
                          <Link
                            key={link.href}
                            href={`/${locale}${link.href}`}
                            className="block rounded-lg px-4 py-2 text-sm text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)]"
                            onClick={onClose}
                          >
                            {getLabel(link, locale)}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={`/${locale}${item.href}`}
                className="block px-2 py-3 text-sm font-medium text-[color:var(--fg)] transition-colors hover:text-[#ce0e2d]"
                onClick={onClose}
              >
                {getLabel(item, locale)}
              </Link>
            )}
          </div>
        ))}

        {/* 언어 선택 */}
        <div className="mt-4 border-t border-[color:var(--border)] pt-4">
          <LanguageSwitcher />
        </div>

        {/* CTA */}
        <div className="mt-4 flex flex-col gap-3 pt-2">
          <Link
            href={`/${locale}/membership`}
            className="block rounded-xl bg-[#ce0e2d] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#b00c27]"
            onClick={onClose}
          >
            {{ ko: "시작하기", ja: "始める", zh: "开始" }[locale] ?? "Get Started"}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="block rounded-xl border border-[color:var(--border)] px-4 py-3 text-center text-sm font-medium text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)]"
            onClick={onClose}
          >
            {{ ko: "로그인", ja: "ログイン", zh: "登录" }[locale] ?? "Login"}
          </Link>
        </div>
      </nav>
    </div>
  );
}
