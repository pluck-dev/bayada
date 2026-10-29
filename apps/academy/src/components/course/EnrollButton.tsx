"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

/** 무료 수강 신청 → 첫 레슨으로 이동 */
export function EnrollButton({
  courseId,
  locale,
  slug,
  loggedIn,
  className = "",
}: {
  courseId: string;
  locale: string;
  slug: string;
  loggedIn: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detailPath = `/${locale}/courses/${encodeURIComponent(slug)}`;

  async function enroll() {
    if (!loggedIn) {
      router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(detailPath)}`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = (await res.json().catch(() => ({}))) as { resumeLectureId?: string | null; error?: string };
      if (!res.ok) {
        setError(data.error ?? "수강 신청에 실패했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
      if (data.resumeLectureId) {
        router.push(`${detailPath}/lectures/${data.resumeLectureId}`);
      } else {
        router.refresh();
      }
    } catch {
      setError("네트워크 오류가 발생했어요. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={enroll}
        disabled={loading}
        className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-70 ${className}`}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {loggedIn ? "수강신청" : "로그인하고 수강신청"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-brand">
          {error}
        </p>
      )}
    </div>
  );
}
