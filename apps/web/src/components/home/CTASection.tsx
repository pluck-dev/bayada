"use client";

import Link from "next/link";
import { Phone, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@bayada/ui";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { Container } from "@/components/layout/Container";
import type { Dictionary } from "@bayada/shared/i18n";

interface CTASectionProps {
  dict: Dictionary;
  locale: string;
}

export function CTASection({ dict, locale }: CTASectionProps) {
  const t = dict.web.home;

  const contactMethods = [
    {
      icon: Phone,
      label: t.ctaCalling,
      value: "1670-1379",
      href: "tel:1670-1379",
    },
    {
      icon: MessageCircle,
      label: t.ctaOnline,
      value: dict.web.common.freeConsult,
      href: `/${locale}/consultation`,
      isLink: true,
    },
    {
      icon: MapPin,
      label: t.ctaVisit,
      value: "서울 강남구",
      href: `/${locale}/center`,
      isLink: true,
    },
  ];

  return (
    <SectionWrapper className="bg-white">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ce0e2d] via-[#a80b24] to-[#7a0819] px-8 py-16 text-center sm:px-16 lg:py-24">
          {/* 장식 */}
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5" />

          <div className="relative">
            <h2 className="text-display-md font-bold text-white">
              {t.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-white/80">
              {t.ctaDescription}
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a href="tel:1670-1379">
                <Button size="lg" className="bg-white text-[#ce0e2d] hover:bg-white/90">
                  <Phone className="mr-2 h-5 w-5" />
                  1670-1379
                </Button>
              </a>
              <Link href={`/${locale}/consultation`}>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  {dict.web.common.freeConsult}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 연락 방법 카드 */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {contactMethods.map((method) => {
            const Wrapper = method.isLink ? Link : "a";
            return (
              <Wrapper
                key={method.label}
                href={method.href}
                className="flex items-center gap-4 rounded-xl border border-[color:var(--border)] bg-white p-5 transition-all hover:shadow-[var(--shadow-medium)] hover:border-transparent"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fae6ea]">
                  <method.icon className="h-6 w-6 text-[#ce0e2d]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--fg)]">{method.label}</p>
                  <p className="text-sm text-[color:var(--muted)]">{method.value}</p>
                </div>
              </Wrapper>
            );
          })}
        </div>
      </Container>
    </SectionWrapper>
  );
}
