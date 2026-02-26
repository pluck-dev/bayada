"use client";

import { useState, useEffect } from "react";
import { Search, X, ChevronDown, BookOpen } from "lucide-react";
import { CourseGrid } from "@/components/CourseGrid";
import type { CourseCardProps } from "@/components/CourseCard";
import { useDictionary } from "@/components/DictionaryProvider";
import { useParams } from "next/navigation";

const sortOptions = [
  { value: "newest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "price_asc", label: "낮은 가격순" },
  { value: "price_desc", label: "높은 가격순" },
];

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  _count: { courses: number };
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [courses, setCourses] = useState<CourseCardProps[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    fetch("/api/v1/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory !== "all") params.set("categoryId", selectedCategory);
    if (selectedSort) params.set("sort", selectedSort);

    fetch(`/api/v1/courses?${params}`)
      .then((res) => res.json())
      .then((data) => {
        const items = (data.items ?? []).map((course: Record<string, unknown>) => {
          const sections = (course.sections as Array<{ lectures: Array<{ duration: number | null }> }>) ?? [];
          const totalDuration = sections.reduce(
            (sum: number, s: { lectures: Array<{ duration: number | null }> }) =>
              sum + s.lectures.reduce((ls: number, l: { duration: number | null }) => ls + (l.duration ?? 0), 0),
            0
          );
          const category = course.category as { name: string } | null;
          const count = course._count as { enrollments: number } | undefined;
          return {
            slug: course.slug as string,
            title: course.title as string,
            description: (course.description as string) ?? "",
            thumbnail: course.thumbnail as string | null,
            price: course.price as number,
            category: category?.name ?? "",
            totalDuration,
            studentCount: count?.enrollments ?? 0,
          };
        });
        setCourses(items);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [searchQuery, selectedCategory, selectedSort]);

  return (
    <div className="min-h-screen bg-white">

      {/* 페이지 타이틀 */}
      <section className="pt-16 pb-8 sm:pt-20 sm:pb-10">
        <div className="mx-auto max-w-[1080px] px-6">
          <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-bold tracking-tight text-gray-900 leading-[1.1]">
            {dict.academy.allCourses}
          </h1>
          <p className="mt-3 text-[17px] text-gray-400 leading-relaxed">
            바야다 홈헬스케어의 전문 교육 과정을 탐색하세요
          </p>
        </div>
      </section>

      {/* 검색 + 필터 — sticky */}
      <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1080px] px-6">

          {/* 검색 */}
          <div className="relative pb-4">
            <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-300 pointer-events-none" />
            <input
              type="text"
              placeholder="강의 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[48px] rounded-2xl bg-[#f5f5f7] pl-12 pr-12 text-[15px] text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-[#ededf0] focus:ring-2 focus:ring-gray-200/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 카테고리 + 정렬 */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
            {/* 카테고리 pill */}
            <div className="hide-scrollbar -ml-1 flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-200 ${
                  selectedCategory === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-[#f5f5f7] text-gray-500 hover:bg-gray-200/70 hover:text-gray-700"
                }`}
              >
                전체
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? "bg-gray-900 text-white"
                      : "bg-[#f5f5f7] text-gray-500 hover:bg-gray-200/70 hover:text-gray-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* 정렬 */}
            <div className="shrink-0 relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none cursor-pointer rounded-full bg-[#f5f5f7] pl-4 pr-9 py-2 text-[13px] font-medium text-gray-500 outline-none transition-all duration-200 hover:bg-gray-200/70"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="mx-auto max-w-[1080px] px-6 pt-10 pb-24">

        {/* 결과 카운트 */}
        {!loading && courses.length > 0 && (
          <p className="mb-8 text-[13px] text-gray-400">
            {courses.length}개의 강의
          </p>
        )}

        {/* 로딩 스켈레톤 */}
        {loading ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col">
                <div className="aspect-[4/3] w-full rounded-[20px] bg-[#f5f5f7]">
                  <div
                    className="h-full w-full rounded-[20px]"
                    style={{
                      background: "linear-gradient(90deg, #f5f5f7 0%, #ededf0 50%, #f5f5f7 100%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
                <div className="pt-4 space-y-2.5">
                  <div className="h-3 w-20 rounded-full bg-[#f5f5f7]" />
                  <div className="h-4 w-3/4 rounded-full bg-[#f5f5f7]" />
                  <div className="h-4 w-1/2 rounded-full bg-[#f5f5f7]" />
                  <div className="pt-1">
                    <div className="h-4 w-16 rounded-full bg-[#f5f5f7]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5f7]">
              <BookOpen className="h-7 w-7 text-gray-300" />
            </div>
            <h3 className="text-[17px] font-semibold text-gray-900 mb-1.5">
              검색 결과가 없습니다
            </h3>
            <p className="text-[14px] text-gray-400 max-w-[280px] mb-8 leading-relaxed">
              다른 키워드로 검색하거나<br />필터를 변경해보세요
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="rounded-full bg-gray-900 px-6 py-2.5 text-[14px] font-medium text-white transition-all duration-200 hover:bg-black active:scale-[0.97]"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <CourseGrid courses={courses} locale={locale} />
        )}
      </div>
    </div>
  );
}
