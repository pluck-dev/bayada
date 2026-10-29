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

export async function changeRole(id: string, role: Role) {
  return runAction("member.write", async (user) => {
    if (!ROLES.includes(role)) throw new ActionError("역할이 올바르지 않습니다.");
    if (id === user.id) throw new ActionError("본인 역할은 바꿀 수 없습니다.");
    const before = await prisma.user.findUnique({ where: { id }, select: { role: true, email: true } });
    if (!before) throw new ActionError("회원을 찾을 수 없습니다.");
    if (before.role === role) return { message: "변경 사항이 없습니다." };
    await prisma.user.update({ where: { id }, data: { role } });
    await audit(user.id, "user.role", `User:${id}`, { from: before.role, to: role, email: before.email });
    done(id);
    return { message: "역할을 바꿨습니다." };
  });
}
