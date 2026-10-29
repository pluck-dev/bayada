import { redirect } from "next/navigation";
import { prisma } from "@bayada/db";
import { getAdminUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { QUEUE_STATUSES } from "@/lib/workflow";
import { Sidebar } from "@/components/Sidebar";
import { FeedbackProvider } from "@/components/ui/feedback";

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
  const queueStatuses = user.role === "CLINICAL_REVIEWER" ? (["CLINICAL_REVIEW"] as const) : QUEUE_STATUSES;
  const [queue, signups] = await Promise.all([
    prisma.course.count({ where: { status: { in: [...queueStatuses] } } }),
    can(user.role, "member.read") ? prisma.user.count({ where: { status: "PENDING" } }) : Promise.resolve(0),
  ]);

  return (
    <FeedbackProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          locale={locale}
          role={user.role}
          userName={user.name ?? user.email}
          userEmail={user.email}
          counts={{ queue, signups }}
        />
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="mx-auto max-w-[1280px] px-8 py-7">{children}</div>
        </main>
      </div>
    </FeedbackProvider>
  );
}
