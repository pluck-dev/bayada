"use server";

// 클라이언트 리뷰 피드백 처리 — 상태 변경(일괄 포함)·재수정 요청·댓글.
// 사이트 쪽 도구는 정해진 전환만 허용하지만(배포완료는 어드민 전용), 관리자는 모든 상태로 바꿀 수 있다(원본 어드민과 같음).
import { revalidatePath } from "next/cache";
import { prisma, type ReviewFeedbackStatus } from "@bayada/db";
import { FEEDBACK_BODY_MAX, feedbackStatuses, isFeedbackStatus, type FeedbackStatus } from "@bayada/review/config";
import { ActionError, audit, runAction } from "../session";

const MAX_BATCH = 200;

function cleanIds(ids: unknown): number[] {
  if (!Array.isArray(ids)) throw new ActionError("선택한 항목이 없습니다.");
  const list = [...new Set(ids.filter((id): id is number => Number.isSafeInteger(id) && id > 0))].slice(0, MAX_BATCH);
  if (!list.length) throw new ActionError("선택한 항목이 없습니다.");
  return list;
}

function refresh(ids: number[]) {
  revalidatePath("/[locale]/feedback", "page");
  for (const id of ids.slice(0, 20)) revalidatePath(`/[locale]/feedback/${id}`, "page");
}

/**
 * 상태 변경 (한 건·여러 건). 이미 그 상태인 항목은 건너뛴다.
 * expected 가 있으면(한 건 화면에서 보던 상태) 그 상태일 때만 바꿔 동시 수정을 막는다.
 */
export async function setFeedbackStatus(ids: number[], status: FeedbackStatus, expected?: FeedbackStatus) {
  return runAction("feedback", async (user) => {
    if (!isFeedbackStatus(status)) throw new ActionError("허용되지 않은 상태입니다.");
    if (expected !== undefined && !isFeedbackStatus(expected)) throw new ActionError("허용되지 않은 상태입니다.");
    const list = cleanIds(ids);
    const where = {
      id: { in: list },
      deletedAt: null,
      status: expected ? (expected as ReviewFeedbackStatus) : { not: status as ReviewFeedbackStatus },
    };
    const { count } = await prisma.reviewFeedback.updateMany({ where, data: { status: status as ReviewFeedbackStatus } });
    if (count === 0) {
      throw new ActionError(expected ? "다른 사용자가 상태를 먼저 바꿨습니다. 새로고침해 주세요." : "선택한 항목은 이미 해당 상태입니다.");
    }
    await audit(user.id, "feedback.status", `ReviewFeedback:${list.join(",").slice(0, 180)}`, { to: status, ids: list, changed: count });
    refresh(list);
    const skipped = list.length - count;
    return { message: `${count}건을 ${feedbackStatuses[status]}(으)로 바꿨습니다.${skipped ? ` 이미 해당 상태인 ${skipped}건은 제외했습니다.` : ""}` };
  });
}

/** 재수정 요청 — 개발완료 이후(개발완료·배포완료·디자인 확인완료) 항목만 미처리로 되돌리고 사유·시각을 남긴다 */
export async function requestFeedbackRework(ids: number[], reason: string) {
  return runAction("feedback", async (user) => {
    const text = typeof reason === "string" ? reason.trim() : "";
    if (!text || text.length > FEEDBACK_BODY_MAX) throw new ActionError("재수정 사유를 입력해 주세요.");
    const list = cleanIds(ids);
    const { count } = await prisma.reviewFeedback.updateMany({
      where: { id: { in: list }, deletedAt: null, status: { in: ["developed", "deployed", "resolved"] } },
      data: { status: "open", reworkReason: text, reworkRequestedAt: new Date() },
    });
    if (count === 0) throw new ActionError("재수정 요청은 개발완료 이후의 항목에만 사용할 수 있습니다.");
    await audit(user.id, "feedback.rework", `ReviewFeedback:${list.join(",").slice(0, 180)}`, { ids: list, changed: count, reason: text });
    refresh(list);
    const skipped = list.length - count;
    return { message: `${count}건에 재수정을 요청했습니다.${skipped ? ` 개발완료 전 단계인 ${skipped}건은 제외했습니다.` : ""}` };
  });
}

/** 관리자 댓글 — 사이트 리뷰 도구에는 "이름 · 관리자"로 보인다. 답글은 한 단계만 */
export async function addFeedbackReply(feedbackId: number, body: string, parentId?: number | null) {
  return runAction("feedback", async (user) => {
    const text = typeof body === "string" ? body.trim() : "";
    if (!Number.isSafeInteger(feedbackId) || feedbackId <= 0) throw new ActionError("잘못된 요청입니다.");
    if (!text || text.length > FEEDBACK_BODY_MAX) throw new ActionError("댓글 내용을 확인해 주세요.");
    const feedback = await prisma.reviewFeedback.findFirst({ where: { id: feedbackId, deletedAt: null }, select: { id: true, site: true } });
    if (!feedback) throw new ActionError("피드백을 찾을 수 없습니다.");
    if (parentId != null) {
      if (!Number.isSafeInteger(parentId) || parentId <= 0) throw new ActionError("답글 대상을 확인해 주세요.");
      const parent = await prisma.reviewFeedbackReply.findFirst({ where: { id: parentId, feedbackId, deletedAt: null }, select: { parentId: true } });
      if (!parent || parent.parentId !== null) throw new ActionError("답글 대상을 확인해 주세요.");
    }
    const reply = await prisma.reviewFeedbackReply.create({
      data: {
        site: feedback.site,
        feedbackId,
        parentId: parentId ?? null,
        authorName: (user.name?.trim() || user.email).slice(0, 100),
        department: "admin",
        adminUserId: user.id,
        body: text,
      },
      select: { id: true },
    });
    await audit(user.id, "feedback.reply", `ReviewFeedback:${feedbackId}`, { replyId: reply.id, parentId: parentId ?? null });
    revalidatePath(`/[locale]/feedback/${feedbackId}`, "page");
    return { message: parentId ? "답글을 등록했습니다." : "댓글을 등록했습니다." };
  });
}
