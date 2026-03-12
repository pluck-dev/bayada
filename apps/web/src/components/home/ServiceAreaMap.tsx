"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const WORLD_TOPO_URL = "/data/world-countries-110m.json";

interface CountryInfo {
  id: string; // ISO 3166-1 numeric
  name: string;
  nameKo: string;
  coordinates: [number, number];
  description: string;
  flag: string;
}

const BAYADA_COUNTRIES: CountryInfo[] = [
  {
    id: "840",
    name: "United States",
    nameKo: "미국",
    coordinates: [-98, 39],
    description: "1975년 설립, 360+ 사무소 운영",
    flag: "🇺🇸",
  },
  {
    id: "124",
    name: "Canada",
    nameKo: "캐나다",
    coordinates: [-106, 56],
    description: "북미 홈헬스케어 네트워크 확장",
    flag: "🇨🇦",
  },
  {
    id: "372",
    name: "Ireland",
    nameKo: "아일랜드",
    coordinates: [-8, 53.3],
    description: "유럽 홈헬스케어 서비스 거점",
    flag: "🇮🇪",
  },
  {
    id: "276",
    name: "Germany",
    nameKo: "독일",
    coordinates: [10.4, 51.2],
    description: "유럽 최대 시장 진출",
    flag: "🇩🇪",
  },
  {
    id: "356",
    name: "India",
    nameKo: "인도",
    coordinates: [78.9, 21],
    description: "아시아 홈케어 서비스 제공",
    flag: "🇮🇳",
  },
  {
    id: "410",
    name: "South Korea",
    nameKo: "한국",
    coordinates: [127.8, 36],
    description: "방문간호 · 방문요양 서비스 운영 중",
    flag: "🇰🇷",
  },
  {
    id: "392",
    name: "Japan",
    nameKo: "일본",
    coordinates: [138.3, 36.2],
    description: "아시아태평양 네트워크 확장",
    flag: "🇯🇵",
  },
  {
    id: "036",
    name: "Australia",
    nameKo: "호주",
    coordinates: [134, -25],
    description: "오세아니아 홈헬스케어 파트너십",
    flag: "🇦🇺",
  },
  {
    id: "554",
    name: "New Zealand",
    nameKo: "뉴질랜드",
    coordinates: [174, -41],
    description: "시니어 홈케어 서비스 제공",
    flag: "🇳🇿",
  },
];

const HIGHLIGHTED_IDS = new Set(BAYADA_COUNTRIES.map((c) => c.id));

export function ServiceAreaMap() {
  const [hoveredCountry, setHoveredCountry] = useState<CountryInfo | null>(
    null
  );

  const handleMarkerEnter = useCallback((country: CountryInfo) => {
    setHoveredCountry(country);
  }, []);

  const handleMarkerLeave = useCallback(() => {
    setHoveredCountry(null);
  }, []);

  return (
    <section className="bg-[#1B2A4A] py-16 px-4 sm:px-6 lg:px-12 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* 헤더 */}
        <h2 className="text-3xl font-bold text-center text-white sm:text-4xl lg:text-[2.75rem] leading-tight">
          우리가 &lsquo;집&rsquo;이라 부르는
          <br />
          전세계 지역사회에서 전문적인 돌봄을 제공합니다
        </h2>
        <p className="mt-5 text-center text-base text-white/60 max-w-2xl mx-auto">
          세계 최대 비영리 홈헬스케어 기업으로서, 모든 사람이 집에서 안전하고
          건강한 삶을 누릴 수 있도록 전문적인 돌봄을 제공합니다.
        </p>

        {/* 국가 태그 */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {BAYADA_COUNTRIES.map((country) => (
            <span
              key={country.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20"
              onMouseEnter={() => setHoveredCountry(country)}
              onMouseLeave={() => setHoveredCountry(null)}
            >
              {country.flag} {country.nameKo}
            </span>
          ))}
        </div>

        {/* 세계 지도 */}
        <div className="relative mt-10">
          <ComposableMap
            projection="geoNaturalEarth1"
            projectionConfig={{
              scale: 160,
              center: [10, 10],
            }}
            width={900}
            height={460}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={WORLD_TOPO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isHighlighted = HIGHLIGHTED_IDS.has(geo.id);
                  const isHovered = hoveredCountry?.id === geo.id;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={
                        isHovered
                          ? "#CE0E2D"
                          : isHighlighted
                            ? "#E8435A"
                            : "#2D4066"
                      }
                      stroke="#1B2A4A"
                      strokeWidth={0.5}
                      style={{
                        default: {
                          outline: "none",
                          transition: "fill 0.25s ease",
                        },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* 국가 마커 (핀 포인트) */}
            {BAYADA_COUNTRIES.map((country) => {
              const isHovered = hoveredCountry?.id === country.id;

              return (
                <Marker
                  key={country.id}
                  coordinates={country.coordinates}
                  onMouseEnter={() => handleMarkerEnter(country)}
                  onMouseLeave={handleMarkerLeave}
                >
                  {/* 외곽 펄스 링 */}
                  <circle
                    r={isHovered ? 8 : 5}
                    fill="rgba(206, 14, 45, 0.25)"
                    style={{ transition: "r 0.2s ease" }}
                  />
                  {/* 중앙 도트 */}
                  <circle
                    r={isHovered ? 4.5 : 3}
                    fill="#CE0E2D"
                    stroke="#fff"
                    strokeWidth={1.5}
                    style={{
                      cursor: "pointer",
                      transition: "r 0.2s ease",
                    }}
                  />
                  {/* 국가명 라벨 */}
                  <text
                    textAnchor="middle"
                    y={-10}
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontSize: "9px",
                      fontWeight: 600,
                      fill: isHovered ? "#fff" : "rgba(255,255,255,0.7)",
                      pointerEvents: "none",
                      userSelect: "none",
                      transition: "fill 0.2s ease",
                    }}
                  >
                    {country.nameKo}
                  </text>
                </Marker>
              );
            })}
          </ComposableMap>

          {/* 호버 툴팁 */}
          <AnimatePresence>
            {hoveredCountry && (
              <motion.div
                key={hoveredCountry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="pointer-events-none absolute left-1/2 bottom-4 z-10 -translate-x-1/2 rounded-xl bg-white px-5 py-4 shadow-2xl min-w-[220px]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{hoveredCountry.flag}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {hoveredCountry.nameKo}
                    </p>
                    <p className="text-xs text-gray-400">
                      {hoveredCountry.name}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                  {hoveredCountry.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 하단 통계 */}
        <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { stat: "9개국", label: "운영 국가" },
            { stat: "360+", label: "전 세계 사무소" },
            { stat: "33,000+", label: "전문 인력" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-2xl font-extrabold text-white sm:text-3xl">
                {item.stat}
              </p>
              <p className="mt-1 text-xs text-white/50 sm:text-sm">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
