import { Badge, Breadcrumb, EmptyState, PageHeader, ProgressBar, SectionHeader, StatCard, buttonVariants, cn, type BadgeTone } from "@bayada/ui";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, Download, ShieldAlert, Users } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import {
  canManageOrg,
  getAssignableCourses,
  getOrgDashboard,
  DUE_SOON_DAYS,
  EXPIRY_SOON_DAYS,
} from "@/lib/queries/business";
import { JOB_ROLE_LABEL, formatDate } from "@/lib/labels";
import { getSiteSettings } from "@/lib/site-settings";
import { inquiryHref } from "@bayada/shared/site-settings";
import { BusinessActions } from "@/components/business/BusinessActions";
import { PendingInvites } from "@/components/business/PendingInvites";

export const metadata: Metadata = { title: "기관 대시보드", robots: { index: false, follow: false } };

const DAY = 24 * 60 * 60 * 1000;

function dueLabel(dueAt: Date | null, now: Date) {
  if (!dueAt) return { text: "기한 없음", tone: "text-muted" };
  const days = Math.ceil((dueAt.getTime() - now.getTime()) / DAY);
  if (days < 0) return { text: `기한 ${-days}일 지남`, tone: "text-danger font-semibold" };
  if (days <= DUE_SOON_DAYS)
    return { text: days === 0 ? "오늘 마감" : `D-${days}`, tone: "text-warning font-semibold" };
  return { text: `${formatDate(dueAt)}까지`, tone: "text-muted" };
}

export default async function BusinessDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/business`)}`);

  if (!canManageOrg(viewer)) {
    const inquiry = inquiryHref((await getSiteSettings()).inquiry);
    return (
      <div className="container-page section-y">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-sunken text-ink-soft">
            <ShieldAlert className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-6 text-caption font-semibold tracking-[0.2em] text-muted">403</p>
          <h1 className="mt-2 text-h2 text-ink">기관 관리자 전용 화면이에요</h1>
          <p className="mt-3 text-body leading-relaxed text-muted">
            {viewer.organizationId
              ? "소속 기관의 관리자 권한이 있는 계정만 볼 수 있어요. 권한이 필요하면 기관 담당자에게 요청해 주세요."
              : "기관에 소속된 관리자 계정만 볼 수 있어요. 센터 단위 도입을 원하시면 문의해 주세요."}
          </p>
          <div className="mt-8 flex gap-2">
            <Link
              href={`/${locale}/dashboard`}
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              마이 러닝으로
            </Link>
            {!viewer.organizationId && (
              <a
                href={inquiry}
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                기관 도입 문의
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  const [data, courses] = await Promise.all([getOrgDashboard(viewer.organizationId), getAssignableCourses(viewer)]);
  const { stats, members } = data;
  const now = new Date();
  const hasAssignments = stats.assignedTotal > 0;

  const kpis = [
    {
      label: "등록 직원",
      value: `${stats.memberCount.toLocaleString()}명`,
      sub: [
        `관리자 ${stats.adminCount}명`,
        stats.pendingMemberCount ? `가입 승인 대기 ${stats.pendingMemberCount}명` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      warn: false,
    },
    hasAssignments
      ? {
          label: "배정 과정 이수율",
          value: `${stats.assignedRate}%`,
          sub: `${stats.assignedTotal}건 중 ${stats.assignedDone}건 이수`,
          warn: false,
        }
      : {
          label: "전체 수강 수료율",
          value: stats.completionRate === null ? "-" : `${stats.completionRate}%`,
          sub: `수강 ${stats.enrolledTotal.toLocaleString()}건 중 ${stats.completedTotal.toLocaleString()}건 수료`,
          warn: false,
        },
    {
      label: "미이수 배정",
      value: `${stats.pendingCount}건`,
      sub: stats.dueSoonCount ? `${DUE_SOON_DAYS}일 내 마감·기한 지남 ${stats.dueSoonCount}건` : "기한 임박 없음",
      warn: stats.dueSoonCount > 0,
    },
    {
      label: `${EXPIRY_SOON_DAYS}일 내 만료 예정 수료증`,
      value: `${stats.expiringCount}건`,
      sub: stats.expiringCount ? "갱신 교육을 배정해 주세요" : "만료 예정 없음",
      warn: stats.expiringCount > 0,
    },
  ];

  return (
    <div className="container-page page-y">
      <PageHeader
        breadcrumb={<Breadcrumb LinkComponent={Link} items={[{ label: "홈", href: `/${locale}` }, { label: "기관 대시보드" }]} />}
        eyebrow="기관 대시보드"
        title={data.organization?.name ?? viewer.organizationName}
        description={`직원 ${stats.memberCount.toLocaleString()}명 · 관리자 ${stats.adminCount}명${
          data.invites.length > 0 ? ` · 초대 대기 ${data.invites.length}명` : ""
        }`}
        actions={
          <BusinessActions
            locale={locale}
            courses={courses.map((c) => ({ id: c.id, title: c.title, category: c.category?.name ?? null }))}
            members={members
              .filter((m) => m.status === "APPROVED")
              .map((m) => ({ id: m.id, name: m.name, email: m.email, jobRole: m.jobRole }))}
          />
        }
      />

      {/* 현황 요약 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <StatCard
            key={k.label}
            label={k.label}
            value={<span className={k.warn ? "text-warning" : undefined}>{k.value}</span>}
            hint={k.sub}
          />
        ))}
      </div>

      {/* 미이수 · 만료 예정 */}
      {(data.pending.length > 0 || data.expiring.length > 0) && (
        <section className="mt-14">
          <SectionHeader
            size="sm"
            title={
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" aria-hidden /> 챙겨야 할 교육
              </span>
            }
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {data.pending.length > 0 && (
              <div className="rounded-xl border border-line bg-canvas">
                <p className="border-b border-line px-5 py-3 text-body-sm font-semibold text-ink">
                  미이수 배정 {data.pending.length}건
                </p>
                <ul className="max-h-80 divide-y divide-line-soft overflow-y-auto">
                  {data.pending.slice(0, 30).map((p) => {
                    const due = dueLabel(p.dueAt, now);
                    return (
                      <li key={`${p.memberId}-${p.courseId}`} className="flex items-center gap-4 px-5 py-3 text-body-sm">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink">
                            {p.name}
                            {p.jobRole && (
                              <span className="ml-1.5 text-caption font-normal text-muted">{JOB_ROLE_LABEL[p.jobRole]}</span>
                            )}
                          </p>
                          <p className="truncate text-caption text-muted">{p.title}</p>
                        </div>
                        <span className="shrink-0 text-caption text-ink-soft">{p.progress}%</span>
                        <span className={`w-24 shrink-0 text-right text-caption ${due.tone}`}>{due.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {data.expiring.length > 0 && (
              <div className="rounded-xl border border-line bg-canvas">
                <p className="border-b border-line px-5 py-3 text-body-sm font-semibold text-ink">
                  {EXPIRY_SOON_DAYS}일 내 만료 예정 수료증 {data.expiring.length}건
                </p>
                <ul className="max-h-80 divide-y divide-line-soft overflow-y-auto">
                  {data.expiring.map((c) => (
                    <li key={c.number} className="flex items-center gap-4 px-5 py-3 text-body-sm">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">{c.name}</p>
                        <p className="truncate text-caption text-muted">{c.title}</p>
                      </div>
                      <span className="shrink-0 text-caption font-semibold text-warning">
                        {formatDate(c.expiresAt)} 만료
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 직원별 이수 현황 */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeader
            size="sm"
            className="mb-0"
            title="직원별 이수 현황"
            description="배정 과정 이수 수와 전체 수강·수료 수를 함께 보여 드려요."
          />
          <a
            href="/api/v1/business/export"
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            <Download className="h-4 w-4" aria-hidden /> CSV 다운로드
          </a>
        </div>
        {members.length === 0 ? (
          <EmptyState
            framed
            className="mt-4"
            icon={<Users />}
            title="아직 등록된 직원이 없어요"
            description="‘직원 초대’로 초대 링크를 만들어 전달해 주세요."
          />
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-canvas">
            <table className="w-full min-w-[760px] text-left text-body-sm">
              <thead className="bg-surface text-caption font-semibold text-muted [&_th]:border-b [&_th]:border-line">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    이름
                  </th>
                  <th scope="col" className="px-5 py-3">
                    직군
                  </th>
                  <th scope="col" className="px-5 py-3">
                    배정 과정
                  </th>
                  <th scope="col" className="px-5 py-3">
                    배정 이수
                  </th>
                  <th scope="col" className="px-5 py-3">
                    전체 수강 · 수료
                  </th>
                  <th scope="col" className="px-5 py-3">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft [&_tr:hover]:bg-surface">
                {members.map((m) => {
                  const total = m.assigned.length;
                  const overdue = m.assigned.some((a) => !a.completedAt && a.dueAt && a.dueAt < now);
                  const status =
                    m.status === "PENDING"
                      ? { label: "가입 승인 대기", tone: "warning" as BadgeTone }
                      : m.status === "REJECTED"
                        ? { label: "가입 거절", tone: "neutral" as BadgeTone }
                        : total === 0
                          ? { label: "배정 없음", tone: "neutral" as BadgeTone }
                          : m.assignedDone === total
                            ? { label: "이수", tone: "success" as BadgeTone }
                            : overdue
                              ? { label: "기한 지남", tone: "danger" as BadgeTone }
                              : m.assigned.some((a) => a.progress > 0)
                                ? { label: "진행 중", tone: "info" as BadgeTone }
                                : { label: "미시작", tone: "neutral" as BadgeTone };
                  const pct = total ? Math.round((m.assignedDone / total) * 100) : 0;
                  return (
                    <tr key={m.id} className="align-middle">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-ink">
                          {m.name}
                          {m.isOrgAdmin && <Badge className="ml-1.5 align-middle">관리자</Badge>}
                        </p>
                        <p className="text-caption text-muted">{m.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-ink-soft">{m.jobRole ? JOB_ROLE_LABEL[m.jobRole] : "-"}</td>
                      <td className="max-w-[240px] px-5 py-3.5 text-ink-soft">
                        {total === 0 ? (
                          <span className="text-muted">-</span>
                        ) : (
                          <span className="line-clamp-1" title={m.assigned.map((a) => a.title).join(", ")}>
                            {m.assigned[0].title}
                            {total > 1 && <span className="text-muted"> 외 {total - 1}</span>}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {total === 0 ? (
                          <span className="text-muted">-</span>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <ProgressBar value={pct} size="sm" className="w-20" />
                            <span className="tabular text-caption font-semibold text-ink">
                              {m.assignedDone}/{total}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-ink-soft">
                        {m.enrolledCount}개 · <span className="font-semibold text-ink">{m.completedCount}개 수료</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={status.tone} dot>
                          {status.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 초대 대기 */}
      {data.invites.length > 0 && (
        <section className="mt-14">
          <SectionHeader
            size="sm"
            title={`초대 대기 ${data.invites.length}명`}
            description="링크를 받은 직원이 초대받은 이메일로 로그인하면 자동으로 기관에 합류해요."
          />
          <div>
            <PendingInvites
              locale={locale}
              invites={data.invites.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() }))}
            />
          </div>
        </section>
      )}
    </div>
  );
}
