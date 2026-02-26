"use client";

import { CourseCard, type CourseCardProps } from "@/components/CourseCard";
import { HeroBanner } from "@/components/HeroBanner";
import { useDictionary } from "@/components/DictionaryProvider";
import { Button, Skeleton } from "@bayada/ui";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Heart,
  Monitor,
  Quote,
  Shield,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ApiCourse {
  slug: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  category: { name: string } | null;
  sections: Array<{ lectures: Array<{ duration: number | null }> }>;
  _count: { enrollments: number };
  createdAt: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  _count: { courses: number };
}

function mapCourses(items: ApiCourse[]): CourseCardProps[] {
  return items.map((course) => {
    const totalDuration = (course.sections ?? []).reduce(
      (sum, s) =>
        sum + s.lectures.reduce((ls, l) => ls + (l.duration ?? 0), 0),
      0
    );
    return {
      slug: course.slug,
      title: course.title,
      description: course.description ?? "",
      thumbnail: course.thumbnail,
      price: course.price,
      category: course.category?.name ?? "",
      totalDuration,
      studentCount: course._count?.enrollments ?? 0,
    };
  });
}

/* ----- 카테고리 아이콘 매핑 ----- */
const categoryIcons: Record<string, React.ReactNode> = {
  "간호교육": <Stethoscope className="h-5 w-5" />,
  "질환교육": <Heart className="h-5 w-5" />,
  "안전교육": <Shield className="h-5 w-5" />,
  "PSP": <TrendingUp className="h-5 w-5" />,
  "법정필수교육": <BookOpen className="h-5 w-5" />,
};
const defaultCategoryIcon = <GraduationCap className="h-5 w-5" />;

/* ----- SectionHeader (Coursera 스타일) ----- */
const SectionHeader = ({
  title,
  subtitle,
  href,
  linkText = "전체 보기",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkText?: string;
}) => (
  <div className="mb-10 flex items-end justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
    <div>
      <h2 className="typo-h2 text-[var(--text-primary)]">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-base text-[var(--text-secondary)] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
    {href && (
      <Link
        href={href}
        className="group hidden items-center gap-2 rounded-full bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-900 hover:text-white sm:flex"
      >
        {linkText}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    )}
  </div>
);

/* ----- 스크롤 감지 애니메이션 Hook ----- */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

const CardSkeleton = () => (
  <div className="w-[300px] flex-none sm:w-[340px]">
    <div className="rounded-[24px] bg-white overflow-hidden">
      <div className="aspect-[16/9] bg-gray-100 animate-shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-100 animate-shimmer" />
        <div className="h-3 w-full rounded bg-gray-100 animate-shimmer" />
        <div className="h-3 w-1/2 rounded bg-gray-100 animate-shimmer" />
      </div>
    </div>
  </div>
);


export default function HomePage() {
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();
  const [courses, setCourses] = useState<CourseCardProps[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, enrollments: 0 });

  // 섹션별 애니메이션
  const categorySection = useInView();
  const recommendedSection = useInView();
  const featureSection = useInView();
  const popularSection = useInView();
  const newSection = useInView();
  const ctaSection = useInView();

  useEffect(() => {
    fetch("/api/v1/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/v1/courses?limit=48")
      .then((res) => res.json())
      .then((data) => {
        const items: ApiCourse[] = data.items ?? [];
        const mapped = mapCourses(items);
        setCourses(mapped);

        const totalEnrollments = items.reduce(
          (sum, c) => sum + (c._count?.enrollments ?? 0),
          0
        );
        setStats({ total: mapped.length, enrollments: totalEnrollments });
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const newCourses = courses.slice(0, 8);
  const recommendedCourses = courses.slice(0, 8);
  const popularCourses = [...courses]
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 4);

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Banner */}
      <HeroBanner locale={locale} dict={dict} stats={stats} />

      {/* 카테고리 퀵 내비게이션 */}
      <section
        ref={categorySection.ref as React.RefObject<HTMLElement>}
        className={`py-8 ${categorySection.inView ? "animate-fade-in-up" : "opacity-0"}`}
      >
        <div className="hide-scrollbar flex gap-3 overflow-x-auto px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <Link
            href={`/${locale}/courses`}
            className="pill pill-active flex-none gap-2"
          >
            <BookOpen className="h-4 w-4" />
            전체
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${locale}/courses?categoryId=${cat.id}`}
              className="pill pill-inactive flex-none gap-2"
            >
              {categoryIcons[cat.name] || defaultCategoryIcon}
              {cat.name}
              <span className="ml-1 text-xs text-gray-400">
                {cat._count.courses}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 추천 강의 — 데스크탑 4열 그리드 / 모바일 스크롤 */}
      <section
        ref={recommendedSection.ref as React.RefObject<HTMLElement>}
        className="py-16"
        style={{ paddingTop: "var(--section-gap-sm)" }}
      >
        <SectionHeader
          title={dict.academy.recommended}
          subtitle="BAYADA가 추천하는 이달의 핵심 과정"
          href={`/${locale}/courses?sort=recommended`}
        />

        {/* 모바일: 가로 스크롤 */}
        <div className="hide-scrollbar flex gap-6 overflow-x-auto px-4 pb-4 pt-2 sm:px-6 lg:hidden max-w-7xl mx-auto w-full snap-x">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : recommendedCourses.slice(0, 4).map((course, idx) => (
                <div
                  key={course.slug}
                  className={`w-[300px] flex-none snap-start ${
                    recommendedSection.inView ? "animate-fade-in-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CourseCard {...course} locale={locale} />
                </div>
              ))}
        </div>

        {/* 데스크탑: 4열 그리드 */}
        <div className="hidden lg:grid grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-[24px] bg-white overflow-hidden">
                  <div className="aspect-[16/9] bg-gray-100 animate-shimmer" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-3/4 rounded bg-gray-100" />
                    <div className="h-3 w-full rounded bg-gray-100" />
                  </div>
                </div>
              ))
            : recommendedCourses.slice(0, 8).map((course, idx) => (
                <div
                  key={course.slug}
                  className={recommendedSection.inView ? "animate-fade-in-up" : "opacity-0"}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <CourseCard {...course} locale={locale} />
                </div>
              ))}
        </div>
      </section>

      {/* Feature Highlight — 통계 카드 + Testimonial */}
      <section
        ref={featureSection.ref as React.RefObject<HTMLElement>}
        className="bg-white"
        style={{ paddingTop: "var(--section-gap-md)", paddingBottom: "var(--section-gap-md)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-2 lg:items-center">
            {/* 왼쪽: 텍스트 + 통계 카드 */}
            <div className={`lg:pr-8 ${featureSection.inView ? "animate-slide-in-left" : "opacity-0"}`}>
              <span className="inline-block rounded-full bg-red-50 px-4 py-1.5 text-sm font-semibold text-[var(--brand-primary)] mb-4">
                Why BAYADA Academy?
              </span>
              <h2 className="typo-h1 text-gray-900 mb-6">
                실무 중심의 <br />
                체계적인 커리큘럼
              </h2>
              <p className="text-lg leading-8 text-gray-500 mb-8">
                이론에만 그치지 않고 실제 현장에서 바로 적용할 수 있는 살아있는 지식을 전달합니다.
              </p>

              <ul role="list" className="space-y-4 text-base text-gray-600 mb-10">
                <li className="flex gap-x-3 items-center">
                  <CheckCircle2 className="h-5 w-5 flex-none text-[var(--brand-primary)]" />
                  <span>현장 전문가의 노하우가 담긴 강의</span>
                </li>
                <li className="flex gap-x-3 items-center">
                  <Monitor className="h-5 w-5 flex-none text-[var(--brand-primary)]" />
                  <span>PC, Mobile 어디서나 자유로운 수강</span>
                </li>
                <li className="flex gap-x-3 items-center">
                  <GraduationCap className="h-5 w-5 flex-none text-[var(--brand-primary)]" />
                  <span>학습 진행도 실시간 관리 및 수료증 발급</span>
                </li>
              </ul>

              {/* 통계 카드 3개 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-gray-50 p-5 text-center">
                  <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {stats.total > 0 ? `${stats.total}+` : "50+"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-gray-500">총 강의 수</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-5 text-center">
                  <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {stats.enrollments > 0 ? `${stats.enrollments.toLocaleString()}+` : "1,200+"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-gray-500">누적 수강생</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-5 text-center">
                  <p className="text-2xl font-bold text-gray-900 sm:text-3xl">94%</p>
                  <p className="mt-1 text-xs font-medium text-gray-500">수료율</p>
                </div>
              </div>
            </div>

            {/* 오른쪽: 스택형 Testimonial 카드 */}
            <div className={`relative ${featureSection.inView ? "animate-slide-in-right delay-200" : "opacity-0"}`}>
              <div className="space-y-5">
                {/* Testimonial 1 */}
                <div className="rounded-2xl bg-gray-50 p-6 shadow-sm border border-gray-100 relative">
                  <Quote className="absolute top-4 right-4 h-8 w-8 text-gray-200" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-white text-sm font-bold">
                      김
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">김지영 님</p>
                      <p className="text-xs text-gray-500">방문간호사 · 3년차</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    "실무에서 겪는 어려움을 해결하는 데 큰 도움이 되었습니다.
                    특히 질환교육 시리즈가 환자 대응에 실질적으로 도움이 됩니다."
                  </p>
                </div>

                {/* Testimonial 2 */}
                <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100 relative">
                  <Quote className="absolute top-4 right-4 h-8 w-8 text-gray-200" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      박
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">박서연 님</p>
                      <p className="text-xs text-gray-500">물리치료사 · 5년차</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    "이동 시간에 모바일로 편리하게 수강할 수 있어 좋습니다.
                    수료증도 바로 발급되어 경력 관리에 큰 도움이 됩니다."
                  </p>
                </div>

                {/* Testimonial 3 */}
                <div className="rounded-2xl bg-gray-50 p-6 shadow-sm border border-gray-100 relative">
                  <Quote className="absolute top-4 right-4 h-8 w-8 text-gray-200" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                      이
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">이현우 님</p>
                      <p className="text-xs text-gray-500">요양보호사 · 신입</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    "신입으로서 PSP 과정을 통해 환자 안전에 대한 이해를 높일 수 있었습니다.
                    체계적인 커리큘럼이 인상적이에요."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 인기 강의 — 랭킹 스타일 */}
      <section
        ref={popularSection.ref as React.RefObject<HTMLElement>}
        className="bg-[#f5f5f7]"
        style={{ paddingTop: "var(--section-gap-md)", paddingBottom: "var(--section-gap-sm)" }}
      >
        <SectionHeader
          title={dict.academy.popularCourses}
          subtitle="다른 수강생들이 선택한 검증된 강의"
          href={`/${locale}/courses?sort=popular`}
        />

        {/* 모바일: 가로 스크롤 */}
        <div className="hide-scrollbar flex gap-6 overflow-x-auto px-4 pb-4 pt-2 sm:px-6 lg:hidden max-w-7xl mx-auto w-full snap-x">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : popularCourses.map((course, idx) => (
                <div
                  key={course.slug}
                  className={`w-[300px] flex-none snap-start ${
                    popularSection.inView ? "animate-fade-in-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CourseCard {...course} locale={locale} rank={idx + 1} />
                </div>
              ))}
        </div>

        {/* 데스크탑: 4열 그리드 + 랭킹 */}
        <div className="hidden lg:grid grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))
            : popularCourses.map((course, idx) => (
                <div
                  key={course.slug}
                  className={popularSection.inView ? "animate-fade-in-up" : "opacity-0"}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CourseCard {...course} locale={locale} rank={idx + 1} />
                </div>
              ))}
        </div>
      </section>

      {/* 신규 강의 */}
      <section
        ref={newSection.ref as React.RefObject<HTMLElement>}
        className="bg-white"
        style={{ paddingTop: "var(--section-gap-md)", paddingBottom: "var(--section-gap-sm)" }}
      >
        <SectionHeader
          title={dict.academy.newCourses}
          subtitle="따끈따끈한 신규 개설 강의를 만나보세요"
          href={`/${locale}/courses?sort=newest`}
        />

        {/* 모바일: 가로 스크롤 */}
        <div className="hide-scrollbar flex gap-6 overflow-x-auto px-4 pb-4 pt-2 sm:px-6 lg:hidden max-w-7xl mx-auto w-full snap-x">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : newCourses.slice(0, 4).map((course, idx) => (
                <div
                  key={course.slug}
                  className={`w-[300px] flex-none snap-start ${
                    newSection.inView ? "animate-fade-in-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CourseCard {...course} locale={locale} isNew />
                </div>
              ))}
        </div>

        {/* 데스크탑: 4열 그리드 */}
        <div className="hidden lg:grid grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))
            : newCourses.slice(0, 8).map((course, idx) => (
                <div
                  key={course.slug}
                  className={newSection.inView ? "animate-fade-in-up" : "opacity-0"}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <CourseCard {...course} locale={locale} isNew />
                </div>
              ))}
        </div>
      </section>

      {/* CTA 섹션 — Toss 스타일 그라데이션 카드 */}
      <section
        ref={ctaSection.ref as React.RefObject<HTMLElement>}
        className="bg-[#f5f5f7]"
        style={{ paddingTop: "var(--section-gap-lg)", paddingBottom: "var(--section-gap-lg)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div
            className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-16 text-center shadow-2xl sm:px-16 ${
              ctaSection.inView ? "animate-scale-in" : "opacity-0"
            }`}
          >
            {/* 장식 */}
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[var(--brand-primary)] opacity-10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-500 opacity-10 blur-3xl" />

            <div className="relative z-10">
              <h2 className="typo-h1 text-white mb-4">
                준비되셨나요?
              </h2>
              <p className="text-lg text-gray-400 mb-10 max-w-md mx-auto leading-relaxed">
                BAYADA Academy는 여러분의 성장을 응원합니다.
                회원가입 후 모든 강의를 둘러보세요.
              </p>
              <Link href={`/${locale}/auth/register`}>
                <Button
                  size="lg"
                  className="rounded-full bg-white px-10 py-3 text-base font-semibold text-gray-900 shadow-xl transition-all hover:bg-gray-100 hover:shadow-2xl hover:-translate-y-0.5"
                >
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
