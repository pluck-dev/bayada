"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@bayada/ui";
import { COURSE_STATUS_LABELS } from "@bayada/shared";
import type { CourseStatusType } from "@bayada/shared";
import { ChevronDown } from "lucide-react";

const statusBadgeVariant: Record<CourseStatusType, "default" | "success" | "secondary"> = {
  DRAFT: "secondary",
  PUBLISHED: "success",
  ARCHIVED: "default",
};

const allStatuses: CourseStatusType[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

interface CourseStatusToggleProps {
  courseId: string;
  currentStatus: CourseStatusType;
}

export function CourseStatusToggle({ courseId, currentStatus }: CourseStatusToggleProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSelect(status: CourseStatusType) {
    if (status === currentStatus) {
      setOpen(false);
      return;
    }

    setOpen(false);

    startTransition(async () => {
      const res = await fetch(`/api/v1/courses/${courseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        alert(body?.message ?? "상태 변경에 실패했습니다.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="flex items-center gap-1 disabled:opacity-50"
      >
        <Badge variant={statusBadgeVariant[currentStatus]}>
          {isPending ? "변경 중…" : COURSE_STATUS_LABELS[currentStatus]}
        </Badge>
        <ChevronDown className="h-3 w-3 text-[color:var(--muted)]" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[100px] rounded-md border border-[color:var(--border)] bg-[color:var(--card)] py-1 shadow-lg">
          {allStatuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSelect(s)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-[color:var(--accent)] ${
                s === currentStatus ? "font-semibold" : ""
              }`}
            >
              <Badge variant={statusBadgeVariant[s]}>
                {COURSE_STATUS_LABELS[s]}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
