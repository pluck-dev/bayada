"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@bayada/db";
import { ActionError, audit, runAction } from "../session";

export interface OrganizationInput {
  name: string;
  bizNo: string;
  contact: string;
}

export async function createOrganization(input: OrganizationInput) {
  return runAction<{ id: string }>("commerce", async (user) => {
    const name = input.name.trim();
    if (!name) throw new ActionError("기관명을 입력하세요.");
    const bizNo = input.bizNo.replace(/[^0-9]/g, "");
    if (bizNo && bizNo.length !== 10) throw new ActionError("사업자등록번호는 숫자 10자리입니다.");
    const dup = await prisma.organization.findFirst({ where: { name: { equals: name, mode: "insensitive" } }, select: { id: true } });
    if (dup) throw new ActionError("같은 이름의 기관이 이미 있습니다.");
    // 사내 조직(isInternal) 지정은 사내 강의 열람 권한이라 여기서 만들지 않는다
    const org = await prisma.organization.create({
      data: {
        name,
        bizNo: bizNo ? `${bizNo.slice(0, 3)}-${bizNo.slice(3, 5)}-${bizNo.slice(5)}` : null,
        contact: input.contact.trim() || null,
      },
    });
    await audit(user.id, "organization.create", `Organization:${org.id}`, { name });
    revalidatePath("/[locale]/(dashboard)/organizations", "layout");
    return { message: "기관을 만들었습니다.", data: { id: org.id } };
  });
}

/** 소속 회원을 기관 관리자(ORG_ADMIN)로 지정하거나 학습자로 되돌린다 */
export async function setOrgAdmin(organizationId: string, userId: string, makeAdmin: boolean) {
  return runAction("commerce", async (user) => {
    if (userId === user.id) throw new ActionError("본인 역할은 바꿀 수 없습니다.");
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true, organizationId: true, status: true },
    });
    if (!target || target.organizationId !== organizationId) throw new ActionError("이 기관 소속 회원이 아닙니다.");
    const from = target.role;
    const to = makeAdmin ? "ORG_ADMIN" : "STUDENT";
    if (from === to) return { message: "변경 사항이 없습니다." };
    // 운영·파트너 계정은 여기서 바꾸지 않는다 (권한이 줄어드는 사고 방지)
    if (from !== "STUDENT" && from !== "ORG_ADMIN") throw new ActionError("학습자·기관 관리자 사이에서만 바꿀 수 있습니다.");
    if (makeAdmin && target.status !== "APPROVED") throw new ActionError("가입 승인된 회원만 기관 관리자로 지정할 수 있습니다.");
    await prisma.user.update({ where: { id: userId }, data: { role: to } });
    await audit(user.id, "user.role", `User:${userId}`, { from, to, email: target.email, organizationId });
    revalidatePath(`/[locale]/(dashboard)/organizations/${organizationId}`, "page");
    return { message: makeAdmin ? "기관 관리자로 지정했습니다." : "학습자로 되돌렸습니다." };
  });
}
