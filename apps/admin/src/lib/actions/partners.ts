"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@bayada/db";
import { ActionError, audit, runAction } from "../session";

function done(providerId: string) {
  revalidatePath("/[locale]/(dashboard)/partners", "layout");
  revalidatePath(`/[locale]/(dashboard)/partners/${providerId}`, "page");
}

/**
 * 파트너 관리자 지정 — 학습자 계정을 PARTNER_ADMIN 으로 올리고 담당 제공기관을 묶는다.
 * 운영 역할·기관 관리자 계정은 권한이 섞이지 않게 거부한다.
 */
export async function assignPartnerAdmin(providerId: string, email: string) {
  return runAction("partner.manage", async (user) => {
    const provider = await prisma.provider.findUnique({ where: { id: providerId }, select: { name: true, isPartner: true } });
    if (!provider) throw new ActionError("제공기관을 찾을 수 없습니다.");
    if (!provider.isPartner) throw new ActionError("외부 파트너로 표시된 제공기관에만 파트너 관리자를 둘 수 있습니다.");
    const target = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true, role: true, customRoleKey: true, status: true, providerId: true },
    });
    if (!target) throw new ActionError("해당 이메일로 가입한 회원이 없습니다. 먼저 아카데미에 가입해야 합니다.");
    if (target.id === user.id) throw new ActionError("본인 역할은 바꿀 수 없습니다.");
    if (target.status !== "APPROVED") throw new ActionError("가입 승인된 회원만 지정할 수 있습니다.");
    if (target.role === "PARTNER_ADMIN" && target.providerId === providerId) return { message: "이미 이 기관의 파트너 관리자입니다." };
    if ((target.role !== "STUDENT" && target.role !== "PARTNER_ADMIN") || target.customRoleKey) {
      throw new ActionError("학습자 계정만 파트너 관리자로 지정할 수 있습니다 (운영·기관 관리자 계정 제외).");
    }
    await prisma.user.update({ where: { id: target.id }, data: { role: "PARTNER_ADMIN", providerId } });
    await audit(user.id, "partner.assign", `User:${target.id}`, {
      from: target.role,
      to: "PARTNER_ADMIN",
      email: target.email,
      provider: provider.name,
      providerId,
      previousProviderId: target.providerId,
    });
    done(providerId);
    if (target.providerId && target.providerId !== providerId) done(target.providerId);
    return { message: `${target.email} 님을 ${provider.name} 파트너 관리자로 지정했습니다.` };
  });
}

/** 파트너 관리자 해제 — 학습자로 되돌리고 제공기관 연결을 끊는다 */
export async function unassignPartnerAdmin(providerId: string, userId: string) {
  return runAction("partner.manage", async (user) => {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true, providerId: true, provider: { select: { name: true } } },
    });
    if (!target || target.role !== "PARTNER_ADMIN" || target.providerId !== providerId) {
      throw new ActionError("이 기관의 파트너 관리자가 아닙니다.");
    }
    await prisma.user.update({ where: { id: userId }, data: { role: "STUDENT", providerId: null } });
    await audit(user.id, "partner.unassign", `User:${userId}`, {
      from: "PARTNER_ADMIN",
      to: "STUDENT",
      email: target.email,
      provider: target.provider?.name,
      providerId,
    });
    done(providerId);
    return { message: "파트너 관리자 권한을 해제했습니다." };
  });
}
