"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input, Button, Badge, Skeleton } from "@bayada/ui";
import { CourseGrid } from "@/components/CourseGrid";
import type { CourseCardProps } from "@/components/CourseCard";
import { useDictionary } from "@/components/DictionaryProvider";
import { useParams } from "next/navigation";

// 정렬 옵션
const sortOptions = [
  { value: "newest", label: "최신순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
  { value: "title", label: "이름순" },
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

  // 카테고리 로드
  useEffect(() => {
    fetch("/api/v1/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  // 강의 목록 로드
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
            <button
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-[color:var(--brand)] text-white"
                  : "bg-[color:var(--surface)] text-[color:var(--muted)] hover:bg-[color:var(--surface-3)]"
              }`}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[color:var(--brand)] text-white"
                    : "bg-[color:var(--surface)] text-[color:var(--muted)] hover:bg-[color:var(--surface-3)]"
                }`}
              >
                {cat.name}
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
            {courses.length}
          </span>
          개의 강의
        </p>
      </div>

      {/* 강의 그리드 */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : (
        <CourseGrid
          courses={courses}
          emptyMessage="검색 결과가 없습니다. 다른 키워드로 검색해보세요."
          locale={locale}
        />
      )}
    </div>
  );
}
