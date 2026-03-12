"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import createGlobe from "cobe";

interface CountryInfo {
  name: string;
  nameKo: string;
  coordinates: [number, number]; // [lat, lng]
  description: string;
  details: string[];
  flag: string;
}

const BAYADA_COUNTRIES: CountryInfo[] = [
  {
    name: "United States",
    nameKo: "미국",
    coordinates: [39, -98],
    description: "1975년 설립, BAYADA 본사 소재지",
    details: [
      "360+ 사무소 운영",
      "33,000+ 전문 인력",
      "미국 최대 비영리 홈헬스케어",
    ],
    flag: "🇺🇸",
  },
  {
    name: "Canada",
    nameKo: "캐나다",
    coordinates: [56, -106],
    description: "북미 홈헬스케어 네트워크",
    details: ["북미 서비스 확장", "캐나다 전역 케어 네트워크"],
    flag: "🇨🇦",
  },
  {
    name: "Ireland",
    nameKo: "아일랜드",
    coordinates: [53.3, -8],
    description: "유럽 홈헬스케어 서비스 거점",
    details: ["아일랜드 전역 서비스", "유럽 확장 거점"],
    flag: "🇮🇪",
  },
  {
    name: "Germany",
    nameKo: "독일",
    coordinates: [51.2, 10.4],
    description: "유럽 최대 시장 진출",
    details: ["독일 홈케어 시장 진출", "Pflegehörnchen 파트너십"],
    flag: "🇩🇪",
  },
  {
    name: "India",
    nameKo: "인도",
    coordinates: [21, 78.9],
    description: "아시아 홈케어 서비스 제공",
    details: ["인도 전역 가정 방문 간호", "고령 돌봄 서비스"],
    flag: "🇮🇳",
  },
  {
    name: "South Korea",
    nameKo: "한국",
    coordinates: [36, 127.8],
    description: "방문간호 · 방문요양 서비스 운영 중",
    details: [
      "2023년 한국 법인 설립",
      "방문간호 · 방문요양 정식 런칭",
      "노인장기요양보험 지정기관",
    ],
    flag: "🇰🇷",
  },
  {
    name: "Japan",
    nameKo: "일본",
    coordinates: [36.2, 138.3],
    description: "아시아태평양 네트워크 확장",
    details: ["일본 홈케어 시장 진출", "JAPAC 지역 거점"],
    flag: "🇯🇵",
  },
  {
    name: "Australia",
    nameKo: "호주",
    coordinates: [-25, 134],
    description: "오세아니아 홈헬스케어 파트너십",
    details: ["호주 홈케어 파트너십", "시니어 돌봄 네트워크"],
    flag: "🇦🇺",
  },
  {
    name: "New Zealand",
    nameKo: "뉴질랜드",
    coordinates: [-41, 174],
    description: "시니어 홈케어 서비스 제공",
    details: ["Healthscope 파트너십", "시니어 홈케어 서비스"],
    flag: "🇳🇿",
  },
];

/* 위경도 → cobe가 사용하는 라디안 변환 */
function locationToAngles(lat: number, lng: number): [number, number] {
  return [
    (Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2)) % (Math.PI * 2),
    (lat * Math.PI) / 180,
  ];
}

export function ServiceAreaMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.3);
  const widthRef = useRef(0);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const focusRef = useRef<[number, number] | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(
    null
  );

  const handleSelectCountry = useCallback((country: CountryInfo) => {
    setSelectedCountry((prev) =>
      prev?.name === country.name ? null : country
    );
    const [phi, theta] = locationToAngles(
      country.coordinates[0],
      country.coordinates[1]
    );
    focusRef.current = [phi, theta];
  }, []);

  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      if (canvas) {
        widthRef.current = canvas.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      phi: 0,
      theta: 0.3,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 24000,
      mapBrightness: 1.2,
      baseColor: [0.92, 0.95, 0.97], // #eaf2f8 느낌의 밝은 톤
      markerColor: [0.81, 0.06, 0.18], // #CE0E2D
      glowColor: [0.88, 0.91, 0.94],
      markers: BAYADA_COUNTRIES.map((c) => ({
        location: [c.coordinates[0], c.coordinates[1]] as [number, number],
        size: 0.07,
      })),
      onRender: (state) => {
        // 포커스된 국가로 부드럽게 회전
        if (focusRef.current && pointerInteracting.current === null) {
          const [focusPhi, focusTheta] = focusRef.current;
          const distPhi = focusPhi - phiRef.current;
          const distTheta = focusTheta - thetaRef.current;
          phiRef.current += distPhi * 0.08;
          thetaRef.current += distTheta * 0.08;
        } else if (pointerInteracting.current === null) {
          // 자동 회전
          phiRef.current += 0.003;
        }

        state.phi = phiRef.current;
        state.theta = thetaRef.current;
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
      },
    });

    globeRef.current = globe;

    // 드래그 인터랙션
    const onPointerDown = (e: PointerEvent) => {
      pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
      canvas.style.cursor = "grabbing";
    };
    const onPointerUp = () => {
      pointerInteracting.current = null;
      canvas.style.cursor = "grab";
    };
    const onPointerOut = () => {
      pointerInteracting.current = null;
      canvas.style.cursor = "grab";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        const delta = e.clientX - pointerInteracting.current;
        pointerInteractionMovement.current = delta;
        phiRef.current += delta * 0.003;
        pointerInteracting.current = e.clientX;
        focusRef.current = null; // 수동 조작 시 포커스 해제
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerout", onPointerOut);
    canvas.addEventListener("pointermove", onPointerMove);

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerout", onPointerOut);
      canvas.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <section className="bg-[var(--bayada-surface)] py-16 px-4 sm:px-6 lg:px-12 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* 헤더 */}
        <h2 className="text-3xl font-bold text-center text-[var(--bayada-text)] sm:text-4xl lg:text-[2.75rem] leading-tight">
          우리가 &lsquo;집&rsquo;이라 부르는
          <br />
          전세계 지역사회에서 전문적인 돌봄을 제공합니다
        </h2>
        <p className="mt-5 text-center text-base text-[var(--bayada-muted)] max-w-2xl mx-auto">
          세계 최대 비영리 홈헬스케어 기업으로서, 모든 사람이 집에서 안전하고
          건강한 삶을 누릴 수 있도록 전문적인 돌봄을 제공합니다.
        </p>

        {/* 국가 태그 */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {BAYADA_COUNTRIES.map((country) => {
            const isActive = selectedCountry?.name === country.name;
            return (
              <button
                key={country.name}
                type="button"
                onClick={() => handleSelectCountry(country)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "border-[var(--bayada-red)] bg-[var(--bayada-red)] text-white shadow-md"
                    : "border-gray-300 bg-white text-[var(--bayada-text)] hover:border-[var(--bayada-red)] hover:text-[var(--bayada-red)]"
                }`}
              >
                {country.flag} {country.nameKo}
              </button>
            );
          })}
        </div>

        {/* 지구본 + 상세 패널 */}
        <div className="mt-12 flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
          {/* 3D 지구본 */}
          <div className="relative w-full max-w-[420px] lg:max-w-[480px] flex-shrink-0 aspect-square">
            <canvas
              ref={canvasRef}
              className="h-full w-full cursor-grab"
              style={{
                contain: "layout paint size",
                width: "100%",
                height: "100%",
              }}
            />
          </div>

          {/* 우측 상세 패널 */}
          <div className="w-full lg:flex-1 min-h-[320px] flex items-center">
            <AnimatePresence mode="wait">
              {selectedCountry ? (
                <motion.div
                  key={selectedCountry.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="w-full rounded-2xl bg-white p-8 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedCountry.flag}</span>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--bayada-text)]">
                        {selectedCountry.nameKo}
                      </h3>
                      <p className="text-sm text-[var(--bayada-muted)]">
                        {selectedCountry.name}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-base leading-relaxed text-[var(--bayada-muted)]">
                    {selectedCountry.description}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {selectedCountry.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-start gap-2.5 text-sm text-[var(--bayada-text)]"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--bayada-red)]" />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {selectedCountry.nameKo === "한국" && (
                    <a
                      href="/ko/about"
                      className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-[var(--bayada-red)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--bayada-red-hover)] transition-colors"
                    >
                      자세히 보기
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center"
                >
                  <div className="text-5xl mb-4">🌏</div>
                  <p className="text-lg font-semibold text-[var(--bayada-text)]">
                    국가를 선택해 주세요
                  </p>
                  <p className="mt-2 text-sm text-[var(--bayada-muted)]">
                    지구본의 마커 또는 상단 국가 태그를 클릭하면
                    <br />
                    해당 국가의 상세 정보를 확인할 수 있습니다.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 하단 통계 */}
        <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { stat: "9개국", label: "운영 국가" },
            { stat: "360+", label: "전 세계 사무소" },
            { stat: "33,000+", label: "전문 인력" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-2xl font-extrabold text-[var(--bayada-red)] sm:text-3xl">
                {item.stat}
              </p>
              <p className="mt-1 text-xs text-[var(--bayada-muted)] sm:text-sm">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
