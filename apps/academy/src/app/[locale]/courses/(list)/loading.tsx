import { CourseCardSkeleton } from "@/components/course/CourseCard";

export default function CatalogLoading() {
  return (
    <div className="container-page pb-8 pt-8 md:pt-10" aria-busy="true" aria-label="프로그램을 불러오는 중">
      <div className="skeleton h-3 w-24" />
      <div className="skeleton mt-4 h-10 w-56" />
      <div className="skeleton mt-6 h-12 max-w-xl" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[232px_1fr]">
        <div className="skeleton hidden h-[480px] rounded-2xl lg:block" />
        <div>
          <div className="skeleton h-6 w-32" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
