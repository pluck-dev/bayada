import { formatPrice } from "@bayada/shared";
import { Badge, cn } from "@bayada/ui";
import { Star } from "lucide-react";
import Link from "next/link";

export interface CourseCardProps {
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  category: string;
  instructor?: string;
  totalDuration: number; // 초 단위
  studentCount: number;
  rating?: number;
  isNew?: boolean;
  locale?: string;
  className?: string;
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
  className,
}: CourseCardProps) {
  const courseHref = locale ? `/${locale}/courses/${slug}` : `/courses/${slug}`;

  return (
    <Link href={courseHref} className={cn("group block outline-none", className)}>
      <div className="apple-card hover-scale relative flex h-full flex-col overflow-hidden border border-black/5 ring-0 ring-black/5 transition-all focus-within:ring-2 focus-within:ring-[var(--brand-primary)]">
        {/* 썸네일 */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
               {/* Abstract placeholder */}
               <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')]"></div>
               <svg
                className="h-10 w-10 opacity-20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* 배지 & 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute left-4 top-4 flex gap-2">
             {isNew && (
              <Badge className="bg-[var(--brand-primary)] border-none text-white shadow-sm font-semibold hover:bg-[var(--brand-secondary)]">NEW</Badge>
            )}
             <Badge variant="secondary" className="bg-white/90 text-xs backdrop-blur-sm border-white/20 shadow-sm text-gray-800">
              {category}
            </Badge>
          </div>
        </div>

        {/* 강의 정보 */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="mb-2 line-clamp-2 text-[17px] font-semibold tracking-tight text-[var(--text-primary)] transition-colors group-hover:text-[var(--brand-primary)]">
            {title}
          </h3>
          <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {description}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
             <div className="flex flex-col">
                {instructor && <span className="text-xs text-gray-400 mb-0.5">{instructor}</span>}
                <span className="text-[15px] font-bold text-[var(--text-primary)]">
                  {price === 0 ? "무료" : formatPrice(price)}
                </span>
             </div>

             {rating != null && (
               <div className="flex gap-3 text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{rating.toFixed(1)}</span>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </Link>
  );
}
