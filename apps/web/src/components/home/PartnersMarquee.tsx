"use client";

import Image from "next/image";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { Container } from "@/components/layout/Container";
import type { Dictionary } from "@bayada/shared/i18n";

interface Partner {
  name: string;
  image: string;
}

interface PartnersMarqueeProps {
  dict: Dictionary;
  partners: Partner[];
}

export function PartnersMarquee({ dict, partners }: PartnersMarqueeProps) {
  const t = dict.web.home;

  return (
    <SectionWrapper className="overflow-hidden bg-white py-[var(--section-gap-sm)]">
      <Container>
        <div className="text-center">
          <h2 className="text-display-lg font-bold text-[color:var(--fg)]">
            {t.partnersTitle}
          </h2>
          <p className="mt-4 text-body-lg text-[color:var(--muted)]">
            {t.partnersSubtitle}
          </p>
        </div>
      </Container>

      {/* 마키 슬라이드 */}
      <div className="relative mt-12 overflow-hidden">
        <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
          {[...partners, ...partners].map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex h-16 w-32 shrink-0 items-center justify-center grayscale opacity-60 transition-all hover:grayscale-0 hover:opacity-100"
            >
              <Image
                src={partner.image}
                alt={partner.name}
                width={128}
                height={64}
                className="h-auto max-h-12 w-auto max-w-[120px] object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
