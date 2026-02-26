import { formatPrice } from "@bayada/shared";
import { cn } from "@bayada/ui";
import { Clock, Users } from "lucide-react";
import Link from "next/link";

export interface CourseCardProps {
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  category: string;
  instructor?: string;
  totalDuration: number;
  studentCount: number;
  rating?: number;
  isNew?: boolean;
  locale?: string;
  className?: string;
  rank?: number;
}

function formatDurationShort(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}시간${minutes > 0 ? ` ${minutes}분` : ""}`;
  return `${minutes}분`;
}

export function CourseCard({
  slug,
  title,
  thumbnail,
  price,
  category,
  instructor,
  totalDuration,
  studentCount,
  isNew,
  locale,
  className,
  rank,
}: CourseCardProps) {
  const courseHref = locale ? `/${locale}/courses/${slug}` : `/courses/${slug}`;

  return (
    <Link href={courseHref} className={cn("group block outline-none", className)}>
      <div className="relative flex h-full flex-col">

        {/* 썸네일 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-gray-100">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <svg className="h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          )}

          {/* 카테고리 배지 */}
          {category && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold text-gray-700">
              {category}
            </span>
          )}

          {/* NEW 배지 */}
          {isNew && (
            <span className="absolute right-3 top-3 rounded-full bg-[var(--brand-primary)] px-2.5 py-1 text-[10px] font-bold text-white">
              NEW
            </span>
          )}

          {/* 랭킹 */}
          {rank != null && (
            <span className="absolute left-3 bottom-3 text-[36px] font-black text-white leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              {rank}
            </span>
          )}
        </div>

        {/* 콘텐츠 */}
        <div className="flex flex-1 flex-col pt-4">
          {/* 메타 — 카테고리 아래, 제목 위 */}
          <div className="flex items-center gap-2.5 text-[12px] text-gray-400 mb-2">
            {studentCount > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {studentCount.toLocaleString()}명
              </span>
            )}
            {totalDuration > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDurationShort(totalDuration)}
              </span>
            )}
          </div>

          {/* 제목 */}
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 group-hover:text-[var(--brand-primary)] transition-colors duration-300">
            {title}
          </h3>

          {/* 강사 */}
          {instructor && (
            <p className="mt-1 text-[13px] text-gray-400">{instructor}</p>
          )}

          {/* 가격 */}
          <div className="mt-3">
            {price === 0 ? (
              <span className="text-[15px] font-bold text-[var(--brand-primary)]">무료</span>
            ) : (
              <span className="text-[15px] font-bold text-gray-900">{formatPrice(price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
