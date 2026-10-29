"use server";

import { revalidatePath } from "next/cache";
import { prisma, type ReviewStatus } from "@bayada/db";
import { ActionError, audit, runAction } from "../session";

type ReviewOp = "hide" | "publish" | "dismiss";

const MESSAGE: Record<ReviewOp, string> = {
  hide: "후기를 숨겼습니다. 학습자 화면에서 보이지 않습니다.",
  publish: "후기를 다시 게시했습니다.",
  dismiss: "신고를 기각했습니다. 후기는 계속 게시됩니다.",
};

/**
 * 후기 숨김 / 다시 게시 / 신고 기각.
 * 다시 게시·기각은 운영자가 신고를 검토했다는 뜻이라 reportCount 를 0 으로 되돌린다 (이전 값은 감사 로그에 남김).
 */
export async function moderateReview(id: string, op: ReviewOp) {
  return runAction("review", async (user) => {
    if (op !== "hide" && op !== "publish" && op !== "dismiss") throw new ActionError("잘못된 요청입니다.");
    const r = await prisma.review.findUnique({
      where: { id },
      select: { status: true, reportCount: true, course: { select: { title: true } } },
    });
    if (!r) throw new ActionError("후기를 찾을 수 없습니다.");
    const from: ReviewStatus = r.status;
    if (op === "hide" && from === "HIDDEN") return { message: "이미 숨긴 후기입니다." };
    if (op === "publish" && from === "PUBLISHED") return { message: "이미 게시 중인 후기입니다." };
    if (op === "dismiss" && (from !== "PUBLISHED" || r.reportCount === 0)) throw new ActionError("기각할 신고가 없습니다.");

    const to: ReviewStatus = op === "hide" ? "HIDDEN" : "PUBLISHED";
    await prisma.review.update({
      where: { id },
      data: { status: to, ...(op === "hide" ? {} : { reportCount: 0 }) },
    });
    await audit(user.id, `review.${op}`, `Review:${id}`, {
      from,
      to,
      reportCount: r.reportCount,
      course: r.course.title,
    });
    revalidatePath("/[locale]/(dashboard)", "layout");
    return { message: MESSAGE[op] };
  });
}
