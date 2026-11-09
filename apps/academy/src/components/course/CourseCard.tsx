import Link from "next/link";
import { BookOpen, Clock, Lock, Users } from "lucide-react";
import { Badge, CourseCard as UiCourseCard, CourseCardSkeleton as UiCourseCardSkeleton } from "@bayada/ui";
import type { CourseCardData } from "@/lib/queries/courses";
import { audienceLabel } from "@/lib/cover";
import { LEVEL_LABEL, PRODUCT_TYPE_LABEL, formatMinutes, formatPrice } from "@/lib/labels";
import { CourseMedia } from "./CourseMedia";
import { WishlistButton } from "./WishlistButton";

/** 프로그램 데이터 → 공용 CourseCard (카드 모양은 @bayada/ui 한 곳에서만 정한다) */
export function CourseCard({
  course,
  locale,
  progress,
  layout,
}: {
  course: CourseCardData;
  locale: string;
  /** 마이 러닝: 진도율 (있으면 평점·가격 대신 진도 막대) */
  progress?: number | null;
  layout?: "vertical" | "horizontal";
}) {
  const audience = audienceLabel(course.audiences);
  const done = typeof progress === "number" && progress >= 100;
  const duration = formatMinutes(course.durationMin);
  const learners = course._count.enrollments;

  return (
    <UiCourseCard
      LinkComponent={Link}
      layout={layout}
      href={`/${locale}/courses/${encodeURIComponent(course.slug)}`}
      title={course.title}
      provider={course.category?.name ?? course.provider?.name ?? "바야다"}
      typeLabel={PRODUCT_TYPE_LABEL[course.productType]}
      tags={[
        course.visibility === "INTERNAL" ? (
          <Badge tone="inverse" size="md" icon={<Lock aria-hidden />} className="h-6 bg-ink">
            사내 전용
          </Badge>
        ) : null,
        course.level ? LEVEL_LABEL[course.level] : null,
        audience,
      ]}
      stats={[
        duration ? { icon: <Clock aria-hidden />, label: duration, srLabel: "총 학습 시간" } : null,
        course.lectureCount > 0 ? { icon: <BookOpen aria-hidden />, label: `${course.lectureCount}강`, srLabel: "강의 수" } : null,
        learners > 0 ? { icon: <Users aria-hidden />, label: `${learners.toLocaleString()}명`, srLabel: "수강자 수" } : null,
      ]}
      rating={course.rating}
      price={formatPrice(course.price)}
      progress={progress}
      progressLabel={done ? "수료 완료" : "진도"}
      media={<CourseMedia course={course} />}
      overlayAction={
        typeof progress === "number" ? undefined : (
          <WishlistButton courseId={course.id} locale={locale} wished={course.wished} />
        )
      }
    />
  );
}

export const CourseCardSkeleton = UiCourseCardSkeleton;
