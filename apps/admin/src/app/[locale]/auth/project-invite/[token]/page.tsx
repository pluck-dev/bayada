import Link from "next/link";
import { projectInvitation } from "@/lib/project-workspace/invitations";
import { AcceptInvitation } from "@/components/project-workspace/AcceptInvitation";

export const metadata = { title: "프로젝트 협의 초대 · BAYADA", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ProjectInvitePage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  const invitation = await projectInvitation(token);
  return (
    <main className="mx-auto min-h-screen max-w-md px-5 py-16">
      <h1 className="mb-7 text-2xl font-bold">BAYADA 프로젝트 협의</h1>
      {invitation ? <AcceptInvitation locale={locale} token={token} /> : (
        <div className="space-y-5"><p>만료되었거나 사용된 초대입니다. 관리자에게 새 링크를 요청하세요.</p><Link href={`/${locale}/auth/login`}>로그인</Link></div>
      )}
    </main>
  );
}
