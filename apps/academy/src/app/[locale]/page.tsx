"use client";

import { CourseCard, type CourseCardProps } from "@/components/CourseCard";
import { HeroBanner } from "@/components/HeroBanner";
import { useDictionary } from "@/components/DictionaryProvider";
import { Button, Skeleton } from "@bayada/ui";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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

const SectionHeader = ({ title, subtitle, href, linkText = "전체 보기" }: { title: string, subtitle?: string, href?: string, linkText?: string }) => (
  <div className="mb-8 flex items-end justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
    <div>
      <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-base text-[var(--text-secondary)]">
          {subtitle}
        </p>
      )}
    </div>
    {href && (
      <Link
        href={href}
        className="group hidden items-center gap-1 text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-secondary)] sm:flex"
      >
        {linkText}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    )}
  </div>
);

const ScrollContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="hide-scrollbar flex gap-6 overflow-x-auto px-4 pb-8 pt-2 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full snap-x">
    {children}
  </div>
);

const CardSkeleton = () => (
  <div className="w-[300px] flex-none sm:w-[360px]">
    <Skeleton className="h-72 rounded-xl" />
  </div>
);


export default function HomePage() {
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();
  const [courses, setCourses] = useState<CourseCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, enrollments: 0 });

  useEffect(() => {
    fetch("/api/v1/courses?limit=48")
      .then((res) => res.json())
      .then((data) => {
        const items: ApiCourse[] = data.items ?? [];
        const mapped = mapCourses(items);
        setCourses(mapped);

        // 통계 계산
        const totalEnrollments = items.reduce(
          (sum, c) => sum + (c._count?.enrollments ?? 0),
          0
        );
        setStats({ total: mapped.length, enrollments: totalEnrollments });
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  // 최신 강의: 처음 8개 (API가 createdAt desc로 반환)
  const newCourses = courses.slice(0, 8);
  // 추천 강의: 카테고리 다양하게 앞쪽 4개
  const recommendedCourses = courses.slice(0, 4);
  // 인기 강의: 수강생 수 기준 정렬
  const popularCourses = [...courses]
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 4);

  return (
    <div className="min-h-screen pb-32">
      {/* Full-Screen Hero — 웹사이트와 동일한 스타일 */}
      <HeroBanner
        locale={locale}
        dict={dict}
        stats={stats}
      />

      {/* Recommended Courses Horizontal Scroll */}
      <section className="py-12">
        <SectionHeader
          title={dict.academy.recommended}
          subtitle="BAYADA가 추천하는 이달의 핵심 과정"
          href={`/${locale}/courses?sort=recommended`}
        />
        <ScrollContainer>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : recommendedCourses.map((course) => (
                <div key={course.slug} className="w-[300px] flex-none sm:w-[360px]">
                  <CourseCard {...course} locale={locale} />
                </div>
              ))}
        </ScrollContainer>
      </section>

      {/* Feature Highlight Section */}
      <section className="my-20 bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
            <div className="lg:pr-12">
              <h2 className="text-base font-semibold leading-7 text-[var(--brand-primary)]">Why BAYADA Academy?</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                실무 중심의 <br />
                체계적인 커리큘럼
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                이론에만 그치지 않고 실제 현장에서 바로 적용할 수 있는 살아있는 지식을 전달합니다.
                업계 최고의 전문가들이 직접 설계한 교육 과정을 만나보세요.
              </p>
              <ul role="list" className="mt-10 space-y-4 text-base leading-7 text-gray-600">
                <li className="flex gap-x-3">
                  <CheckCircle2 className="h-7 w-5 flex-none text-[var(--brand-primary)]" aria-hidden="true" />
                  <span>현장 전문가의 노하우가 담긴 강의</span>
                </li>
                <li className="flex gap-x-3">
                  <CheckCircle2 className="h-7 w-5 flex-none text-[var(--brand-primary)]" aria-hidden="true" />
                  <span>PC, Mobile 어디서나 자유로운 수강</span>
                </li>
                <li className="flex gap-x-3">
                  <CheckCircle2 className="h-7 w-5 flex-none text-[var(--brand-primary)]" aria-hidden="true" />
                  <span>학습 진행도 실시간 관리 및 수료증 발급</span>
                </li>
              </ul>
              <div className="mt-10">
                 <Link href={`/${locale}/about`}>
                  <Button variant="outline" className="border-gray-300 text-gray-900 hover:bg-gray-50">
                    아카데미 소개 더보기
                  </Button>
                 </Link>
              </div>
            </div>

            <div className="relative order-first lg:order-last">
               {/* Abstract decorative image equivalent */}
               <div className="aspect-[4/3] overflow-hidden rounded-[2.5rem] bg-gray-900 shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-800 to-gray-700 opacity-50"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-white/20 text-9xl font-bold select-none overflow-hidden">BAYADA</span>
                  </div>
                  <div className="absolute bottom-10 left-10 right-10 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                     <p className="text-white font-medium">"실무에서 겪는 어려움을 해결하는 데 큰 도움이 되었습니다."</p>
                     <p className="text-white/60 text-sm mt-2">- 수강생 김지영 님</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Courses */}
      <section className="py-12 bg-[#f5f5f7]">
        <SectionHeader
          title={dict.academy.newCourses}
          subtitle="따끈따끈한 신규 개설 강의를 만나보세요"
          href={`/${locale}/courses?sort=newest`}
        />
        <ScrollContainer>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : newCourses.map((course) => (
                <div key={course.slug} className="w-[300px] flex-none sm:w-[360px]">
                  <CourseCard {...course} locale={locale} />
                </div>
              ))}
        </ScrollContainer>
      </section>

      {/* Popular Courses */}
      <section className="py-12">
        <SectionHeader
          title={dict.academy.popularCourses}
          subtitle="다른 수강생들이 선택한 검증된 강의"
          href={`/${locale}/courses?sort=popular`}
        />
        <ScrollContainer>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : popularCourses.map((course) => (
                <div key={course.slug} className="w-[300px] flex-none sm:w-[360px]">
                  <CourseCard {...course} locale={locale} />
                </div>
              ))}
        </ScrollContainer>
      </section>

      {/* Final CTA */}
      <section className="relative isolate mt-32 px-6 py-24 sm:mt-56 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.gray.100),white)] opacity-20" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            준비되셨나요?<br />
            지금 바로 시작하세요.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
            BAYADA Academy는 여러분의 성장을 응원합니다.
            회원가입 후 모든 강의를 둘러보세요.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href={`/${locale}/auth/register`}>
              <Button size="lg" className="bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white shadow-lg shadow-[var(--brand-primary)]/30">
                무료로 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
