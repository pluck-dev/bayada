import { CourseCard, type CourseCardProps } from "./CourseCard";

interface CourseGridProps {
  courses: CourseCardProps[];
  emptyMessage?: string;
  locale?: string;
}

export function CourseGrid({
  courses,
  emptyMessage = "등록된 강의가 없습니다.",
  locale,
}: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-[color:var(--muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard key={course.slug} {...course} locale={locale} />
      ))}
    </div>
  );
}
