"use client";

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@bayada/ui";
import { CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LectureActionsProps {
  locale: string;
  slug: string;
  lectureId: string;
  isCompleted: boolean;
  prevLecture: { id: string; title: string } | null;
  nextLecture: { id: string; title: string } | null;
}

export function LectureActions({
  locale,
  slug,
  lectureId,
  isCompleted: initialCompleted,
  prevLecture,
  nextLecture,
}: LectureActionsProps) {
  const { data: session } = useSession();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const markComplete = useCallback(async () => {
    if (!session?.user || completed) return;
    setLoading(true);
    try {
      await fetch(`/api/v1/progress/${lectureId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      setCompleted(true);
      router.refresh();
    } catch {
      // 무시
    } finally {
      setLoading(false);
    }
  }, [session, completed, lectureId, router]);

  const updateWatchedSec = useCallback(async (watchedSec: number) => {
    if (!session?.user) return;
    try {
      await fetch(`/api/v1/progress/${lectureId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchedSec }),
      });
    } catch {
      // 무시
    }
  }, [session, lectureId]);

  return (
    <div className="flex items-center justify-between mt-6">
      <div>
        {session?.user && (
          <Button
            variant={completed ? "outline" : "brand"}
            size="sm"
            className={
              completed
                ? "rounded-full px-4 border-emerald-300 text-emerald-600"
                : "rounded-full px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
            }
            onClick={markComplete}
            disabled={completed || loading}
          >
            {loading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-1 h-4 w-4" />
            )}
            {completed ? "학습 완료" : "완료로 표시"}
          </Button>
        )}
      </div>
      <div className="flex gap-3">
        {prevLecture && (
          <Link href={`/${locale}/courses/${slug}/lectures/${prevLecture.id}`}>
            <Button variant="outline" size="sm" className="rounded-full px-4 border-gray-300">
              <ChevronLeft className="mr-1 h-4 w-4" /> 이전 강의
            </Button>
          </Link>
        )}
        {nextLecture && (
          <Link href={`/${locale}/courses/${slug}/lectures/${nextLecture.id}`}>
            <Button size="sm" className="rounded-full px-4 bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white shadow-lg shadow-red-500/20">
              다음 강의 <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
