"use server";

// 홈페이지 회원 관리 — 회원 유형 변경, 방문 인력 지정, 탈퇴 처리(개인정보 파기·익명화). 전부 감사 로그.
import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@bayada/db";
import { MEMBER_TYPE_LABEL, isMemberType } from "@bayada/shared/member";
import { ActionError, audit, runAction } from "../session";

const PERM = "web.members" as const;

function done(userId: string) {
  revalidatePath("/[locale]/(dashboard)/web", "layout");
  revalidatePath(`/[locale]/(dashboard)/web/members/${userId}`, "page");
}

async function loadProfile(userId: string) {
  const p = await prisma.webMemberProfile.findUnique({
    where: { userId },
    select: { userId: true, memberType: true, isVisitStaff: true, withdrawalRequestedAt: true, withdrawnAt: true, user: { select: { email: true, role: true, customRoleKey: true } } },
  });
  if (!p) throw new ActionError("홈페이지 회원을 찾을 수 없습니다.");
  if (p.withdrawnAt) throw new ActionError("탈퇴 처리된 회원입니다.");
  return p;
}

export async function setMemberType(userId: string, type: string) {
  return runAction(PERM, async (user) => {
    if (!isMemberType(type)) throw new ActionError("알 수 없는 회원 유형입니다.");
    const p = await loadProfile(userId);
    if (p.memberType === type) return { message: "이미 그 유형입니다." };
    // 제공자가 아니게 되면 방문 인력 지정도 푼다(배정 목록에서 빠짐)
    await prisma.webMemberProfile.update({ where: { userId }, data: { memberType: type, ...(type !== "PROVIDER" ? { isVisitStaff: false } : {}) } });
    await audit(user.id, "web.member.type", `User:${userId}`, { email: p.user.email, from: p.memberType, to: type });
    done(userId);
    return { message: `회원 유형을 '${MEMBER_TYPE_LABEL[type]}'(으)로 바꿨습니다.` };
  });
}

export async function setVisitStaff(userId: string, on: boolean) {
  return runAction(PERM, async (user) => {
    const p = await loadProfile(userId);
    if (on && p.memberType !== "PROVIDER") throw new ActionError("제공자 회원만 방문 인력으로 지정할 수 있습니다.");
    if (p.isVisitStaff === on) return { message: "변경 사항이 없습니다." };
    if (!on) {
      const active = await prisma.booking.count({ where: { assignedStaffId: userId, status: "CONFIRMED" } });
      if (active > 0) throw new ActionError(`확정된 예약 ${active}건의 담당자입니다. 먼저 다른 담당자로 바꾸세요.`);
    }
    await prisma.webMemberProfile.update({ where: { userId }, data: { isVisitStaff: on } });
    await audit(user.id, on ? "web.member.staff_on" : "web.member.staff_off", `User:${userId}`, { email: p.user.email });
    done(userId);
    return { message: on ? "방문 인력으로 지정했습니다. 예약 확정 때 담당자로 고를 수 있습니다." : "방문 인력 지정을 해제했습니다." };
  });
}

export async function dismissWithdrawal(userId: string) {
  return runAction(PERM, async (user) => {
    const p = await loadProfile(userId);
    if (!p.withdrawalRequestedAt) return { message: "탈퇴 요청이 없습니다." };
    await prisma.webMemberProfile.update({ where: { userId }, data: { withdrawalRequestedAt: null, withdrawalReason: null } });
    await audit(user.id, "web.member.withdrawal_dismiss", `User:${userId}`, { email: p.user.email });
    done(userId);
    return { message: "탈퇴 요청을 철회 처리했습니다." };
  });
}

/**
 * 탈퇴 처리 = 개인정보 파기 + 계정 익명화. 진행 중 예약이 있으면 거부.
 * 지우는 것: 건강 기록·복약(기록 포함)·가족 연결·소셜 연결·메일 토큰. 계정 행은 남기고 이메일·이름·연락처를 지우고 로그인 불가(REJECTED)로 —
 * 방문 서비스 기록(예약·방문 기록)과 아카데미 수료 기록은 익명 계정에 남는다(서비스 제공·수료 이력 보존).
 */
export async function processWithdrawal(userId: string) {
  return runAction(PERM, async (user) => {
    const p = await loadProfile(userId);
    if (!p.withdrawalRequestedAt) throw new ActionError("탈퇴를 요청한 회원만 처리할 수 있습니다.");
    if (p.user.customRoleKey || !["STUDENT", "ORG_ADMIN"].includes(p.user.role)) throw new ActionError("어드민 역할이 있는 계정입니다. 역할을 먼저 정리하세요.");
    const active = await prisma.booking.count({
      where: { status: { in: ["REQUESTED", "CONFIRMED"] }, OR: [{ patientId: userId }, { requestedById: userId }, { assignedStaffId: userId }] },
    });
    if (active > 0) throw new ActionError(`진행 중인 예약 ${active}건이 있습니다. 완료·취소 후 처리하세요.`);
    const now = new Date();
    const password = await hash(randomBytes(32).toString("base64url"), 10);
    await prisma.$transaction([
      prisma.healthRecord.deleteMany({ where: { patientId: userId } }),
      prisma.medication.deleteMany({ where: { patientId: userId } }),
      prisma.familyLink.deleteMany({ where: { OR: [{ guardianId: userId }, { patientId: userId }] } }),
      prisma.socialAccount.deleteMany({ where: { userId } }),
      prisma.authToken.deleteMany({ where: { userId } }),
      prisma.webInquiry.updateMany({ where: { userId }, data: { userId: null } }),
      prisma.user.update({
        where: { id: userId },
        data: {
          email: `withdrawn-${userId}@withdrawn.bayada.invalid`,
          name: "탈퇴 회원",
          phone: null,
          password,
          status: "REJECTED",
          passwordChangedAt: now, // 남아 있는 세션 즉시 무효
          emailVerifiedAt: null,
        },
      }),
      prisma.webMemberProfile.update({
        where: { userId },
        data: { withdrawnAt: now, address: null, orgName: null, withdrawalReason: null, isVisitStaff: false, emailOptIn: false, smsOptIn: false },
      }),
    ]);
    // 감사 로그엔 원래 이메일을 남기지 않는다(파기 대상) — 처리 사실과 계정 id 만
    await audit(user.id, "web.member.withdraw", `User:${userId}`, { requestedAt: p.withdrawalRequestedAt.toISOString() });
    done(userId);
    return { message: "탈퇴 처리했습니다. 개인정보를 파기하고 계정을 익명화했습니다." };
  });
}
