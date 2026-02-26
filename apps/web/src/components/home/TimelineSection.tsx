"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { FadeIn } from "@/components/animations/FadeIn";
import { timelineEvents } from "@/data/timeline";

export function TimelineSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="overflow-hidden bg-white py-16 lg:py-20">
      <Container>
        <FadeIn>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#ce0e2d]">
              History
            </p>
            <h2 className="mt-4 text-3xl font-bold text-black/[0.87] sm:text-4xl">
              50년의 여정
            </h2>
            <p className="mt-4 text-base text-black/60">
              1975년 설립부터 글로벌 홈헬스케어 리더로의 성장
            </p>
          </div>
        </FadeIn>
      </Container>

      {/* 가로 스크롤 타임라인 (데스크톱) */}
      <div className="mt-12 hidden md:block" ref={ref}>
        <div className="overflow-x-auto pb-8">
          <div className="mx-auto flex min-w-max items-start gap-2 px-8">
            {timelineEvents.map((event, i) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative flex w-52 shrink-0 flex-col items-center"
              >
                {/* 연결선 */}
                {i < timelineEvents.length - 1 && (
                  <div className="absolute left-1/2 top-[20px] h-[1px] w-full bg-[#dfe6eb]" />
                )}
                {/* 점 */}
                <div
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-transform ${
                    event.highlight
                      ? "scale-110 border-[#ce0e2d] bg-[#ce0e2d] shadow-md shadow-[#ce0e2d]/30"
                      : "border-[#dfe6eb] bg-white shadow-sm"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      event.highlight ? "text-white" : "text-black/60"
                    }`}
                  >
                    {String(event.year).slice(-2)}
                  </span>
                </div>
                {/* 내용 카드 */}
                <div className="mt-4 w-full px-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm text-center">
                    <p
                      className={`text-sm font-bold ${
                        event.highlight ? "text-[#ce0e2d]" : "text-black/[0.87]"
                      }`}
                    >
                      {event.year}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-black/[0.87]">
                      {event.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-black/60">
                      {event.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 세로 타임라인 (모바일) */}
      <div className="mt-12 md:hidden">
        <Container>
          <div className="relative border-l border-[#dfe6eb] pl-6">
            {timelineEvents.map((event, i) => (
              <FadeIn key={event.year} delay={i * 0.05}>
                <div className="relative mb-4 last:mb-0">
                  {/* 점 */}
                  <div
                    className={`absolute -left-[25px] h-4 w-4 rounded-full border-2 ${
                      event.highlight
                        ? "border-[#ce0e2d] bg-[#ce0e2d]"
                        : "border-[#dfe6eb] bg-white"
                    }`}
                  />
                  {/* 내용 카드 */}
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <p
                      className={`text-sm font-bold ${
                        event.highlight ? "text-[#ce0e2d]" : "text-black/[0.87]"
                      }`}
                    >
                      {event.year}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-black/[0.87]">
                      {event.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-black/60">
                      {event.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
