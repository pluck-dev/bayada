"use client";

import { formatDuration } from "@bayada/shared";
import { cn, ProgressBar } from "@bayada/ui";
import { CheckCircle, ChevronLeft, FileText, PlayCircle } from "lucide-react";
import Link from "next/link";

interface LectureSidebarProps {
  locale: string;
  slug: string;
  courseTitle: string;
  currentLectureId: string;
  sections: Array<{
    id: string;
    title: string;
    lectures: Array<{
      id: string;
      title: string;
      type: string;
      duration: number | null;
    }>;
  }>;
  completedLectureIds: Set<string>;
}

export function LectureSidebar({
  locale,
  slug,
  courseTitle,
  currentLectureId,
  sections,
  completedLectureIds,
}: LectureSidebarProps) {
  const totalLectures = sections.reduce((sum, s) => sum + s.lectures.length, 0);
  const completedCount = completedLectureIds.size;
  const progressPercent = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  return (
    <aside className="hidden w-80 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50/50 backdrop-blur-xl lg:block">
      <div className="border-b border-gray-200 p-6 bg-white/50 sticky top-0 z-10 backdrop-blur-md">
        <Link
          href={`/${locale}/courses/${slug}`}
          className="group mb-4 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[var(--brand-primary)] transition-colors"
        >
          <ChevronLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          강의 페이지로 돌아가기
        </Link>
        <h2 className="text-sm font-bold text-gray-900 leading-tight mb-4">
          {courseTitle}
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-gray-500">
            <span>진행도 {progressPercent}%</span>
            <span>{completedCount}/{totalLectures}개 완료</span>
          </div>
          <ProgressBar value={progressPercent} className="h-1.5 bg-gray-200/50" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={section.id}>
            <div className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              섹션 {idx + 1} - {section.title}
            </div>
            <ul className="space-y-1">
              {section.lectures.map((lec) => {
                const isCurrent = lec.id === currentLectureId;
                const isCompleted = completedLectureIds.has(lec.id);
                return (
                  <li key={lec.id}>
                    <Link
                      href={`/${locale}/courses/${slug}/lectures/${lec.id}`}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 group relative overflow-hidden",
                        isCurrent
                          ? "bg-white shadow-sm ring-1 ring-black/5 text-[var(--brand-primary)] font-semibold"
                          : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : lec.type === "VIDEO" ? (
                        <PlayCircle className={cn("h-4 w-4 shrink-0", isCurrent ? "fill-red-50" : "text-gray-400")} />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                      )}

                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">{lec.title}</span>
                        <span className={cn("text-[10px] mt-0.5", isCurrent ? "text-[var(--brand-primary)]/70" : "text-gray-400")}>
                          {formatDuration(lec.duration ?? 0)}
                        </span>
                      </div>

                      {isCurrent && (
                        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-[var(--brand-primary)] rounded-r-full" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
