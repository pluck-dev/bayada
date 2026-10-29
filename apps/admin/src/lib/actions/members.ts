"use server";

import { revalidatePath } from "next/cache";
import { prisma, type Role } from "@bayada/db";
import { ActionError, audit, runAction } from "../session";
import { ROLES } from "../labels";

function done(id?: string) {
  revalidatePath("/[locale]/(dashboard)", "layout");
  if (id) revalidatePath(`/[locale]/(dashboard)/members/${id}`, "page");
}

/** 가입 승인·거절 (기존 WordPress New User Approve 플러그인 대체) */
export async function decideSignup(ids: string[], decision: "APPROVED" | "REJECTED") {
  return runAction("member.write", async (user) => {
    if (decision !== "APPROVED" && decision !== "REJECTED") throw new ActionError("잘못된 요청입니다.");
    if (!ids.length) throw new ActionError("회원을 선택하세요.");
    if (ids.includes(user.id)) throw new ActionError("본인 계정의 승인 상태는 바꿀 수 없습니다.");
    const targets = await prisma.user.findMany({
      where: { id: { in: ids }, status: { not: decision } },
      select: { id: true, email: true, status: true },
    });
    if (!targets.length) return { message: "변경할 회원이 없습니다." };
    if (decision === "REJECTED") {
      // 거절하면 로그인할 수 없다 — 승인된 Super Admin 이 한 명도 안 남게 되면 막는다
      const rejecting = await prisma.user.count({
        where: { id: { in: targets.map((t) => t.id) }, role: "ADMIN", customRoleKey: null, status: "APPROVED" },
      });
      if (rejecting > 0 && (await approvedAdminCount(targets.map((t) => t.id))) === 0) {
        throw new ActionError("마지막 Super Admin 은 거절할 수 없습니다.");
      }
    }
    await prisma.user.updateMany({ where: { id: { in: targets.map((t) => t.id) } }, data: { status: decision } });
    await prisma.auditLog.createMany({
      data: targets.map((t) => ({
        actorId: user.id,
        action: decision === "APPROVED" ? "user.approve" : "user.reject",
        target: `User:${t.id}`,
        detail: { from: t.status, to: decision, email: t.email },
      })),
    });
    done(ids.length === 1 ? ids[0] : undefined);
    return { message: `${targets.length}명을 ${decision === "APPROVED" ? "승인" : "거절"}했습니다.` };
  });
}

/** 승인된 Super Admin 수 (사용자 정의 역할이 붙은 계정 제외) — 마지막 한 명은 강등·거절할 수 없다 */
async function approvedAdminCount(excludeIds: string[] = []) {
  return prisma.user.count({
    where: { role: "ADMIN", customRoleKey: null, status: "APPROVED", id: { notIn: excludeIds } },
  });
}

/**
 * 역할 변경 — 시스템 역할(Role) 또는 사용자 정의 역할 키.
 * 사용자 정의 역할은 role=STUDENT + customRoleKey 로 저장한다(아카데미에서는 일반 학습자, 어드민에서는 그 역할 권한).
 */
export async function changeRole(id: string, roleKey: string) {
  return runAction("member.write", async (user) => {
    if (id === user.id) throw new ActionError("본인 역할은 바꿀 수 없습니다.");
    const isSystem = (ROLES as string[]).includes(roleKey);
    let customName: string | null = null;
    if (!isSystem) {
      const def = await prisma.adminRoleDef.findUnique({ where: { key: roleKey }, select: { name: true, isSystem: true } });
      if (!def || def.isSystem) throw new ActionError("역할이 올바르지 않습니다.");
      customName = def.name;
    }
    // 파트너 관리자는 담당 제공기관과 함께 지정해야 해서 파트너 화면에서만 바꾼다
    if (roleKey === "PARTNER_ADMIN") throw new ActionError("파트너 관리자 지정은 파트너 화면에서 제공기관과 함께 하세요.");
    const before = await prisma.user.findUnique({
      where: { id },
      select: { role: true, customRoleKey: true, email: true, status: true },
    });
    if (!before) throw new ActionError("회원을 찾을 수 없습니다.");
    const fromKey = before.customRoleKey ?? before.role;
    if (fromKey === roleKey) return { message: "변경 사항이 없습니다." };
    const wasAdmin = before.role === "ADMIN" && !before.customRoleKey;
    // Super Admin 을 만들거나 없애는 일은 Super Admin 만 (회원 관리 권한만으로 최고 권한을 넘기지 못하게)
    if ((roleKey === "ADMIN" || wasAdmin) && user.roleKey !== "ADMIN") {
      throw new ActionError("Super Admin 지정·해제는 Super Admin 만 할 수 있습니다.");
    }
    if (wasAdmin && before.status === "APPROVED" && (await approvedAdminCount([id])) === 0) {
      throw new ActionError("마지막 Super Admin 은 다른 역할로 바꿀 수 없습니다.");
    }
    await prisma.user.update({
      where: { id },
      data: isSystem
        ? { role: roleKey as Role, customRoleKey: null, providerId: null }
        : { role: "STUDENT", customRoleKey: roleKey, providerId: null },
    });
    await audit(user.id, "user.role", `User:${id}`, {
      from: fromKey,
      to: roleKey,
      ...(customName ? { toName: customName } : {}),
      email: before.email,
    });
    done(id);
    return { message: "역할을 바꿨습니다." };
  });
}
