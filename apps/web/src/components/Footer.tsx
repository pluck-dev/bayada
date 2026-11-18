"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import type { Dictionary } from "@bayada/shared/i18n";
import { footerNavigation, getLabel, getTitle } from "@/data/navigation";
import { WEB_SNS_LABEL } from "@bayada/shared/web-content";
import type { SiteInfo } from "@/types";

interface FooterProps {
  dict: Dictionary;
  services: import("@bayada/shared/web-services").ServiceData[];
  locale: string;
  /** 사이트 정보 (어드민 웹사이트 > 사이트 정보, 서버에서 읽어 넘긴다) */
  company: SiteInfo;
}

const SNS_ICONS = [
  { key: "instagram", icon: Instagram },
  { key: "facebook", icon: Facebook },
  { key: "linkedin", icon: Linkedin },
  { key: "youtube", icon: Youtube },
] as const;

export function Footer({ dict, locale, company, services }: FooterProps) {
  const socialLinks = SNS_ICONS.map(({ key, icon }) => ({
    icon,
    href: company.sns[key],
    label: WEB_SNS_LABEL[key],
    external: /^https?:/i.test(company.sns[key]),
  }));
  const sections = [
    { ...footerNavigation.services, links: services.map((service) => ({ label: service.nameEn, labels: { ko: service.nameKo }, href: service.href })) },
    footerNavigation.company,
    footerNavigation.resources,
  ];

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* 회사 정보 */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="inline-block">
              <Image
                src="/images/brand/logo.png"
                alt="BAYADA"
                width={120}
                height={36}
                className="h-8 w-auto"
              />
            </Link>
            <div className="mt-6 flex flex-col gap-2.5 text-sm text-black/60">
              <p>{company.legalName}</p>
              <p>대표: {company.ceo} | 사업자등록번호: {company.businessRegistrationNo}</p>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                {company.headquarters}
              </span>
              <a
                href={`tel:${company.serviceHotline}`}
                className="flex items-center gap-2 transition-colors hover:text-[#ce0e2d]"
              >
                <Phone className="h-4 w-4" />
                {company.serviceHotline}
              </a>
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-2 transition-colors hover:text-[#ce0e2d]"
              >
                <Mail className="h-4 w-4" />
                {company.email}
              </a>
            </div>

            {/* 소셜 미디어 */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label, external }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-black/60 transition-colors duration-300 hover:bg-[#ce0e2d] hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {company.footerNote && <div className="mt-4 text-xs text-black/40">{company.footerNote}</div>}
          </div>

          {/* 4컬럼 링크 */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-black/[0.87]">
                {getTitle(section, locale)}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={`/${locale}${link.href}`}
                      className="text-sm text-black/60 transition-colors hover:text-black"
                    >
                      {getLabel(link, locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 하단 법적 링크 */}
        <div className="mt-12 border-t border-gray-100 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-wrap gap-4 text-xs text-black/40">
              {footerNavigation.legal.map((link, i) => (
                <span key={link.href} className="flex items-center gap-4">
                  {i > 0 && <span className="text-gray-200">|</span>}
                  <Link
                    href={`/${locale}${link.href}`}
                    className="transition-colors hover:text-black/70"
                  >
                    {getLabel(link, locale)}
                  </Link>
                </span>
              ))}
            </div>
            <p className="text-xs text-black/40">
              &copy; {new Date().getFullYear()} {company.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
