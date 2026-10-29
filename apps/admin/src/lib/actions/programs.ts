"use server";

import { revalidatePath } from "next/cache";
import { prisma, type JobRole, type Level, type ProductType, type Visibility } from "@bayada/db";
import { ActionError, audit, runAction, type AdminUser } from "../session";
import { JOB_ROLES, LEVELS, PRODUCT_TYPES } from "../labels";
import { findTransition, requiredChecklist, type WorkflowAction } from "../workflow";
import { assertEditable } from "../guards";

export interface ProgramInput {
  title: string;
  slug: string;
  summary: string;
  description: string;
  thumbnail: string;
  price: number;
  productType: ProductType;
  level: Level | "";
  audiences: JobRole[];
  categoryId: string;
  providerId: string;
  durationMin: number | null;
  objectives: string[];
  featured: boolean;
  visibility: Visibility;
}

const SLUG_RE = /^[\p{L}\p{N}][\p{L}\p{N}-]*$/u;

function clean(input: ProgramInput) {
  const title = input.title.trim();
  if (!title) throw new ActionError("프로그램명을 입력하세요.");
  const slug = input.slug.trim().toLowerCase();
  if (!slug) throw new ActionError("slug 를 입력하세요.");
  if (!SLUG_RE.test(slug)) throw new ActionError("slug 는 글자·숫자·하이픈(-)만 쓸 수 있습니다.");
  if (!PRODUCT_TYPES.includes(input.productType)) throw new ActionError("유형이 올바르지 않습니다.");
  if (input.level && !LEVELS.includes(input.level)) throw new ActionError("난이도가 올바르지 않습니다.");
  if (input.audiences.some((a) => !JOB_ROLES.includes(a))) throw new ActionError("대상 직군이 올바르지 않습니다.");
  if (input.visibility !== "INTERNAL" && input.visibility !== "PUBLIC") throw new ActionError("공개범위가 올바르지 않습니다.");
  const price = Math.max(0, Math.round(Number(input.price) || 0));
  const durationMin = input.durationMin ? Math.max(0, Math.round(Number(input.durationMin))) || null : null;
  const thumbnail = input.thumbnail.trim();
  if (thumbnail && !/^(https?:\/\/|\/)/.test(thumbnail)) throw new ActionError("썸네일은 http(s) URL 이어야 합니다.");
  return {
    title,
    slug,
    summary: input.summary.trim() || null,
    description: input.description.trim() || null,
    thumbnail: thumbnail || null,
    price,
    productType: input.productType,
    level: input.level || null,
    audiences: [...new Set(input.audiences)],
    categoryId: input.categoryId || null,
    providerId: input.providerId || null,
    durationMin,
    objectives: input.objectives.map((o) => o.trim()).filter(Boolean),
    featured: !!input.featured,
    visibility: input.visibility,
  };
}

function revalidatePrograms(id?: string) {
  revalidatePath("/[locale]/(dashboard)", "layout");
  if (id) revalidatePath(`/[locale]/(dashboard)/programs/${id}`, "page");
}

export async function createProgram(input: ProgramInput) {
  return runAction<{ id: string }>("program.write", async (user) => {
    const data = clean(input);
    const course = await prisma.course.create({ data: { ...data, status: "DRAFT" } });
    await audit(user.id, "course.create", `Course:${course.id}`, { title: course.title, to: "DRAFT" });
    revalidatePrograms();
    return { message: "프로그램을 만들었습니다. 커리큘럼을 추가하세요.", data: { id: course.id } };
  });
}

export async function updateProgram(id: string, input: ProgramInput) {
  return runAction("program.write", async (user) => {
    const before = await assertEditable(id);
    const data = clean(input);
    await prisma.course.update({ where: { id }, data });
    await audit(user.id, "course.update", `Course:${id}`, { title: data.title, status: before.status });
    revalidatePrograms(id);
    return { message: "저장했습니다." };
  });
}

export async function deleteProgram(id: string) {
  return runAction("program.write", async (user) => {
    const c = await prisma.course.findUnique({
      where: { id },
      select: { title: true, status: true, _count: { select: { enrollments: true, orderItems: true, certificates: true } } },
    });
    if (!c) throw new ActionError("프로그램을 찾을 수 없습니다.");
    if (c.status !== "DRAFT" && c.status !== "CHANGES_REQUESTED") {
      throw new ActionError("작성 중·수정 요청 상태의 프로그램만 삭제할 수 있습니다. 게시된 프로그램은 보관하세요.");
    }
    if (c._count.enrollments || c._count.orderItems || c._count.certificates) {
      throw new ActionError("수강·주문 기록이 있는 프로그램은 삭제할 수 없습니다.");
    }
    await prisma.course.delete({ where: { id } });
    await audit(user.id, "course.delete", `Course:${id}`, { title: c.title, from: c.status });
    revalidatePrograms();
    return { message: "삭제했습니다." };
  });
}

/** 사내 ↔ 외부 공개범위 일괄 전환 */
export async function setVisibility(ids: string[], visibility: Visibility) {
  return runAction("program.write", async (user) => {
    if (visibility !== "INTERNAL" && visibility !== "PUBLIC") throw new ActionError("공개범위가 올바르지 않습니다.");
    if (!ids.length) throw new ActionError("프로그램을 선택하세요.");
    const targets = await prisma.course.findMany({
      where: { id: { in: ids }, visibility: { not: visibility } },
      select: { id: true, visibility: true, title: true },
    });
    if (!targets.length) return { message: "변경할 프로그램이 없습니다." };
    await prisma.course.updateMany({ where: { id: { in: targets.map((t) => t.id) } }, data: { visibility } });
    await prisma.auditLog.createMany({
      data: targets.map((t) => ({
        actorId: user.id,
        action: "course.visibility",
        target: `Course:${t.id}`,
        detail: { from: t.visibility, to: visibility, title: t.title },
      })),
    });
    revalidatePrograms();
    const label = visibility === "PUBLIC" ? "외부 공개" : "사내 전용";
    return { message: `${targets.length}개 프로그램을 ${label}로 바꿨습니다.` };
  });
}

export async function setFeatured(id: string, featured: boolean) {
  return runAction(["program.write", "curation"], async (user) => {
    const c = await prisma.course.update({ where: { id }, data: { featured }, select: { title: true } });
    await audit(user.id, "course.featured", `Course:${id}`, { to: featured, title: c.title });
    revalidatePrograms(id);
    return { message: featured ? "메인 큐레이션에 추가했습니다." : "메인 큐레이션에서 뺐습니다." };
  });
}

function assertTransitionRole(user: AdminUser, roles: string[]) {
  if (!roles.includes(user.role)) throw new ActionError("이 단계를 처리할 권한이 없습니다.");
}

/** 승인 워크플로우 전이 — 모든 전이는 감사 로그에 남는다 */
export async function transitionProgram(id: string, action: WorkflowAction, note?: string) {
  return runAction(["workflow.operate", "workflow.clinical"], async (user) => {
    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        status: true,
        title: true,
        objectives: true,
        audiences: true,
        durationMin: true,
        providerId: true,
        publishedAt: true,
        sections: { select: { _count: { select: { lectures: true } } } },
      },
    });
    if (!course) throw new ActionError("프로그램을 찾을 수 없습니다.");
    const t = findTransition(action, course.status);
    if (!t) throw new ActionError("현재 상태에서는 할 수 없는 작업입니다. 화면을 새로고침하세요.");
    assertTransitionRole(user, t.roles);
    const trimmed = note?.trim() || null;
    if (t.noteRequired && !trimmed) throw new ActionError("수정 요청 사유를 검토 의견에 입력하세요.");

    if (action === "submit") {
      const lectures = course.sections.reduce((n, s) => n + s._count.lectures, 0);
      const missing = requiredChecklist({ ...course, lectureCount: lectures }).filter((c) => !c.ok);
      if (missing.length) {
        throw new ActionError(`필수 항목이 비어 있어 승인 요청할 수 없습니다: ${missing.map((m) => m.label).join(", ")}`);
      }
    }

    // 동시 처리 방지 — 상태가 그대로일 때만 바꾼다
    const res = await prisma.course.updateMany({
      where: { id, status: course.status },
      data: {
        status: t.to,
        ...(action === "request_changes" ? { reviewNote: trimmed } : {}),
        ...(action === "submit" ? { reviewNote: null } : {}),
        ...(action === "publish" ? { publishedAt: new Date() } : {}),
      },
    });
    if (res.count === 0) throw new ActionError("다른 사용자가 먼저 처리했습니다. 화면을 새로고침하세요.");

    await audit(user.id, `course.${action}`, `Course:${id}`, {
      from: course.status,
      to: t.to,
      note: trimmed,
      title: course.title,
    });
    revalidatePrograms(id);
    revalidatePath(`/[locale]/(dashboard)/approvals/${id}`, "page");
    return { message: `${course.title} — ${t.label} 처리했습니다.` };
  });
}
