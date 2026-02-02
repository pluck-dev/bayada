"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Award,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { Button, Badge } from "@bayada/ui";
import { CourseGrid } from "@/components/CourseGrid";
import type { CourseCardProps } from "@/components/CourseCard";
import { useDictionary } from "@/components/DictionaryProvider";
import { useParams } from "next/navigation";

// 플레이스홀더 강의 데이터
const recommendedCourses: CourseCardProps[] = [
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
];

const newCourses: CourseCardProps[] = [
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
];

const popularCourses: CourseCardProps[] = [
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

export default function HomePage() {
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();

  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[color:var(--brand)] via-[#a30b24] to-[#7a0819]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxam0tMTggMnYtMkg2djJoMTJ6bTAtNFYyNkg2djJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <Badge className="mb-4 border border-white/20 bg-white/10 text-white">
              {dict.academy.heroTitle}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              전문 역량을 키우는
              <br />
              가장 확실한 방법
            </h1>
            <p className="mt-4 text-base text-white/80 sm:text-lg">
              {dict.academy.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/${locale}/courses`}>
                <Button
                  size="lg"
                  className="bg-white text-[color:var(--brand)] hover:bg-white/90"
                >
                  {dict.common.courses}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/${locale}/auth/register`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  {dict.common.register}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="border-b border-[color:var(--border)] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center">
              <BookOpen className="h-6 w-6 text-[color:var(--brand)]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[color:var(--fg)]">
              150+
            </p>
            <p className="text-sm text-[color:var(--muted)]">{dict.academy.allCourses}</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center">
              <GraduationCap className="h-6 w-6 text-[color:var(--brand)]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[color:var(--fg)]">
              12,000+
            </p>
            <p className="text-sm text-[color:var(--muted)]">{dict.academy.students}</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center">
              <Award className="h-6 w-6 text-[color:var(--brand)]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[color:var(--fg)]">
              98%
            </p>
            <p className="text-sm text-[color:var(--muted)]">{dict.academy.completed}</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center">
              <TrendingUp className="h-6 w-6 text-[color:var(--brand)]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[color:var(--fg)]">
              4.7
            </p>
            <p className="text-sm text-[color:var(--muted)]">평균 만족도</p>
          </div>
        </div>
      </section>

      {/* 추천 강의 */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[color:var(--fg)]">
              {dict.academy.recommended}
            </h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              BAYADA가 추천하는 핵심 교육 과정
            </p>
          </div>
          <Link
            href={`/${locale}/courses`}
            className="hidden items-center gap-1 text-sm font-medium text-[color:var(--brand)] hover:underline sm:flex"
          >
            전체 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <CourseGrid courses={recommendedCourses} locale={locale} />
      </section>

      {/* 신규 강의 */}
      <section className="bg-[color:var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[color:var(--fg)]">
                {dict.academy.newCourses}
              </h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                최근 등록된 새로운 강의
              </p>
            </div>
            <Link
              href={`/${locale}/courses?sort=newest`}
              className="hidden items-center gap-1 text-sm font-medium text-[color:var(--brand)] hover:underline sm:flex"
            >
              전체 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CourseGrid courses={newCourses} locale={locale} />
        </div>
      </section>

      {/* 인기 강의 */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[color:var(--fg)]">
              {dict.academy.popularCourses}
            </h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              수강생이 가장 많이 선택한 강의
            </p>
          </div>
          <Link
            href={`/${locale}/courses?sort=popular`}
            className="hidden items-center gap-1 text-sm font-medium text-[color:var(--brand)] hover:underline sm:flex"
          >
            전체 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <CourseGrid courses={popularCourses} locale={locale} />
      </section>

      {/* CTA 섹션 */}
      <section className="bg-[color:var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[color:var(--fg)]">
            지금 바로 학습을 시작하세요
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[color:var(--muted)]">
            BAYADA Academy에서 제공하는 전문 교육을 통해 역량을 강화하고
            커리어를 발전시키세요.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href={`/${locale}/auth/register`}>
              <Button size="lg">
                {dict.common.register}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/${locale}/courses`}>
              <Button variant="outline" size="lg">
                {dict.common.courses}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
