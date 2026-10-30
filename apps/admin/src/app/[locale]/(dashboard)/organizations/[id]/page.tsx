import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/session";
import { getOrganization } from "@/lib/queries/organizations";
import { JOB_ROLE_LABEL, ROLE_LABEL, USER_STATUS_LABEL, USER_STATUS_TONE, formatDate } from "@/lib/labels";
import { Badge, Card, EmptyState, PageHeader, Stat, cx, tableClass, tdClass, thClass, trClass } from "@/components/ui";
import { OrgAdminButton } from "@/components/organizations/OrgControls";

export default async function OrganizationDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const user = await requirePage("commerce", locale);
  const org = await getOrganization(id);
  if (!org) notFound();
  const admins = org.users.filter((u) => u.role === "ORG_ADMIN").length;
  const assigned = org.courses.reduce((n, c) => n + c.assigned, 0);
  const completed = org.courses.reduce((n, c) => n + c.completed, 0);

  return (
    <>
      <PageHeader
        back={{ href: `/${locale}/organizations`, label: "기관" }}
        title={
          <span className="flex items-center gap-2">
            {org.name}
            {org.isInternal && <Badge tone="violet">사내</Badge>}
          </span>
        }
        description={`사업자등록번호 ${org.bizNo ?? "-"} · 담당자 ${org.contact ?? "-"} · 등록 ${formatDate(org.createdAt)}`}
      />

      <div className="grid grid-cols-4 gap-3">
        <Stat label="소속 인원" value={`${org.users.length}명`} />
        <Stat label="기관 관리자" value={`${admins}명`} />
        <Stat label="대기 중 초대" value={`${org.invites.length}건`} />
        <Stat
          label="과정 배정 수료율"
          value={assigned ? `${Math.round((completed / assigned) * 100)}%` : "-"}
          hint={assigned ? `배정 ${assigned}건 중 수료 ${completed}건` : "배정 없음"}
        />
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_340px] items-start gap-4">
        <Card title={`소속 회원 (${org.users.length}명)`} padded={false}>
          {org.users.length === 0 ? (
            <EmptyState title="소속 회원이 없습니다" description="기관 관리자가 직원을 초대하면 가입과 함께 소속됩니다." />
          ) : (
            <div className="max-h-[640px] overflow-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>이름</th>
                    <th className={thClass}>이메일</th>
                    <th className={thClass}>직군</th>
                    <th className={thClass}>역할</th>
                    <th className={thClass}>가입일</th>
                    <th className={cx(thClass, "w-px")} aria-label="작업" />
                  </tr>
                </thead>
                <tbody>
                  {org.users.map((m) => {
                    const editable = (m.role === "STUDENT" || m.role === "ORG_ADMIN") && !m.customRoleKey && m.id !== user.id;
                    return (
                      <tr key={m.id} className={trClass}>
                        <td className={cx(tdClass, "font-medium")}>
                          <Link href={`/${locale}/members/${m.id}`} className="hover:underline">
                            {m.name ?? "-"}
                          </Link>
                        </td>
                        <td className={cx(tdClass, "text-muted")}>{m.email}</td>
                        <td className={cx(tdClass, "text-muted")}>{m.jobRole ? JOB_ROLE_LABEL[m.jobRole] : "-"}</td>
                        <td className={tdClass}>
                          <span className="flex items-center gap-1.5">
                            <Badge tone={m.role === "ORG_ADMIN" ? "amber" : m.role === "STUDENT" ? "zinc" : "blue"}>{ROLE_LABEL[m.role]}</Badge>
                            {m.status !== "APPROVED" && <Badge tone={USER_STATUS_TONE[m.status]}>{USER_STATUS_LABEL[m.status]}</Badge>}
                          </span>
                        </td>
                        <td className={cx(tdClass, "tabular text-subtle")}>{formatDate(m.createdAt)}</td>
                        <td className={cx(tdClass, "text-right")}>
                          {editable && (
                            <OrgAdminButton orgId={org.id} userId={m.id} name={m.name ?? m.email} isAdmin={m.role === "ORG_ADMIN"} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card title={`대기 중 초대 (${org.invites.length})`} padded={false}>
            {org.invites.length === 0 ? (
              <p className="px-4 py-6 text-center text-caption text-muted">수락 대기 중인 초대가 없습니다.</p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {org.invites.map((i) => (
                  <li key={i.id} className="flex items-center gap-2 px-4 py-2 text-caption">
                    <span className="flex-1 truncate">{i.email}</span>
                    <span className="tabular text-subtle">{formatDate(i.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="과정 배정 현황" padded={false}>
            {org.courses.length === 0 ? (
              <p className="px-4 py-6 text-center text-caption text-muted">기관 관리자가 배정한 과정이 없습니다.</p>
            ) : (
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>과정</th>
                    <th className={cx(thClass, "text-right")}>수료 / 배정</th>
                  </tr>
                </thead>
                <tbody>
                  {org.courses.map((c) => (
                    <tr key={c.courseId} className={trClass}>
                      <td className={cx(tdClass, "max-w-[200px] whitespace-normal!")}>
                        <Link href={`/${locale}/programs/${c.courseId}`} className="hover:underline">
                          {c.title}
                        </Link>
                        {c.nextDue && <p className="tabular text-micro text-subtle">가장 빠른 기한 {formatDate(c.nextDue)}</p>}
                      </td>
                      <td className={cx(tdClass, "tabular text-right")}>
                        {c.completed} / {c.assigned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
