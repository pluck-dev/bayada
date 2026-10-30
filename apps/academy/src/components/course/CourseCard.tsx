import Link from "next/link";
import { Lock } from "lucide-react";
import { Badge, CourseCard as UiCourseCard, CourseCardSkeleton as UiCourseCardSkeleton } from "@bayada/ui";
import type { CourseCardData } from "@/lib/queries/courses";
import { JOB_ROLE_LABEL, LEVEL_LABEL, PRODUCT_TYPE_LABEL, formatMinutes, formatPrice } from "@/lib/labels";
import { CourseThumb } from "./CourseThumb";
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
  const audience =
    course.audiences.length === 0
      ? "공통"
      : course.audiences.length > 1
        ? `${JOB_ROLE_LABEL[course.audiences[0]]} 외 ${course.audiences.length - 1}`
        : JOB_ROLE_LABEL[course.audiences[0]];
  const done = typeof progress === "number" && progress >= 100;

  return (
    <UiCourseCard
      LinkComponent={Link}
      layout={layout}
      href={`/${locale}/courses/${encodeURIComponent(course.slug)}`}
      title={course.title}
      typeLabel={PRODUCT_TYPE_LABEL[course.productType]}
      provider={course.provider?.name ?? "바야다"}
      meta={[audience, formatMinutes(course.durationMin), course.level ? LEVEL_LABEL[course.level] : null]}
      rating={course.rating}
      price={formatPrice(course.price)}
      progress={progress}
      progressLabel={done ? "수료 완료" : "진도"}
      media={<CourseThumb src={course.thumbnail} title={course.title} label={course.category?.name} />}
      badge={
        course.visibility === "INTERNAL" ? (
          <Badge tone="inverse" icon={<Lock aria-hidden />}>
            사내 전용
          </Badge>
        ) : undefined
      }
      overlayAction={
        typeof progress === "number" ? undefined : (
          <WishlistButton courseId={course.id} locale={locale} wished={course.wished} />
        )
      }
    />
  );
}

export const CourseCardSkeleton = UiCourseCardSkeleton;
