"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { useDictionary } from "./DictionaryProvider";

export function Footer() {
  const dict = useDictionary();

  const footerLinks = {
    services: {
      title: dict.web.services,
      links: [
        { label: dict.web.visitingNurse, href: "#" },
        { label: dict.web.homeCare, href: "#" },
        { label: dict.web.education, href: "#" },
      ],
    },
    company: {
      title: dict.web.aboutTitle,
      links: [
        { label: dict.web.aboutTitle, href: "#about" },
        { label: dict.web.learnMore, href: "#" },
      ],
    },
    support: {
      title: dict.web.ctaButton,
      links: [
        { label: dict.web.ctaButton, href: "#contact" },
        { label: dict.web.learnMore, href: "#" },
      ],
    },
  };

  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* 회사 정보 */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ce0e2d]">
                <span className="text-lg font-bold text-white">B</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#ce0e2d]">
                BAYADA
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[color:var(--muted)]">
              {dict.web.aboutDescription}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="tel:1588-0000"
                className="flex items-center gap-2 text-sm text-[color:var(--muted)] transition-colors hover:text-[#ce0e2d]"
              >
                <Phone className="h-4 w-4" />
                1588-0000
              </a>
              <a
                href="mailto:info@bayada.co.kr"
                className="flex items-center gap-2 text-sm text-[color:var(--muted)] transition-colors hover:text-[#ce0e2d]"
              >
                <Mail className="h-4 w-4" />
                info@bayada.co.kr
              </a>
              <span className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                <MapPin className="h-4 w-4 shrink-0" />
                Seoul, Korea
              </span>
            </div>
          </div>

          {/* 링크 섹션 */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-[color:var(--fg)]">
                {section.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[color:var(--muted)] transition-colors hover:text-[#ce0e2d]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 하단 저작권 */}
        <div className="mt-12 border-t border-[color:var(--border)] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-[color:var(--muted)]">
              &copy; {new Date().getFullYear()} {dict.web.footer}. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
