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
import { Award, ClipboardCheck, GraduationCap, History, UserPlus } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, Stat, TextLink, cx, qs } from "@/components/ui";

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

  const todo = [
    { label: "승인 대기 프로그램", value: queueTotal, href: `${base}/approvals`, show: can(user, "approval.queue") },
    { label: "가입 승인 대기", value: d.pendingSignups, href: qs(`${base}/members`, { status: "PENDING" }), show: can(user, "member.read") },
    { label: "미처리 신고 후기", value: d.openReports, href: qs(`${base}/reviews`, { filter: "reported" }), show: can(user, "review") },
    { label: "14일 안에 시작하는 실습", value: d.upcomingSessions, href: `${base}/sessions`, show: can(user, "session") },
  ];

  return (
    <>
      <PageHeader title={`안녕하세요, ${user.name ?? "관리자"}님`} description="아카데미 운영 현황입니다. 모든 숫자는 실제 데이터 기준입니다." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat
          tone="brand"
          label="승인 대기"
          value={queueTotal.toLocaleString()}
          unit="개"
          hint="제출 ~ 게시 대기 프로그램"
          icon={<ClipboardCheck />}
          href={can(user, "approval.queue") ? `${base}/approvals` : undefined}
        />
        <Stat tone="ink" label={`${monthLabel} 신규 수강`} value={d.enrollmentsMonth.toLocaleString()} unit="건" hint="이번 달 수강 신청" icon={<UserPlus />} />
        <Stat label={`${monthLabel} 수료`} value={d.completionsMonth.toLocaleString()} unit="명" hint="이번 달 수료 완료" icon={<GraduationCap />} />
        <Stat label={`${monthLabel} 수료증`} value={d.certificatesMonth.toLocaleString()} unit="장" hint="이번 달 발급" icon={<Award />} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card title="프로그램 상태" description={`전체 ${totalPrograms}개`} actions={<TextLink href={`${base}/programs`}>전체 보기</TextLink>}>
          <ul className="flex flex-col gap-1">
            {COURSE_STATUSES.map((s) => {
              const n = d.statusCounts[s] ?? 0;
              const pct = totalPrograms ? (n / totalPrograms) * 100 : 0;
              return (
                <li key={s}>
                  <Link
                    href={qs(`${base}/programs`, { status: s })}
                    className="group grid grid-cols-[128px_1fr_48px] items-center gap-4 rounded-xl px-2 py-2 transition-colors hover:bg-wash"
                  >
                    <Badge tone={COURSE_STATUS_TONE[s]} dot>
                      {COURSE_STATUS_LABEL[s]}
                    </Badge>
                    <span className="h-2 overflow-hidden rounded-full bg-wash-strong">
                      <span className="block h-full rounded-full bg-ink transition-colors group-hover:bg-brand" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="num text-right text-[14px] font-extrabold text-ink">{n}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 rounded-2xl bg-wash px-4 py-3 text-[13px] text-muted">
            게시 중 <b className="num font-extrabold text-ink">{d.statusCounts.PUBLISHED ?? 0}</b>개 — 사내{" "}
            <b className="num font-bold text-ink">{d.visibilityCounts.INTERNAL ?? 0}</b> · 외부 공개{" "}
            <b className="num font-bold text-ink">{d.visibilityCounts.PUBLIC ?? 0}</b>
          </p>
        </Card>

        <Card title="처리 대기">
          <ul className="flex flex-col gap-2">
            {todo
              .filter((t) => t.show)
              .map((t) => (
                <li key={t.label}>
                  <Link
                    href={t.href}
                    className="flex h-12 items-center justify-between rounded-2xl bg-wash px-4 text-[13.5px] font-bold text-ink transition-colors hover:bg-wash-strong"
                  >
                    {t.label}
                    <span
                      className={cx(
                        "num inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[12px] font-extrabold",
                        t.value > 0 ? "bg-ink text-white" : "text-subtle",
                      )}
                    >
                      {t.value}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="검토 대기" description="오래된 순" padded={false}>
          {d.queue.length === 0 ? (
            <EmptyState icon={<ClipboardCheck />} title="대기 중인 프로그램이 없습니다" />
          ) : (
            <ul className="px-3 pb-3">
              {d.queue.map((q) => (
                <li key={q.id}>
                  <Link href={`${base}/approvals/${q.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors hover:bg-wash">
                    <span className="flex-1 truncate font-bold">{q.title}</span>
                    <Badge tone={COURSE_STATUS_TONE[q.status]}>{COURSE_STATUS_LABEL[q.status]}</Badge>
                    <span className="num w-[132px] shrink-0 text-right text-[12.5px] text-subtle">{formatDateTime(q.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="최근 활동" padded={false} actions={can(user, "audit") && <TextLink href={`${base}/audit`}>감사 로그</TextLink>}>
          {d.recent.length === 0 ? (
            <EmptyState icon={<History />} title="아직 기록된 활동이 없습니다" description="프로그램·배너·회원 변경이 감사 로그에 쌓입니다." />
          ) : (
            <ul className="px-3 pb-3">
              {d.recent.map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px]">
                  <span className="w-[96px] shrink-0 truncate font-bold text-ink">{AUDIT_ACTION_LABEL[r.action] ?? r.action}</span>
                  <span className="flex-1 truncate text-muted">{names.get(r.target) ?? r.target}</span>
                  <span className="shrink-0 font-semibold text-ink-soft">{r.actor?.name ?? r.actor?.email ?? "시스템"}</span>
                  <span className="num w-[120px] shrink-0 text-right text-[12.5px] text-subtle">{formatDateTime(r.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
