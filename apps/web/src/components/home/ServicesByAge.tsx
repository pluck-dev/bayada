"use client";

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

// 서비스 데이터 (8개)
const allServices = [
  {
    id: "aba-therapy",
    title: "자폐증 및 ABA 치료",
    titleEn: "Autism & ABA Therapy",
    description:
      "자폐가 있는 아동이 소통하고 성장하며 독립성을 기를 수 있도록 1:1 맞춤 치료를 제공합니다.",
    image: "/images/services/cards/aba-therapy.webp",
    href: "/what-we-do/aba-therapy",
    groups: ["children"],
  },
  {
    id: "companion-care",
    title: "동반자 케어",
    titleEn: "Companion Care",
    description:
      "대화와 우정, 편안함을 제공하여 소중한 분의 일상에 활력을 더합니다.",
    image: "/images/services/cards/companion-care.jpg",
    href: "/what-we-do/companion-care",
    groups: ["seniors"],
  },
  {
    id: "habilitation",
    title: "재활 서비스",
    titleEn: "Habilitation",
    description:
      "지적·발달 장애가 있는 성인이 자신감을 갖고 새로운 기술을 배울 수 있도록 돕습니다.",
    image: "/images/services/cards/habilitation.webp",
    href: "/what-we-do/habilitation",
    groups: ["adults"],
  },
  {
    id: "home-health",
    title: "방문간호",
    titleEn: "Home Health",
    description:
      "전문 간호와 치료를 가정으로 직접 제공하여 건강을 관리하고 불필요한 입원을 줄입니다.",
    image: "/images/services/cards/home-health.webp",
    href: "/what-we-do/home-health",
    groups: ["seniors", "adults"],
  },
  {
    id: "hospice-care",
    title: "호스피스 케어",
    titleEn: "Hospice Care",
    description:
      "환자와 가족에게 편안함, 존엄성, 그리고 맞춤형 돌봄을 제공합니다.",
    image: "/images/services/cards/hospice-care.webp",
    href: "/what-we-do/hospice-care",
    groups: ["seniors", "adults"],
  },
  {
    id: "pediatric-home-health",
    title: "소아 방문간호",
    titleEn: "Pediatric Home Health",
    description:
      "일상적 필요부터 ICU 수준의 케어까지, 아이가 안전하게 성장할 수 있도록 전문 간호를 제공합니다.",
    image: "/images/services/cards/pediatric-home-care.webp",
    href: "/what-we-do/pediatric-home-health",
    groups: ["children"],
  },
  {
    id: "personal-care",
    title: "개인 돌봄",
    titleEn: "Personal Care",
    description:
      "일상 생활 지원과 안전, 편안함을 돕는 맞춤형 홈케어입니다.",
    image: "/images/services/cards/personal-care.webp",
    href: "/what-we-do/personal-care",
    groups: ["seniors"],
  },
  {
    id: "private-duty-nursing",
    title: "전문 간호",
    titleEn: "Private Duty Nursing",
    description:
      "전문 성인 간호로 독립적인 생활을 지원하고 삶의 질을 높입니다.",
    image: "/images/services/cards/private-duty-nursing.webp",
    href: "/what-we-do/private-duty-nursing",
    groups: ["seniors", "adults"],
  },
];

interface ServicesByAgeProps {
  locale: string;
}

export function ServicesByAge({ locale }: ServicesByAgeProps) {
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
    setCurrentIndex((prev) => Math.min(prev + 1, total - 1));
  }

  return (
    <section className="bg-white py-16 lg:py-24 overflow-hidden">
      {/* 상단 헤더 */}
      <div className="px-5 md:px-[6.25rem] mb-10 lg:mb-14">
        <h2 className="text-3xl font-bold text-black/[0.87] sm:text-4xl lg:text-[2.625rem] leading-tight">
          BAYADA&apos;s Services by Age
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/60">
          삶의 모든 단계에서, BAYADA는 어르신과 성인, 아이들이 가정에서
          안전하고 편안하게 생활할 수 있도록 함께합니다.
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
