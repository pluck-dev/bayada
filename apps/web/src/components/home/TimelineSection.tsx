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
    <section className="overflow-hidden bg-[color:var(--surface)] py-[var(--section-gap)]">
      <Container>
        <FadeIn>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]">
              History
            </p>
            <h2 className="mt-4 text-3xl font-bold text-[color:var(--fg)] sm:text-4xl">
              50년의 여정
            </h2>
            <p className="mt-4 text-[color:var(--muted)]">
              1975년 설립부터 글로벌 홈헬스케어 리더로의 성장
            </p>
          </div>
        </FadeIn>
      </Container>

      {/* 가로 스크롤 타임라인 (데스크톱) */}
      <div className="mt-12 hidden md:block" ref={ref}>
        <div className="overflow-x-auto pb-6">
          <div className="mx-auto flex min-w-max items-start gap-0 px-8">
            {timelineEvents.map((event, i) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative flex w-48 shrink-0 flex-col items-center"
              >
                {/* 연결선 */}
                {i < timelineEvents.length - 1 && (
                  <div className="absolute left-1/2 top-[18px] h-[2px] w-full bg-[color:var(--border)]" />
                )}
                {/* 점 */}
                <div
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                    event.highlight
                      ? "border-[#ce0e2d] bg-[#ce0e2d]"
                      : "border-[color:var(--border)] bg-white"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      event.highlight ? "text-white" : "text-[color:var(--muted)]"
                    }`}
                  >
                    {String(event.year).slice(-2)}
                  </span>
                </div>
                {/* 내용 */}
                <div className="mt-4 px-3 text-center">
                  <p className="text-sm font-bold text-[color:var(--fg)]">
                    {event.year}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[color:var(--fg)]">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[color:var(--muted)]">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 세로 타임라인 (모바일) */}
      <div className="mt-12 md:hidden">
        <Container>
          <div className="relative border-l-2 border-[color:var(--border)] pl-6">
            {timelineEvents.map((event, i) => (
              <FadeIn key={event.year} delay={i * 0.05}>
                <div className="relative mb-8 last:mb-0">
                  {/* 점 */}
                  <div
                    className={`absolute -left-[31px] h-4 w-4 rounded-full border-2 ${
                      event.highlight
                        ? "border-[#ce0e2d] bg-[#ce0e2d]"
                        : "border-[color:var(--border)] bg-white"
                    }`}
                  />
                  <p className="text-sm font-bold text-[#ce0e2d]">{event.year}</p>
                  <p className="mt-1 text-sm font-semibold text-[color:var(--fg)]">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[color:var(--muted)]">
                    {event.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
