"use client";

import { CountUp } from "@/components/animations/CountUp";
import { Container } from "@/components/layout/Container";
import { FadeIn } from "@/components/animations/FadeIn";

const numbers = [
  { value: 50, suffix: "+", label: "Years of Excellence", labelKo: "년 역사" },
  { value: 33000, suffix: "+", label: "Healthcare Professionals", labelKo: "명 전문 인력" },
  { value: 360, suffix: "+", label: "Service Offices", labelKo: "개 사무소" },
  { value: 24, suffix: "/7", label: "Care Available", labelKo: "시간 케어" },
];

export function KeyNumbers() {
  return (
    <section className="bg-[#ce0e2d] py-20">
      <Container>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {numbers.map((num, i) => (
            <FadeIn key={num.label} delay={i * 0.1}>
              <div className="text-center">
                <p className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                  <CountUp end={num.value} suffix={num.suffix} />
                </p>
                <p className="mt-2 text-sm font-semibold text-white/90">
                  {num.label}
                </p>
                <p className="text-xs text-white/60">{num.labelKo}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
