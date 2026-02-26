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
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.slug} {...course} locale={locale} />
      ))}
    </div>
  );
}
