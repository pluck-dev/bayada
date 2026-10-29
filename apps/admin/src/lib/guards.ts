import { prisma, type CourseStatus } from "@bayada/db";
import { ActionError, type AdminUser } from "./session";
import { LOCKED_STATUSES } from "./workflow";

/**
 * 파트너 관리자는 자기 제공기관 프로그램만 다룬다. 다른 기관 프로그램은 존재 자체를 숨긴다.
 * 운영 역할은 통과.
 */
export function assertOwnedBy(user: AdminUser, providerId: string | null) {
  if (user.role === "PARTNER_ADMIN" && (!user.providerId || providerId !== user.providerId)) {
    throw new ActionError("프로그램을 찾을 수 없습니다.");
  }
}

/** 검토 단계(제출~승인)에서는 본문·커리큘럼 수정을 막는다 */
export async function assertEditable(
  courseId: string,
  user: AdminUser,
): Promise<{ status: CourseStatus; title: string; providerId: string | null; featured: boolean; visibility: "INTERNAL" | "PUBLIC" }> {
  const c = await prisma.course.findUnique({
    where: { id: courseId },
    select: { status: true, title: true, providerId: true, featured: true, visibility: true },
  });
  if (!c) throw new ActionError("프로그램을 찾을 수 없습니다.");
  assertOwnedBy(user, c.providerId);
  // 파트너가 게시본을 고치면 승인 없이 학습자 화면이 바뀐다 — 게시·보관 후 변경은 운영자 몫
  if (user.role === "PARTNER_ADMIN" && (c.status === "PUBLISHED" || c.status === "ARCHIVED")) {
    throw new ActionError("게시·보관된 프로그램은 파트너 콘솔에서 고칠 수 없습니다. 바야다 운영자에게 요청하세요.");
  }
  if (LOCKED_STATUSES.includes(c.status)) {
    throw new ActionError("검토가 진행 중인 프로그램은 수정할 수 없습니다. 수정 요청 후 편집하세요.");
  }
  return c;
}
