"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const TOPO_URL = "/data/korea-provinces-topo-detail.json";

type ServiceLevel = "active" | "expanding" | "planned" | "none";

interface ServiceRegion {
  code: string; // 시도 코드
  name: string;
  serviceLevel: ServiceLevel;
  details?: string;
}

/*
 * 실제 바야다홈헬스케어 서비스 지역 데이터
 * 출처: search/29_FAQ_상세.txt - "주로 서울 및 수도권 지역에서 서비스를 제공합니다"
 * 본사: 서울 강남구 테헤란로 431 / 재가센터: 서울 강남구 도산대로 413
 */
const serviceRegions: ServiceRegion[] = [
  { code: "11", name: "서울특별시", serviceLevel: "active", details: "강남구 중심 · 재가센터 운영 중" },
  { code: "31", name: "경기도", serviceLevel: "active", details: "수도권 서비스 제공 중" },
  { code: "23", name: "인천광역시", serviceLevel: "planned", details: "수도권 확대 예정" },
  { code: "22", name: "대구광역시", serviceLevel: "none" },
  { code: "21", name: "부산광역시", serviceLevel: "none" },
  { code: "25", name: "대전광역시", serviceLevel: "none" },
  { code: "24", name: "광주광역시", serviceLevel: "none" },
  { code: "26", name: "울산광역시", serviceLevel: "none" },
  { code: "29", name: "세종특별자치시", serviceLevel: "none" },
  { code: "32", name: "강원도", serviceLevel: "none" },
  { code: "33", name: "충청북도", serviceLevel: "none" },
  { code: "34", name: "충청남도", serviceLevel: "none" },
  { code: "35", name: "전라북도", serviceLevel: "none" },
  { code: "36", name: "전라남도", serviceLevel: "none" },
  { code: "37", name: "경상북도", serviceLevel: "none" },
  { code: "38", name: "경상남도", serviceLevel: "none" },
  { code: "39", name: "제주특별자치도", serviceLevel: "none" },
];

/* 시도 라벨 — 지도 경계(시도)에 맞춘 라벨 */
interface ProvinceLabel {
  code: string;
  name: string;
  coordinates: [number, number];
  fontSize?: number;
}

const provinceLabels: ProvinceLabel[] = [
  { code: "11", name: "서울", coordinates: [126.978, 37.566], fontSize: 11 },
  { code: "31", name: "경기", coordinates: [127.05, 37.28], fontSize: 11 },
  { code: "23", name: "인천", coordinates: [126.63, 37.46], fontSize: 9 },
  { code: "32", name: "강원", coordinates: [128.30, 37.75], fontSize: 11 },
  { code: "33", name: "충북", coordinates: [127.80, 36.63], fontSize: 11 },
  { code: "34", name: "충남", coordinates: [126.68, 36.52], fontSize: 11 },
  { code: "29", name: "세종", coordinates: [127.05, 36.56], fontSize: 7 },
  { code: "25", name: "대전", coordinates: [127.38, 36.35], fontSize: 9 },
  { code: "35", name: "전북", coordinates: [127.10, 35.82], fontSize: 11 },
  { code: "36", name: "전남", coordinates: [126.50, 34.75], fontSize: 11 },
  { code: "24", name: "광주", coordinates: [126.85, 35.16], fontSize: 9 },
  { code: "37", name: "경북", coordinates: [128.70, 36.25], fontSize: 11 },
  { code: "22", name: "대구", coordinates: [128.60, 35.87], fontSize: 9 },
  { code: "26", name: "울산", coordinates: [129.31, 35.54], fontSize: 9 },
  { code: "38", name: "경남", coordinates: [128.25, 35.25], fontSize: 11 },
  { code: "21", name: "부산", coordinates: [129.08, 35.18], fontSize: 9 },
  { code: "39", name: "제주", coordinates: [126.55, 33.39], fontSize: 11 },
];

/* 서비스 레벨별 색상 */
function getFill(level: ServiceLevel, isHovered: boolean): string {
  switch (level) {
    case "active":
      return isHovered ? "#3d7fa8" : "#4a90bd";
    case "expanding":
      return isHovered ? "#6199bc" : "#72a8c8";
    case "planned":
      return isHovered ? "#8db8d2" : "#9ec5db";
    default:
      return isHovered ? "#c5d5e0" : "#d4e1ea";
  }
}

function getStrokeWidth(code: string): number {
  // 광역시는 경계를 얇게 → 도와 자연스럽게 어우러지도록
  const metroCity = ["11", "21", "22", "23", "24", "25", "26", "29"];
  return metroCity.includes(code) ? 0.5 : 1;
}

function getRegion(code: string): ServiceRegion | undefined {
  return serviceRegions.find((r) => r.code === code);
}

export function ServiceAreaMap() {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const hoveredRegion = hoveredCode ? getRegion(hoveredCode) : null;

  const handleEnter = useCallback((code: string) => setHoveredCode(code), []);
  const handleLeave = useCallback(() => setHoveredCode(null), []);

  return (
    <section className="bg-[#edf2f7] py-16 px-4 sm:px-6 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center text-black/[0.87] sm:text-4xl lg:text-5xl leading-tight">
          우리가 &lsquo;집&rsquo;이라 부르는
          <br />
          전세계 지역사회에서 전문적인 돌봄을 제공합니다
        </h2>
        <p className="mt-4 text-center text-base text-black/50">
          인도, 호주, 뉴질랜드, 독일, 아일랜드, 캐나다, 미국, 한국, 일본 — 글로벌 네트워크로 연결됩니다
        </p>

        <div className="relative mt-12 flex flex-col items-center lg:flex-row lg:items-start lg:gap-10">
          {/* 좌측 정보 패널 */}
          <div className="order-2 lg:order-1 mt-8 lg:mt-8 w-full lg:w-[300px] flex-shrink-0 space-y-5">
            {/* 서비스 운영 중 */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4a90bd] text-[11px] font-bold text-white shadow-sm">
                  A
                </span>
                <span className="text-sm font-bold text-gray-800">서비스 운영 중</span>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg bg-[#f0f6fb] px-4 py-3">
                  <p className="text-[13px] font-semibold text-[#2d6a8f]">서울특별시</p>
                  <p className="mt-0.5 text-xs text-gray-500">강남구 중심 · 재가센터 운영 중</p>
                  <p className="mt-1 text-[11px] text-gray-400">본사: 테헤란로 431 · 센터: 도산대로 413</p>
                </div>
                <div className="rounded-lg bg-[#f0f6fb] px-4 py-3">
                  <p className="text-[13px] font-semibold text-[#2d6a8f]">경기도</p>
                  <p className="mt-0.5 text-xs text-gray-500">수도권 서비스 제공 중</p>
                  <p className="mt-1 text-[11px] text-gray-400">성남 · 용인 · 수원 · 고양 등</p>
                </div>
              </div>
            </div>

            {/* 확대 예정 */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9ec5db] text-[11px] font-bold text-white shadow-sm">
                  B
                </span>
                <span className="text-sm font-bold text-gray-800">확대 예정 지역</span>
              </div>
              <div className="rounded-lg bg-[#f5f9fc] px-4 py-3">
                <p className="text-[13px] font-semibold text-[#5a99b5]">인천광역시</p>
                <p className="mt-0.5 text-xs text-gray-500">수도권 확대 예정</p>
              </div>
            </div>

            {/* 상담 안내 */}
            <div className="rounded-xl border border-[#4a90bd]/20 bg-[#f0f6fb] p-5">
              <p className="text-[13px] font-semibold text-[#2d6a8f]">서비스 지역 문의</p>
              <p className="mt-1 text-xs text-gray-500">
                구체적인 서비스 제공 가능 지역은 전화 상담 시 확인 가능합니다.
              </p>
              <p className="mt-2 text-sm font-bold text-[#2d6a8f]">
                📞 1670-1379
              </p>
            </div>

            {/* 범례 */}
            <div className="flex items-center gap-4 flex-wrap pt-2">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-4 rounded-sm bg-[#4a90bd]" />
                <span className="text-xs text-gray-500">운영 중</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-4 rounded-sm bg-[#9ec5db]" />
                <span className="text-xs text-gray-500">확대 예정</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-4 rounded-sm bg-[#d4e1ea]" />
                <span className="text-xs text-gray-500">준비 중</span>
              </div>
            </div>
          </div>

          {/* 우측 지도 */}
          <div className="order-1 lg:order-2 relative w-full max-w-[520px] lg:max-w-none lg:flex-1">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                center: [127.8, 35.9],
                scale: 5800,
              }}
              width={500}
              height={600}
              style={{ width: "100%", height: "auto" }}
            >
              <Geographies geography={TOPO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const code = geo.properties.code;
                    const region = getRegion(code);
                    const level = region?.serviceLevel ?? "none";
                    const isHovered = hoveredCode === code;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getFill(level, isHovered)}
                        stroke="#ffffff"
                        strokeWidth={getStrokeWidth(code)}
                        strokeLinejoin="round"
                        style={{
                          default: { outline: "none", transition: "fill 0.2s ease" },
                          hover: { outline: "none", cursor: "pointer" },
                          pressed: { outline: "none" },
                        }}
                        onMouseEnter={() => handleEnter(code)}
                        onMouseLeave={handleLeave}
                      />
                    );
                  })
                }
              </Geographies>

              {/* 시도 라벨 */}
              {provinceLabels.map((label) => {
                const region = getRegion(label.code);
                const isActive = region?.serviceLevel === "active";
                const isPlanned = region?.serviceLevel === "planned";
                const size = label.fontSize ?? 10;

                return (
                  <Marker key={label.code} coordinates={label.coordinates}>
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        fontSize: `${size}px`,
                        fontWeight: isActive ? 700 : isPlanned ? 600 : 400,
                        fill: isActive ? "#fff" : isPlanned ? "#3d6e8a" : "#5a7d94",
                        pointerEvents: "none",
                        userSelect: "none",
                        textShadow: isActive ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                      }}
                    >
                      {label.name}
                    </text>
                  </Marker>
                );
              })}
            </ComposableMap>

            {/* 호버 툴팁 */}
            <AnimatePresence>
              {hoveredRegion && (
                <motion.div
                  key={hoveredRegion.code}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute right-4 top-4 z-10 rounded-lg bg-white px-4 py-3 shadow-lg border border-gray-100 min-w-[180px]"
                >
                  <p className="text-sm font-bold text-gray-900">
                    {hoveredRegion.name}
                  </p>
                  {hoveredRegion.serviceLevel === "active" ? (
                    <>
                      <span className="mt-1 inline-block rounded-full bg-[#4a90bd] px-2 py-0.5 text-[10px] font-semibold text-white">
                        서비스 운영 중
                      </span>
                      {hoveredRegion.details && (
                        <p className="mt-1.5 text-xs text-gray-500">{hoveredRegion.details}</p>
                      )}
                    </>
                  ) : hoveredRegion.serviceLevel === "planned" ? (
                    <>
                      <span className="mt-1 inline-block rounded-full bg-[#9ec5db] px-2 py-0.5 text-[10px] font-semibold text-white">
                        확대 예정
                      </span>
                      {hoveredRegion.details && (
                        <p className="mt-1.5 text-xs text-gray-500">{hoveredRegion.details}</p>
                      )}
                    </>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400">서비스 준비 중</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
