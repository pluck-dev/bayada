"use client";
import type { WEB_PAGE_DEFAULTS } from "@bayada/shared/web-page-content";

import { CountUp } from "@/components/animations/CountUp";
import { Container } from "@/components/layout/Container";
import { FadeIn } from "@/components/animations/FadeIn";

export function KeyNumbers({ numbers }: { numbers: typeof WEB_PAGE_DEFAULTS.home.numbers }) {
  if (!numbers.length) return null;
  return (
    <section className="border-y border-gray-200 bg-[#f0f4f7] py-16">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {numbers.map((num, i) => (
            <FadeIn key={num.label} delay={i * 0.1}>
              <div
                className={`px-6 py-8 text-center lg:border-r lg:border-gray-200 lg:last:border-r-0`}
              >
                <p className="text-4xl font-bold text-[#ce0e2d] sm:text-5xl lg:text-6xl">
                  <CountUp end={num.value} suffix={num.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium text-black/[0.87]">
                  {num.label}
                </p>
                <p className="text-xs text-black/60">{num.labelKo}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
