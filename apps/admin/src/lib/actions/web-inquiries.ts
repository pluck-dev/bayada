"use server";

// 홈페이지 문의 CRM 처리 — 상태·담당자·메모. 바뀔 때마다 처리 이력(WebInquiryNote)과 감사 로그를 남긴다.
import { revalidatePath } from "next/cache";
import { prisma, type WebInquiryStatus } from "@bayada/db";
import { WEB_INQUIRY_STATUSES, WEB_INQUIRY_STATUS_LABEL } from "@bayada/shared/web-content";
import { listAssignees } from "../queries/web";
import { ActionError, audit, runAction } from "../session";

function done(id?: string) {
  revalidatePath("/[locale]/(dashboard)/web", "layout");
  if (id) revalidatePath(`/[locale]/(dashboard)/web/inquiries/${id}`, "page");
}

async function load(id: string) {
  const row = await prisma.webInquiry.findUnique({
    where: { id },
    select: { id: true, referenceNo: true, status: true, assigneeId: true },
  });
  if (!row) throw new ActionError("문의를 찾을 수 없습니다.");
  return row;
}

export async function setInquiryStatus(id: string, status: string) {
  return runAction("web.inquiries", async (user) => {
    if (!(WEB_INQUIRY_STATUSES as readonly string[]).includes(status)) throw new ActionError("알 수 없는 상태입니다.");
    const next = status as WebInquiryStatus;
    const row = await load(id);
    if (row.status === next) return { message: "이미 그 상태입니다." };
    const body = `${WEB_INQUIRY_STATUS_LABEL[row.status]} → ${WEB_INQUIRY_STATUS_LABEL[next]}`;
    await prisma.$transaction([
      prisma.webInquiry.update({ where: { id }, data: { status: next } }),
      prisma.webInquiryNote.create({ data: { inquiryId: id, authorId: user.id, kind: "status", body } }),
    ]);
    await audit(user.id, "web.inquiry.status", `WebInquiry:${id}`, { referenceNo: row.referenceNo, from: row.status, to: next });
    done(id);
    return { message: `상태를 '${WEB_INQUIRY_STATUS_LABEL[next]}'(으)로 바꿨습니다.` };
  });
}

export async function setInquiryAssignee(id: string, assigneeId: string | null) {
  return runAction("web.inquiries", async (user) => {
    const row = await load(id);
    const nextId = assigneeId || null;
    if (row.assigneeId === nextId) return { message: "변경 사항이 없습니다." };
    let label = "담당자 해제";
    if (nextId) {
      const candidate = (await listAssignees()).find((u) => u.id === nextId);
      if (!candidate) throw new ActionError("담당자로 지정할 수 없는 계정입니다.");
      label = `담당자 지정: ${candidate.name ?? candidate.email}`;
    }
    await prisma.$transaction([
      prisma.webInquiry.update({ where: { id }, data: { assigneeId: nextId } }),
      prisma.webInquiryNote.create({ data: { inquiryId: id, authorId: user.id, kind: "assignee", body: label } }),
    ]);
    await audit(user.id, "web.inquiry.assign", `WebInquiry:${id}`, { referenceNo: row.referenceNo, from: row.assigneeId, to: nextId });
    done(id);
    return { message: nextId ? "담당자를 지정했습니다." : "담당자를 해제했습니다." };
  });
}

export async function addInquiryNote(id: string, body: string) {
  return runAction("web.inquiries", async (user) => {
    const text = body.trim();
    if (!text) throw new ActionError("메모 내용을 입력하세요.");
    if (text.length > 2000) throw new ActionError("메모는 2,000자 이내로 입력하세요.");
    const row = await load(id);
    await prisma.webInquiryNote.create({ data: { inquiryId: id, authorId: user.id, kind: "memo", body: text } });
    await audit(user.id, "web.inquiry.note", `WebInquiry:${id}`, { referenceNo: row.referenceNo });
    done(id);
    return { message: "메모를 남겼습니다." };
  });
}

/** 개인정보 파기 요청 등 — 처리 이력까지 지운다. 감사 로그에는 접수번호만 남긴다 */
export async function deleteInquiry(id: string) {
  return runAction("web.inquiries", async (user) => {
    const row = await load(id);
    await prisma.webInquiry.delete({ where: { id } });
    await audit(user.id, "web.inquiry.delete", `WebInquiry:${id}`, { referenceNo: row.referenceNo });
    done();
    return { message: `${row.referenceNo} 문의를 삭제했습니다.` };
  });
}
