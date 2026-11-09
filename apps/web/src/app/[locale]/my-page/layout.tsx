import { redirect } from "next/navigation";
import { MEMBER_TYPE_LABEL } from "@bayada/shared/member";
import { prisma } from "@bayada/db";
import { getMember } from "@/lib/member/session";
import { MemberNav, type NavKey } from "@/components/member/MemberNav";

// 회원 화면은 로그인 쿠키를 읽어 요청마다 그린다 (공개 페이지 정적 생성과 무관)
export const dynamic = "force-dynamic";

export const metadata = { title: "마이페이지 | 바야다홈헬스케어", robots: { index: false, follow: false } };

const NAV_BY_TYPE: Record<string, NavKey[]> = {
  SERVICE_USER: ["home", "bookings", "health", "medications", "visits", "family", "inquiries", "settings"],
  GUARDIAN: ["home", "family", "bookings", "visits", "inquiries", "settings"],
  PROVIDER: ["home", "schedule", "education", "inquiries", "settings"],
  ORGANIZATION: ["home", "organization", "education", "inquiries", "settings"],
};

export default async function MyPageLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = await getMember();
  if (!m) redirect(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/my-page`)}`);
  const type = m.webMemberProfile?.memberType;
  // 나를 기다리는 가족 연결 요청 (이용자) — 메뉴 점 표시
  const pendingFamily = type === "SERVICE_USER" ? await prisma.familyLink.count({ where: { patientId: m.id, status: "PENDING" } }) : 0;

  return (
    <div className="min-h-[70vh] bg-[#f8f9fa]">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d] text-lg font-bold text-white">{(m.name || m.email).slice(0, 1)}</span>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-bold text-[color:var(--fg)]">{m.name ?? m.email} 님</p>
            <p className="truncate text-sm text-[color:var(--muted)]">
              {type ? MEMBER_TYPE_LABEL[type] : "회원 유형 선택 전"}
              {m.webMemberProfile?.providerRole ? ` · ${m.webMemberProfile.providerRole}` : ""}
              {m.webMemberProfile?.orgName ? ` · ${m.webMemberProfile.orgName}` : ""}
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-10">
        {type ? <MemberNav locale={locale} items={NAV_BY_TYPE[type]} dots={{ family: pendingFamily > 0 }} /> : <div className="hidden lg:block" />}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
