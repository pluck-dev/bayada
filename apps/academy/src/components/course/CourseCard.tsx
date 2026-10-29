import Link from "next/link";
import { Award, Lock, Star } from "lucide-react";
import type { CourseCardData } from "@/lib/queries/courses";
import { JOB_ROLE_LABEL, LEVEL_LABEL, PRODUCT_TYPE_LABEL, formatMinutes, formatPrice } from "@/lib/labels";
import { CourseThumb } from "./CourseThumb";
import { WishlistButton } from "./WishlistButton";

export function CourseCard({ course, locale }: { course: CourseCardData; locale: string }) {
  const audience =
    course.audiences.length === 0
      ? "공통"
      : course.audiences.length > 1
        ? `${JOB_ROLE_LABEL[course.audiences[0]]} 외 ${course.audiences.length - 1}`
        : JOB_ROLE_LABEL[course.audiences[0]];
  const meta = [audience, formatMinutes(course.durationMin), course.level ? LEVEL_LABEL[course.level] : null].filter(
    Boolean
  );

  // 찜 버튼은 링크 안에 넣을 수 없어(대화형 요소 중첩) 카드 위에 겹쳐 둔다
  return (
    <div className="lift group relative h-full overflow-hidden rounded-2xl border border-line bg-white">
    <Link
      href={`/${locale}/courses/${encodeURIComponent(course.slug)}`}
      className="flex h-full flex-col"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-line-soft">
        <CourseThumb
          src={course.thumbnail}
          title={course.title}
          label={course.category?.name}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {course.visibility === "INTERNAL" && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            <Lock className="h-3 w-3" aria-hidden />
            사내 전용
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand">
            {(course.provider?.name ?? "B").charAt(0)}
          </span>
          <span className="truncate">{course.provider?.name ?? "바야다"}</span>
        </div>
        <span className="mt-3 inline-flex w-fit rounded-md border border-line px-1.5 py-0.5 text-[11px] font-medium text-ink-soft">
          {PRODUCT_TYPE_LABEL[course.productType]}
        </span>
        <h3 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-ink group-hover:text-brand">
          {course.title}
        </h3>
        <p className="mt-2 text-xs text-muted">{meta.join(" · ")}</p>
        {course.rating && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            <span className="font-semibold text-ink">{course.rating.avg.toFixed(1)}</span>
            <span>({course.rating.count.toLocaleString()})</span>
            <span className="sr-only">후기 평점</span>
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
            <Award className="h-3.5 w-3.5" aria-hidden />
            수료증
          </span>
          <span className="text-sm font-bold text-ink">{formatPrice(course.price)}</span>
        </div>
      </div>
    </Link>
      <WishlistButton courseId={course.id} locale={locale} wished={course.wished} className="absolute right-3 top-3" />
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="skeleton aspect-[16/9] rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}
