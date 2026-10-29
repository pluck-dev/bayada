import Link from "next/link";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { getDashboard, resolveTargets } from "@/lib/queries/admin";
import {
  AUDIT_ACTION_LABEL,
  COURSE_STATUSES,
  COURSE_STATUS_LABEL,
  COURSE_STATUS_TONE,
  formatDateTime,
} from "@/lib/labels";
import { QUEUE_STATUSES } from "@/lib/workflow";
import { Badge, Card, EmptyState, PageHeader, Stat, qs } from "@/components/ui";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requirePage("dashboard", locale);
  const d = await getDashboard();
  const names = await resolveTargets(d.recent.map((r) => r.target));
  const queueTotal = QUEUE_STATUSES.reduce((n, s) => n + (d.statusCounts[s] ?? 0), 0);
  const totalPrograms = COURSE_STATUSES.reduce((n, s) => n + (d.statusCounts[s] ?? 0), 0);
  // since 는 KST 1일 0시(UTC 로는 전날 15시) — KST 로 옮겨 월을 읽는다
  const monthLabel = `${new Date(d.since.getTime() + 9 * 3600_000).getUTCMonth() + 1}월`;
  const base = `/${locale}`;

  return (
    <>
      <PageHeader title={`안녕하세요, ${user.name ?? "관리자"}님`} description="아카데미 운영 현황입니다. 모든 숫자는 실제 데이터 기준입니다." />

      <div className="grid grid-cols-7 gap-3">
        <Stat label="승인 대기" value={queueTotal} hint="제출 ~ 게시 대기" href={`${base}/approvals`} />
        <Stat
          label="가입 승인 대기"
          value={d.pendingSignups}
          hint="회원 가입 신청"
          href={can(user, "member.read") ? qs(`${base}/members`, { status: "PENDING" }) : undefined}
        />
        <Stat label={`${monthLabel} 신규 수강`} value={d.enrollmentsMonth.toLocaleString()} hint="이번 달 수강 신청" />
        <Stat label={`${monthLabel} 수료`} value={d.completionsMonth.toLocaleString()} hint="이번 달 완료" />
        <Stat label={`${monthLabel} 수료증`} value={d.certificatesMonth.toLocaleString()} hint="이번 달 발급" />
        <Stat
          label="미처리 신고 후기"
          value={d.openReports}
          hint="게시 중 · 신고 접수"
          href={can(user, "review") ? qs(`${base}/reviews`, { filter: "reported" }) : undefined}
        />
        <Stat
          label="다가오는 실습"
          value={d.upcomingSessions}
          hint="14일 안에 시작"
          href={can(user, "session") ? `${base}/sessions` : undefined}
        />
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
        <Card title={`프로그램 상태 · 전체 ${totalPrograms}개`} actions={<Link href={`${base}/programs`} className="text-[12px] text-muted hover:text-fg">전체 보기</Link>}>
          <ul className="flex flex-col gap-2">
            {COURSE_STATUSES.map((s) => {
              const n = d.statusCounts[s] ?? 0;
              const pct = totalPrograms ? (n / totalPrograms) * 100 : 0;
              return (
                <li key={s}>
                  <Link href={qs(`${base}/programs`, { status: s })} className="group grid grid-cols-[120px_1fr_40px] items-center gap-3 text-[13px]">
                    <Badge tone={COURSE_STATUS_TONE[s]} dot>
                      {COURSE_STATUS_LABEL[s]}
                    </Badge>
                    <span className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                      <span className="block h-full rounded-full bg-zinc-800 group-hover:bg-brand" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="tabular text-right text-zinc-700">{n}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 border-t border-line pt-3 text-[12px] text-muted">
            게시 중 {d.statusCounts.PUBLISHED ?? 0}개 — 사내 {d.visibilityCounts.INTERNAL ?? 0} · 외부 공개 {d.visibilityCounts.PUBLIC ?? 0}
          </p>
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="검토 대기 (오래된 순)" padded={false}>
            {d.queue.length === 0 ? (
              <EmptyState title="대기 중인 프로그램이 없습니다" />
            ) : (
              <ul className="divide-y divide-zinc-100">
                {d.queue.map((q) => (
                  <li key={q.id}>
                    <Link href={`${base}/approvals/${q.id}`} className="flex items-center gap-3 px-4 py-2.5 text-[13px] hover:bg-zinc-50">
                      <span className="flex-1 truncate font-medium">{q.title}</span>
                      <Badge tone={COURSE_STATUS_TONE[q.status]}>{COURSE_STATUS_LABEL[q.status]}</Badge>
                      <span className="tabular text-[12px] text-subtle">{formatDateTime(q.updatedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="최근 활동"
            padded={false}
            actions={can(user, "audit") && <Link href={`${base}/audit`} className="text-[12px] text-muted hover:text-fg">감사 로그</Link>}
          >
            {d.recent.length === 0 ? (
              <EmptyState title="아직 기록된 활동이 없습니다" description="프로그램·배너·회원 변경이 감사 로그에 쌓입니다." />
            ) : (
              <ul className="divide-y divide-zinc-100">
                {d.recent.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-4 py-2 text-[12.5px]">
                    <span className="w-[92px] shrink-0 font-medium">{AUDIT_ACTION_LABEL[r.action] ?? r.action}</span>
                    <span className="flex-1 truncate text-zinc-600">{names.get(r.target) ?? r.target}</span>
                    <span className="shrink-0 text-subtle">{r.actor?.name ?? r.actor?.email ?? "시스템"}</span>
                    <span className="tabular shrink-0 text-subtle">{formatDateTime(r.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
