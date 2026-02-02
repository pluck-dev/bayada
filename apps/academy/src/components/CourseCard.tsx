import Link from "next/link";
import { Clock, Users, Star } from "lucide-react";
import { Card } from "@bayada/ui";
import { Badge } from "@bayada/ui";
import { formatPrice, formatDuration } from "@bayada/shared";

export interface CourseCardProps {
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  category: string;
  instructor: string;
  totalDuration: number; // 초 단위
  studentCount: number;
  rating: number;
  isNew?: boolean;
  locale?: string;
}

export function CourseCard({
  slug,
  title,
  description,
  thumbnail,
  price,
  category,
  instructor,
  totalDuration,
  studentCount,
  rating,
  isNew,
  locale,
}: CourseCardProps) {
  const courseHref = locale ? `/${locale}/courses/${slug}` : `/courses/${slug}`;

  return (
    <Link href={courseHref} className="group block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-[var(--shadow-elevated)]">
        {/* 썸네일 */}
        <div className="relative aspect-video overflow-hidden bg-[color:var(--surface-3)]">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[color:var(--muted)]">
              <svg
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {isNew && (
            <div className="absolute left-3 top-3">
              <Badge variant="default">NEW</Badge>
            </div>
          )}
        </div>

        {/* 강의 정보 */}
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2">
            <Badge variant="secondary">{category}</Badge>
          </div>
          <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-[color:var(--fg)] group-hover:text-[color:var(--brand)]">
            {title}
          </h3>
          <p className="mb-3 line-clamp-2 text-xs text-[color:var(--muted)]">
            {description}
          </p>
          <p className="mb-3 text-xs text-[color:var(--muted)]">{instructor}</p>

          {/* 메타 정보 */}
          <div className="mt-auto flex items-center gap-3 text-xs text-[color:var(--muted)]">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {studentCount.toLocaleString()}명
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(totalDuration)}
            </span>
          </div>

          {/* 가격 */}
          <div className="mt-3 border-t border-[color:var(--border)] pt-3">
            <span className="text-base font-bold text-[color:var(--fg)]">
              {price === 0 ? "무료" : formatPrice(price)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
