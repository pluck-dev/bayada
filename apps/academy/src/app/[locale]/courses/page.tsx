"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input, Button, Badge } from "@bayada/ui";
import { CourseGrid } from "@/components/CourseGrid";
import type { CourseCardProps } from "@/components/CourseCard";
import { useDictionary } from "@/components/DictionaryProvider";
import { useParams } from "next/navigation";

// 카테고리 목록
const categories = [
  { value: "all", label: "전체" },
  { value: "nursing", label: "간호 교육" },
  { value: "safety", label: "안전 교육" },
  { value: "compliance", label: "법정 필수 교육" },
  { value: "practice", label: "실무 교육" },
  { value: "management", label: "관리 교육" },
];

// 정렬 옵션
const sortOptions = [
  { value: "popular", label: "인기순" },
  { value: "newest", label: "최신순" },
  { value: "rating", label: "평점순" },
  { value: "price-low", label: "가격 낮은순" },
  { value: "price-high", label: "가격 높은순" },
];

// 플레이스홀더 강의 데이터
const allCourses: CourseCardProps[] = [
  {
    slug: "home-care-basics",
    title: "재가 돌봄 서비스 기초 과정",
    description:
      "재가 돌봄 서비스의 기본 원칙과 실무 기술을 배우는 필수 교육 과정입니다.",
    thumbnail: null,
    price: 89000,
    category: "간호 교육",
    instructor: "김영희 강사",
    totalDuration: 18000,
    studentCount: 1247,
    rating: 4.8,
    isNew: true,
  },
  {
    slug: "patient-safety-essentials",
    title: "환자 안전 관리 필수 과정",
    description:
      "환자 안전사고 예방과 대응을 위한 체계적인 교육 프로그램입니다.",
    thumbnail: null,
    price: 65000,
    category: "안전 교육",
    instructor: "박민수 강사",
    totalDuration: 14400,
    studentCount: 892,
    rating: 4.7,
  },
  {
    slug: "infection-control",
    title: "감염 관리 및 예방 교육",
    description:
      "의료 현장에서의 감염 예방 및 관리 방법을 학습하는 전문 교육 과정입니다.",
    thumbnail: null,
    price: 55000,
    category: "법정 필수 교육",
    instructor: "이정은 강사",
    totalDuration: 10800,
    studentCount: 2103,
    rating: 4.9,
  },
  {
    slug: "elder-care-communication",
    title: "어르신 케어 커뮤니케이션",
    description:
      "어르신과의 효과적인 의사소통 기법과 심리적 지원 방법을 배웁니다.",
    thumbnail: null,
    price: 45000,
    category: "간호 교육",
    instructor: "최수진 강사",
    totalDuration: 7200,
    studentCount: 634,
    rating: 4.6,
  },
  {
    slug: "emergency-response-2024",
    title: "응급 상황 대응 매뉴얼 (2024)",
    description:
      "최신 응급 대응 가이드라인에 맞춘 실전 대응 교육입니다.",
    thumbnail: null,
    price: 75000,
    category: "안전 교육",
    instructor: "강도현 강사",
    totalDuration: 12600,
    studentCount: 156,
    rating: 4.5,
    isNew: true,
  },
  {
    slug: "dementia-care-advanced",
    title: "치매 환자 돌봄 심화 과정",
    description:
      "치매 환자의 특성을 이해하고 전문적인 돌봄 기술을 습득합니다.",
    thumbnail: null,
    price: 120000,
    category: "간호 교육",
    instructor: "정미경 강사",
    totalDuration: 21600,
    studentCount: 89,
    rating: 4.9,
    isNew: true,
  },
  {
    slug: "healthcare-law-2024",
    title: "의료법 및 관련 법규 교육 (2024)",
    description:
      "개정된 의료법과 관련 법규에 대한 최신 교육입니다.",
    thumbnail: null,
    price: 0,
    category: "법정 필수 교육",
    instructor: "한승민 강사",
    totalDuration: 5400,
    studentCount: 3421,
    rating: 4.3,
    isNew: true,
  },
  {
    slug: "digital-health-records",
    title: "전자 건강기록 관리 실무",
    description:
      "전자 건강기록(EHR) 시스템의 효과적인 활용 방법을 학습합니다.",
    thumbnail: null,
    price: 55000,
    category: "실무 교육",
    instructor: "윤재훈 강사",
    totalDuration: 9000,
    studentCount: 267,
    rating: 4.4,
    isNew: true,
  },
  {
    slug: "personal-hygiene-management",
    title: "개인위생 관리 교육",
    description:
      "의료 종사자를 위한 개인위생 관리의 기본과 실천 방법을 배웁니다.",
    thumbnail: null,
    price: 0,
    category: "법정 필수 교육",
    instructor: "김태호 강사",
    totalDuration: 3600,
    studentCount: 5672,
    rating: 4.7,
  },
  {
    slug: "pain-management-basics",
    title: "통증 관리 기초 과정",
    description:
      "환자의 통증 평가와 비약물적 통증 관리 방법을 학습합니다.",
    thumbnail: null,
    price: 78000,
    category: "간호 교육",
    instructor: "서은지 강사",
    totalDuration: 16200,
    studentCount: 3891,
    rating: 4.8,
  },
  {
    slug: "workplace-safety",
    title: "근무 중 안전사고 예방 교육",
    description:
      "직장 내 안전사고를 예방하기 위한 필수 교육 과정입니다.",
    thumbnail: null,
    price: 0,
    category: "안전 교육",
    instructor: "오승환 강사",
    totalDuration: 5400,
    studentCount: 4523,
    rating: 4.5,
  },
  {
    slug: "nutrition-care",
    title: "영양 관리 및 식이 요법",
    description:
      "환자 맞춤형 영양 관리와 식이 요법의 원리를 학습합니다.",
    thumbnail: null,
    price: 68000,
    category: "간호 교육",
    instructor: "양미래 강사",
    totalDuration: 10800,
    studentCount: 2156,
    rating: 4.6,
  },
];

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("popular");
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();

  // 필터 적용
  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch =
      searchQuery === "" ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || course.category === categories.find((c) => c.value === selectedCategory)?.label;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[color:var(--fg)] sm:text-3xl">
          {dict.academy.allCourses}
        </h1>
        <p className="mt-2 text-[color:var(--muted)]">
          BAYADA Academy의 모든 강의를 둘러보세요
        </p>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-8 space-y-4">
        {/* 검색바 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
          <Input
            placeholder="강의명 또는 키워드로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] hover:text-[color:var(--fg)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 카테고리 필터 & 정렬 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* 카테고리 탭 */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? "bg-[color:var(--brand)] text-white"
                    : "bg-[color:var(--surface)] text-[color:var(--muted)] hover:bg-[color:var(--surface-3)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 정렬 */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[color:var(--muted)]" />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="rounded-lg border border-[color:var(--border)] bg-white px-3 py-1.5 text-sm text-[color:var(--fg)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 결과 수 */}
      <div className="mb-6">
        <p className="text-sm text-[color:var(--muted)]">
          총{" "}
          <span className="font-semibold text-[color:var(--fg)]">
            {filteredCourses.length}
          </span>
          개의 강의
        </p>
      </div>

      {/* 강의 그리드 */}
      <CourseGrid
        courses={filteredCourses}
        emptyMessage="검색 결과가 없습니다. 다른 키워드로 검색해보세요."
        locale={locale}
      />
    </div>
  );
}
