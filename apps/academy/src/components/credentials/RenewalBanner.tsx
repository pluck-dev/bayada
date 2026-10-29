import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/labels";
import { daysLeft } from "@/lib/credentials";

/** 갱신 알림 배너 (메일 대신 화면 안 알림). 대상 계산·renewalNotifiedAt 기록은 takeRenewalNotices 가 한다 */
export function RenewalBanner({
  locale,
  items,
}: {
  locale: string;
  items: { id: string; number: string; expiresAt: Date | null; program: { slug: string; title: string } }[];
}) {
  if (items.length === 0) return null;
  const now = new Date();
  return (
    <div role="status" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        만료가 다가오는 바야다 인증이 있어요
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((c) => (
          <li key={c.id} className="flex flex-col gap-2 rounded-xl bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{c.program.title}</p>
              <p className="mt-0.5 text-xs text-muted">
                <span className="font-mono">{c.number}</span> · {c.expiresAt && `${formatDate(c.expiresAt)} 만료`}
                {c.expiresAt && <span className="ml-1.5 font-semibold text-amber-700">D-{daysLeft(c.expiresAt, now)}</span>}
              </p>
            </div>
            <Link
              href={`/${locale}/certifications/${encodeURIComponent(c.program.slug)}`}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-ink px-3.5 text-sm font-semibold text-white hover:bg-ink-soft"
            >
              갱신 신청하기
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
