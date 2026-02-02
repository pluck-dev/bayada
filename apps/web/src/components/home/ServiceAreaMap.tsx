"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { FadeIn } from "@/components/animations/FadeIn";

interface Region {
  id: string;
  name: string;
  nameKo: string;
  offices: string;
  employees: string;
  detail: string;
  // SVG 위치 (%)
  cx: number;
  cy: number;
}

const regions: Region[] = [
  {
    id: "us",
    name: "United States",
    nameKo: "미국",
    offices: "360+",
    employees: "33,000+",
    detail: "1975년 설립, 홈헬스케어 업계 리더",
    cx: 22,
    cy: 40,
  },
  {
    id: "korea",
    name: "South Korea",
    nameKo: "한국",
    offices: "1",
    employees: "50+",
    detail: "2023년 진출, 아시아 허브",
    cx: 78,
    cy: 38,
  },
  {
    id: "india",
    name: "India",
    nameKo: "인도",
    offices: "10+",
    employees: "500+",
    detail: "2015년 진출, 남아시아 시장",
    cx: 67,
    cy: 48,
  },
  {
    id: "japan",
    name: "Japan",
    nameKo: "일본 (예정)",
    offices: "-",
    employees: "-",
    detail: "진출 예정 시장",
    cx: 83,
    cy: 36,
  },
];

export function ServiceAreaMap() {
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);

  return (
    <section className="py-[var(--section-gap)] bg-white">
      <Container>
        <FadeIn>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ce0e2d]">
              Global Presence
            </p>
            <h2 className="mt-4 text-3xl font-bold text-[color:var(--fg)] sm:text-4xl">
              글로벌 서비스 네트워크
            </h2>
            <p className="mt-4 text-[color:var(--muted)]">
              미국을 중심으로 전 세계로 확장하는 홈헬스케어 서비스
            </p>
          </div>
        </FadeIn>

        {/* 지도 영역 */}
        <FadeIn delay={0.2}>
          <div className="relative mt-12 overflow-hidden rounded-2xl bg-[color:var(--surface)] p-8">
            {/* 간소화된 세계 지도 (도트 기반) */}
            <div className="relative mx-auto aspect-[2/1] max-w-4xl">
              {/* 배경 도트 패턴 */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(circle, var(--muted) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* 지역 핀 */}
              {regions.map((region) => (
                <button
                  key={region.id}
                  onMouseEnter={() => setActiveRegion(region)}
                  onMouseLeave={() => setActiveRegion(null)}
                  onClick={() => setActiveRegion(activeRegion?.id === region.id ? null : region)}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${region.cx}%`, top: `${region.cy}%` }}
                >
                  {/* 펄스 애니메이션 */}
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#ce0e2d]/30" />
                  <span
                    className={`relative flex h-5 w-5 items-center justify-center rounded-full transition-transform ${
                      region.id === "japan"
                        ? "bg-gray-400"
                        : "bg-[#ce0e2d] hover:scale-125"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </span>
                </button>
              ))}

              {/* 툴팁 */}
              <AnimatePresence>
                {activeRegion && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute z-20 -translate-x-1/2 rounded-xl bg-white p-4 shadow-lg"
                    style={{
                      left: `${activeRegion.cx}%`,
                      top: `${activeRegion.cy - 18}%`,
                    }}
                  >
                    <p className="text-sm font-bold text-[color:var(--fg)]">
                      {activeRegion.name}
                    </p>
                    <p className="text-xs text-[color:var(--muted)]">
                      {activeRegion.nameKo}
                    </p>
                    <div className="mt-2 flex gap-4 text-xs">
                      <div>
                        <span className="text-[color:var(--muted)]">사무소 </span>
                        <span className="font-bold text-[color:var(--fg)]">
                          {activeRegion.offices}
                        </span>
                      </div>
                      <div>
                        <span className="text-[color:var(--muted)]">인력 </span>
                        <span className="font-bold text-[color:var(--fg)]">
                          {activeRegion.employees}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">
                      {activeRegion.detail}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </FadeIn>

        {/* 하단 요약 카드 */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {regions.map((region) => (
            <FadeIn key={region.id} delay={0.1}>
              <div
                className={`rounded-xl border p-4 text-center transition-colors ${
                  region.id === "japan"
                    ? "border-dashed border-[color:var(--border)]"
                    : "border-[color:var(--border)]"
                }`}
              >
                <p className="text-xs font-semibold text-[#ce0e2d]">{region.name}</p>
                <p className="text-xs text-[color:var(--muted)]">{region.nameKo}</p>
                <p className="mt-2 text-lg font-bold text-[color:var(--fg)]">
                  {region.offices}
                </p>
                <p className="text-xs text-[color:var(--muted)]">
                  {region.id === "japan" ? "예정" : "사무소"}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
