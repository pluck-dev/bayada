import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { AdminHeader } from "@/components/AdminHeader";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  // ADMIN 역할이 아닌 사용자는 접근 불가
  const user = session.user as { role?: string; name?: string | null; email?: string | null };
  if (user.role !== "ADMIN") {
    redirect(`/${locale}/auth/login`);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          userName={user.name ?? "관리자"}
          userEmail={user.email ?? ""}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
