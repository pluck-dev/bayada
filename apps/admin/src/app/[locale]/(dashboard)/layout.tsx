import { redirect } from "next/navigation";
import { prisma } from "@bayada/db";
import { getAdminUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { QUEUE_STATUSES } from "@/lib/workflow";
import { OPEN_REPORT_WHERE } from "@/lib/queries/reviews";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getAdminUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // 사이드바 배지 — 역할이 처리할 수 있는 항목만 센다
  const clinicalOnly = can(user, "workflow.clinical") && !can(user, "workflow.operate");
  const queueStatuses = clinicalOnly ? (["CLINICAL_REVIEW"] as const) : QUEUE_STATUSES;
  const [queue, signups, reports] = await Promise.all([
    can(user, "approval.queue") ? prisma.course.count({ where: { status: { in: [...queueStatuses] } } }) : Promise.resolve(0),
    can(user, "member.read") ? prisma.user.count({ where: { status: "PENDING" } }) : Promise.resolve(0),
    can(user, "review") ? prisma.review.count({ where: OPEN_REPORT_WHERE }) : Promise.resolve(0),
  ]);
  // 바야다 인증: 심사위원은 평가 대기·평가 중, 운영자는 승인 대기를 센다
  const credentialTodo = [
    ...(can(user, "credential.evaluate") ? (["SUBMITTED", "EVALUATING"] as const) : []),
    ...(can(user, "credential.approve") ? (["EVALUATED"] as const) : []),
  ];
  const credentials = credentialTodo.length
    ? await prisma.credentialApplication.count({ where: { status: { in: credentialTodo } } })
    : 0;
  // 홈페이지 문의 CRM: 아직 아무도 손대지 않은 신규 문의
  const inquiries = can(user, "web.inquiries") ? await prisma.webInquiry.count({ where: { status: "NEW" } }) : 0;

  return (
    <div className="flex min-h-screen bg-[linear-gradient(to_right,var(--color-side)_256px,var(--color-console)_256px)]">
      <Sidebar
        locale={locale}
        permissions={user.permissions}
        roleName={user.roleName}
        isPartner={user.role === "PARTNER_ADMIN"}
        isSuperAdmin={user.roleKey === "ADMIN"}
        userName={user.name ?? user.email}
        userEmail={user.email}
        counts={{ queue, signups, reports, credentials, inquiries }}
      />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1360px] px-10 pb-16 pt-9">{children}</div>
      </main>
    </div>
  );
}
