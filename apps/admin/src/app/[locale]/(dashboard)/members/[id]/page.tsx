import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { getMember } from "@/lib/queries/admin";
import { getRoleDefs } from "@/lib/roles";
import {
  COURSE_STATUS_LABEL,
  COURSE_STATUS_TONE,
  JOB_ROLE_LABEL,
  ROLES,
  ROLE_LABEL,
  USER_STATUS_LABEL,
  USER_STATUS_TONE,
  formatDate,
} from "@/lib/labels";
import { Badge, Card, EmptyState, PageHeader, Stat, cx, tableClass, tdClass, thClass, trClass } from "@/components/ui";
import { MemberControls } from "@/components/members/MemberControls";

export default async function MemberDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const user = await requirePage("member.read", locale);
  const [m, roleDefs] = await Promise.all([getMember(id), getRoleDefs()]);
  if (!m) notFound();
  const customRoles = roleDefs.filter((r) => !r.isSystem);
  const roleName = m.customRoleKey ? (customRoles.find((r) => r.key === m.customRoleKey)?.name ?? m.customRoleKey) : ROLE_LABEL[m.role];
  const adminKeys = new Set(roleDefs.filter((r) => r.permissions.length > 0).map((r) => r.key));
  // 역할 선택지 — 시스템 역할 + 사용자 정의 역할. admin=어드민 콘솔에 들어올 수 있는 역할(확인 대화상자)
  const roleOptions = [
    ...ROLES.map((r) => ({ key: r, label: ROLE_LABEL[r], custom: false, admin: adminKeys.has(r) })),
    ...customRoles.map((r) => ({ key: r.key, label: r.name, custom: true, admin: adminKeys.has(r.key) })),
  ];
  const completed = m.enrollments.filter((e) => e.completedAt).length;
  const avg = m.enrollments.length ? Math.round(m.enrollments.reduce((n, e) => n + e.progressPercent, 0) / m.enrollments.length) : 0;
  const canWrite = can(user, "member.write") && m.id !== user.id;

  return (
    <>
      <PageHeader
        back={{ href: `/${locale}/members`, label: "회원 · 수강" }}
        title={m.name ?? m.email}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={USER_STATUS_TONE[m.status]} dot>
              {USER_STATUS_LABEL[m.status]}
            </Badge>
            <span>{m.email}</span>
            <span className="text-subtle">·</span>
            <span>{roleName}</span>
            <span className="text-subtle">·</span>
            <span>{m.organization ? `${m.organization.name}${m.organization.isInternal ? " (사내)" : ""}` : "외부 개인"}</span>
          </span>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid grid-cols-4 gap-3">
            <Stat label="수강" value={m.enrollments.length} />
            <Stat label="수료" value={completed} />
            <Stat label="평균 진도" value={`${avg}%`} />
            <Stat label="수료증" value={m.certificates.length} />
          </div>

          <Card title="수강 현황" padded={false}>
            {m.enrollments.length === 0 ? (
              <EmptyState title="수강 기록이 없습니다" />
            ) : (
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>프로그램</th>
                    <th className={thClass}>진도</th>
                    <th className={thClass}>신청일</th>
                    <th className={thClass}>수료일</th>
                  </tr>
                </thead>
                <tbody>
                  {m.enrollments.map((e) => (
                    <tr key={e.id} className={trClass}>
                      <td className={cx(tdClass, "whitespace-normal!")}>
                        {can(user, "program.read") ? (
                          <Link href={`/${locale}/programs/${e.course.id}`} className="hover:underline">
                            {e.course.title}
                          </Link>
                        ) : (
                          e.course.title
                        )}
                        {e.course.status !== "PUBLISHED" && (
                          <span className="ml-2">
                            <Badge tone={COURSE_STATUS_TONE[e.course.status]}>{COURSE_STATUS_LABEL[e.course.status]}</Badge>
                          </span>
                        )}
                      </td>
                      <td className={tdClass}>
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-100">
                            <span
                              className={cx("block h-full rounded-full", e.completedAt ? "bg-emerald-500" : "bg-zinc-700")}
                              style={{ width: `${e.progressPercent}%` }}
                            />
                          </span>
                          <span className="tabular text-[12px] text-zinc-600">{e.progressPercent}%</span>
                        </div>
                      </td>
                      <td className={cx(tdClass, "tabular text-zinc-500")}>{formatDate(e.createdAt)}</td>
                      <td className={cx(tdClass, "tabular text-zinc-500")}>{formatDate(e.completedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card title="수료증" padded={false}>
            {m.certificates.length === 0 ? (
              <EmptyState title="발급된 수료증이 없습니다" />
            ) : (
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>번호</th>
                    <th className={thClass}>프로그램</th>
                    <th className={thClass}>발급일</th>
                    <th className={thClass}>만료일</th>
                  </tr>
                </thead>
                <tbody>
                  {m.certificates.map((c) => (
                    <tr key={c.id} className={trClass}>
                      <td className={cx(tdClass, "font-mono text-[12px]")}>{c.number}</td>
                      <td className={cx(tdClass, "whitespace-normal!")}>{c.course.title}</td>
                      <td className={cx(tdClass, "tabular text-zinc-500")}>{formatDate(c.issuedAt)}</td>
                      <td className={cx(tdClass, "tabular text-zinc-500")}>{formatDate(c.expiresAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card title="회원 정보">
            <dl className="grid grid-cols-[72px_1fr] gap-y-2 text-[12.5px]">
              <dt className="text-muted">직군</dt>
              <dd>{m.jobRole ? JOB_ROLE_LABEL[m.jobRole] : "-"}</dd>
              <dt className="text-muted">연락처</dt>
              <dd>{m.phone ?? "-"}</dd>
              <dt className="text-muted">가입일</dt>
              <dd className="tabular">{formatDate(m.createdAt)}</dd>
              <dt className="text-muted">이전 ID</dt>
              <dd className="tabular">{m.legacyWpId ? `WP #${m.legacyWpId}` : "-"}</dd>
            </dl>
          </Card>
          {canWrite ? (
            <Card title="관리">
              <MemberControls id={m.id} status={m.status} roleKey={m.customRoleKey ?? m.role} options={roleOptions} />
            </Card>
          ) : (
            can(user, "member.write") || (
              <p className="px-1 text-[12px] text-muted">회원 관리 권한이 없어 조회만 할 수 있습니다.</p>
            )
          )}
        </aside>
      </div>
    </>
  );
}
