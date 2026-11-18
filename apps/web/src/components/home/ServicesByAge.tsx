"use client";

import type { ServiceData } from "@bayada/shared/web-services";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";

// 연령 그룹 정의
const ageGroups = [
  {
    id: "seniors",
    label: "Care for Seniors",
    age: "Age 65 and up",
    icon: "/images/services/icons/senior.svg",
  },
  {
    id: "adults",
    label: "Care for Adults",
    age: "Age 19-64",
    icon: "/images/services/icons/adult.svg",
  },
  {
    id: "children",
    label: "Care for Children",
    age: "Newborn to 18",
    icon: "/images/services/icons/children.svg",
  },
];

interface ServicesByAgeProps {
  locale: string;
  services: ServiceData[];
}

export function ServicesByAge({ locale, services }: ServicesByAgeProps) {
  const allServices = services.map((service) => ({ id: service.slug, title: service.nameKo, titleEn: service.nameEn, description: service.description, image: service.image, href: service.href, groups: service.ageGroups ?? ["seniors", "adults", "children"] }));
  // null = 전체 보기, string = 선택된 그룹 id
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 필터링된 서비스 목록
  const filteredServices =
    activeGroupId === null
      ? allServices
      : allServices.filter((s) => s.groups.includes(activeGroupId));

  const total = filteredServices.length;

  function handleAccordionClick(groupId: string) {
    if (activeGroupId === groupId) {
      // 같은 그룹 클릭 시 전체 보기로 복귀
      setActiveGroupId(null);
    } else {
      setActiveGroupId(groupId);
    }
    setCurrentIndex(0);
  }

  function handlePrev() {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }

  function handleNext() {
    setCurrentIndex((prev) => Math.max(0, Math.min(prev + 1, total - 1)));
  }

  return (
    <section id="services-by-age" className="bg-white py-16 lg:py-24 overflow-hidden">
      {/* 상단 헤더 */}
      <div className="px-5 md:px-[6.25rem] mb-10 lg:mb-14">
        <h2 className="text-3xl font-bold text-black/[0.87] sm:text-4xl lg:text-[2.625rem] leading-tight">
          BAYADA 생애주기 맞춤형 서비스
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/60">
          BAYADA는 삶의 모든 연령과 단계에 맞춘 폭넓은 홈 케어 서비스를 제공합니다.
          각 개인의 고유한 필요와 선호, 목표에 맞추어 세심하게 설계된 서비스를 만나보세요.
        </p>
      </div>

      {/* 2컬럼 레이아웃 */}
      <div className="grid grid-cols-[100%] lg:grid-cols-[23rem_calc(100%-28rem)] gap-20">
        {/* 좌측: 아코디언 */}
        <div className="px-5 md:px-0 md:pl-[6.25rem] xll:pr-[6.25rem]">
          {ageGroups.map((group) => {
            const isActive = activeGroupId === group.id;
            return (
              <button
                key={group.id}
                onClick={() => handleAccordionClick(group.id)}
                className="flex w-full items-center justify-between border-b border-gray-200 py-6 text-left transition-colors hover:border-[#ce0e2d]"
              >
                <div className="flex items-center gap-4">
                  {/* 그룹 아이콘 */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isActive
                        ? "bg-[#ce0e2d]/10"
                        : "bg-gray-100"
                    }`}
                  >
                    <Image
                      src={group.icon}
                      alt={group.label}
                      width={28}
                      height={28}
                      className={`transition-opacity ${isActive ? "opacity-100" : "opacity-50"}`}
                    />
                  </div>

                  <div>
                    <p
                      className={`text-xl font-semibold leading-tight transition-colors ${
                        isActive
                          ? "text-[#ce0e2d]"
                          : "text-black/[0.87] hover:text-[#ce0e2d]"
                      }`}
                    >
                      {group.label}
                    </p>
                    <p className="mt-0.5 text-sm text-black/50">{group.age}</p>
                  </div>
                </div>

                <span
                  className={`ml-4 shrink-0 transition-colors ${
                    isActive ? "text-[#ce0e2d]" : "text-black/30"
                  }`}
                >
                  {isActive ? (
                    <Minus className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* 우측: 서비스 카드 캐러셀 */}
        <div className="min-w-0">
          {/* 카드 슬라이더 */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(calc(-${currentIndex} * (20rem + 1.25rem)))`,
              }}
            >
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="w-80 shrink-0 mr-5 last:mr-0"
                >
                  <Link
                    href={`/${locale}${service.href}`}
                    className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
                  >
                    {/* 카드 이미지 */}
                    <div className="relative h-52 overflow-hidden bg-gray-100">
                      <Image
                        src={service.image}
                        alt={service.titleEn}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="320px"
                      />
                    </div>

                    {/* 카드 본문 */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-black/[0.87] leading-tight group-hover:text-[#ce0e2d] transition-colors">
                        {service.title}
                      </h3>
                      <p className="mt-1 text-xs text-black/40 font-medium tracking-wide uppercase">
                        {service.titleEn}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-black/60 line-clamp-2">
                        {service.description}
                      </p>

                      {/* 연령 그룹 아이콘 태그 */}
                      <div className="mt-4 flex items-center gap-2">
                        {service.groups.map((groupId) => {
                          const group = ageGroups.find((g) => g.id === groupId);
                          if (!group) return null;
                          return (
                            <div
                              key={groupId}
                              className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1"
                            >
                              <Image
                                src={group.icon}
                                alt={group.label}
                                width={14}
                                height={14}
                                className="opacity-60"
                              />
                              <span className="text-xs text-black/50 font-medium">
                                {group.age}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* 카드 네비게이션 */}
          <div className="mt-8 flex items-center gap-5 pl-0">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="이전 서비스"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-black/[0.87] transition-colors hover:border-[#ce0e2d] hover:text-[#ce0e2d] disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <span className="text-sm font-medium text-black/[0.87]">
              {currentIndex + 1} of {total} Service{total !== 1 ? "s" : ""}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex >= total - 1}
              aria-label="다음 서비스"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-black/[0.87] transition-colors hover:border-[#ce0e2d] hover:text-[#ce0e2d] disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
