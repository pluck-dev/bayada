import { prisma, type CourseStatus } from "@bayada/db";
import { ActionError } from "./session";
import { LOCKED_STATUSES } from "./workflow";

/** 검토 단계(제출~승인)에서는 본문·커리큘럼 수정을 막는다 */
export async function assertEditable(courseId: string): Promise<{ status: CourseStatus; title: string }> {
  const c = await prisma.course.findUnique({ where: { id: courseId }, select: { status: true, title: true } });
  if (!c) throw new ActionError("프로그램을 찾을 수 없습니다.");
  if (LOCKED_STATUSES.includes(c.status)) {
    throw new ActionError("검토가 진행 중인 프로그램은 수정할 수 없습니다. 수정 요청 후 편집하세요.");
  }
  return c;
}
