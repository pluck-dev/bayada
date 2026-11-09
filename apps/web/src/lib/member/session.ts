import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@bayada/db";
import { auth } from "@/lib/auth";

// 마이페이지 회원 — 매 요청 DB 에서 다시 읽는다(회원 유형·방문 인력 지정·탈퇴 처리가 즉시 반영되게).
export const getMember = cache(async () => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      emailVerifiedAt: true,
      organizationId: true,
      organization: { select: { id: true, name: true, isInternal: true } },
      webMemberProfile: true,
    },
  });
  if (!user || user.status !== "APPROVED") return null;
  return user;
});

export type Member = NonNullable<Awaited<ReturnType<typeof getMember>>>;
export type MemberWithProfile = Member & { webMemberProfile: NonNullable<Member["webMemberProfile"]> };

/** 마이페이지 가드 — 비로그인은 로그인으로(돌아올 주소 포함), 회원 유형을 아직 안 고른 계정(아카데미·소셜 가입)은 온보딩으로 */
export async function requireMember(locale: string, path = "/my-page"): Promise<MemberWithProfile> {
  const m = await getMember();
  if (!m) redirect(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}${path}`)}`);
  if (!m.webMemberProfile) redirect(`/${locale}/my-page/onboarding`);
  return m as MemberWithProfile;
}

/** 이 회원이 patientId 의 기록을 볼 수 있는가 — 본인 또는 승인된 보호자 */
export async function canViewPatient(viewerId: string, patientId: string): Promise<boolean> {
  if (viewerId === patientId) return true;
  const link = await prisma.familyLink.findFirst({
    where: { guardianId: viewerId, patientId, status: "APPROVED" },
    select: { id: true },
  });
  return !!link;
}

/** 보호자가 연결된(승인) 이용자 목록 */
export async function linkedPatients(guardianId: string) {
  return prisma.familyLink.findMany({
    where: { guardianId, status: "APPROVED" },
    orderBy: { createdAt: "asc" },
    select: { id: true, relationship: true, patient: { select: { id: true, name: true, email: true } } },
  });
}
