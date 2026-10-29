"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@bayada/db";
import type { JobRole } from "@bayada/db";
import { ActionError, audit, runAction } from "../session";
import { JOB_ROLES } from "../labels";

export type StepLinkKind = "none" | "course" | "credential";

export interface PathwayStepInput {
  title: string;
  description: string;
  link: StepLinkKind;
  courseId: string;
  credentialProgramId: string;
}

export interface PathwayInput {
  slug: string;
  title: string;
  country: string;
  jobRole: JobRole | "";
  summary: string;
  content: string;
  /** YYYY-MM-DD (빈 값 허용 — 단, 게시하려면 필수) */
  infoAsOf: string;
  disclaimer: string;
  coverImage: string;
  order: number;
  steps: PathwayStepInput[];
  /** 편집을 시작한 시점의 updatedAt — 그 사이 다른 관리자가 저장했으면 덮어쓰지 않는다 */
  baseUpdatedAt: string | null;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseDate(v: string): Date | null {
  const s = v.trim();
  if (!s) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new ActionError("정보 기준일 형식이 올바르지 않습니다.");
  // 날짜만 의미가 있다 — UTC 자정으로 저장해 어느 시간대에서 읽어도 같은 날짜가 되게
  const d = new Date(`${s}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new ActionError("정보 기준일 형식이 올바르지 않습니다.");
  return d;
}

/** 본문은 학습자 화면에 HTML 로 나간다 — 스크립트 실행 경로는 받지 않는다 (문서 관리와 같은 규칙) */
function assertSafeHtml(html: string, label: string) {
  if (/<script\b|<iframe\b|<object\b|<embed\b|javascript:|\son[a-z]+\s*=/i.test(html)) {
    throw new ActionError(`${label}에 스크립트·iframe·이벤트 속성(onclick 등)은 넣을 수 없습니다.`);
  }
}

function clean(input: PathwayInput) {
  const slug = input.slug.trim().toLowerCase();
  if (!SLUG_RE.test(slug)) throw new ActionError("주소(slug)는 영문 소문자·숫자·하이픈만 쓸 수 있습니다. 예) us-rn");
  const title = input.title.trim();
  if (!title) throw new ActionError("패스웨이 이름을 입력하세요.");
  const country = input.country.trim();
  if (!country) throw new ActionError("국가(또는 '국내')를 입력하세요.");
  if (input.jobRole && !JOB_ROLES.includes(input.jobRole)) throw new ActionError("직군 값이 올바르지 않습니다.");
  const content = input.content.trim();
  assertSafeHtml(content, "본문");
  const coverImage = input.coverImage.trim();
  if (coverImage && !/^https?:\/\/\S+$/i.test(coverImage)) throw new ActionError("표지 이미지는 http(s):// 로 시작하는 주소여야 합니다.");
  const order = Math.round(Number(input.order) || 0);

  const steps = input.steps.map((s, i) => {
    const t = s.title.trim();
    if (!t) throw new ActionError(`STEP ${i + 1}: 단계 이름을 입력하세요.`);
    const courseId = s.link === "course" ? s.courseId : "";
    const credentialProgramId = s.link === "credential" ? s.credentialProgramId : "";
    if (s.link === "course" && !courseId) throw new ActionError(`STEP ${i + 1}: 연결할 프로그램을 고르세요.`);
    if (s.link === "credential" && !credentialProgramId) throw new ActionError(`STEP ${i + 1}: 연결할 인증 과정을 고르세요.`);
    return {
      order: i,
      title: t,
      description: s.description.trim() || null,
      courseId: courseId || null,
      credentialProgramId: credentialProgramId || null,
    };
  });

  return {
    data: {
      slug,
      title,
      country,
      jobRole: input.jobRole || null,
      summary: input.summary.trim() || null,
      content: content || null,
      infoAsOf: parseDate(input.infoAsOf),
      disclaimer: input.disclaimer.trim() || null,
      coverImage: coverImage || null,
      order,
    },
    steps,
  };
}

/** 연결 대상은 게시된 프로그램 · 운영 중인 인증 과정만 */
async function assertLinks(steps: ReturnType<typeof clean>["steps"]) {
  const courseIds = [...new Set(steps.map((s) => s.courseId).filter((x): x is string => !!x))];
  const programIds = [...new Set(steps.map((s) => s.credentialProgramId).filter((x): x is string => !!x))];
  const [courses, programs] = await Promise.all([
    courseIds.length ? prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, status: true } }) : [],
    programIds.length
      ? prisma.credentialProgram.findMany({ where: { id: { in: programIds } }, select: { id: true, active: true } })
      : [],
  ]);
  const courseOk = new Map(courses.map((c) => [c.id, c.status === "PUBLISHED"]));
  const programOk = new Map(programs.map((p) => [p.id, p.active]));
  steps.forEach((s, i) => {
    if (s.courseId && !courseOk.get(s.courseId)) throw new ActionError(`STEP ${i + 1}: 연결 프로그램이 게시 중이 아닙니다.`);
    if (s.credentialProgramId && !programOk.get(s.credentialProgramId)) {
      throw new ActionError(`STEP ${i + 1}: 연결 인증 과정이 운영 중이 아닙니다.`);
    }
  });
}

function stepsSignature(steps: { title: string; description: string | null; courseId: string | null; credentialProgramId: string | null }[]) {
  return JSON.stringify(steps.map((s) => [s.title, s.description ?? null, s.courseId ?? null, s.credentialProgramId ?? null]));
}

function done(id?: string) {
  revalidatePath("/[locale]/(dashboard)/pathways", "layout");
  if (id) revalidatePath(`/[locale]/(dashboard)/pathways/${id}`, "page");
}

export async function savePathway(id: string | null, input: PathwayInput) {
  return runAction<{ id: string; updatedAt: string }>("pathway", async (user) => {
    const { data, steps } = clean(input);
    await assertLinks(steps);

    if (!id) {
      const p = await prisma.pathway.create({ data: { ...data, steps: { create: steps } } });
      await audit(user.id, "pathway.create", `Pathway:${p.id}`, { slug: p.slug, title: p.title, country: p.country, steps: steps.length });
      done();
      return { message: "패스웨이를 만들었습니다. 내용을 확인한 뒤 게시하세요.", data: { id: p.id, updatedAt: p.updatedAt.toISOString() } };
    }

    const before = await prisma.pathway.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: "asc" } } },
    });
    if (!before) throw new ActionError("패스웨이를 찾을 수 없습니다.");
    if (input.baseUpdatedAt && before.updatedAt.toISOString() !== input.baseUpdatedAt) {
      throw new ActionError("편집하는 동안 다른 관리자가 이 패스웨이를 저장했습니다. 새로고침 후 다시 수정하세요.");
    }
    // 게시 중인 패스웨이는 공개 화면 요건(정보 기준일·단계)을 계속 지켜야 한다
    if (before.published) {
      if (!data.infoAsOf) throw new ActionError("게시 중인 패스웨이는 정보 기준일을 비울 수 없습니다. 먼저 게시를 중단하세요.");
      if (steps.length === 0) throw new ActionError("게시 중인 패스웨이는 단계가 1개 이상 있어야 합니다.");
    }

    const stepsChanged = stepsSignature(before.steps) !== stepsSignature(steps);
    const changed = (Object.keys(data) as (keyof typeof data)[]).filter((k) => {
      const a = before[k];
      const b = data[k];
      return a instanceof Date || b instanceof Date ? a?.valueOf() !== b?.valueOf() : (a ?? null) !== (b ?? null);
    });

    const p = await prisma.$transaction(async (tx) => {
      if (stepsChanged) {
        await tx.pathwayStep.deleteMany({ where: { pathwayId: id } });
        if (steps.length) await tx.pathwayStep.createMany({ data: steps.map((s) => ({ ...s, pathwayId: id })) });
      }
      // 단계만 바뀌어도 updatedAt 을 올려 동시 수정 검사가 걸리게 한다
      return tx.pathway.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
    });

    if (changed.length) {
      await audit(user.id, "pathway.update", `Pathway:${id}`, { slug: p.slug, fields: changed });
    }
    if (stepsChanged) {
      await audit(user.id, "pathway.steps", `Pathway:${id}`, {
        slug: p.slug,
        from: before.steps.map((s) => s.title),
        to: steps.map((s) => s.title),
      });
    }
    done(id);
    return {
      message: changed.length || stepsChanged ? "저장했습니다." : "바뀐 내용이 없습니다.",
      data: { id, updatedAt: p.updatedAt.toISOString() },
    };
  });
}

export async function setPathwayPublished(id: string, published: boolean) {
  return runAction("pathway", async (user) => {
    const p = await prisma.pathway.findUnique({
      where: { id },
      select: { slug: true, title: true, published: true, infoAsOf: true, _count: { select: { steps: true } } },
    });
    if (!p) throw new ActionError("패스웨이를 찾을 수 없습니다.");
    if (p.published === published) return { message: published ? "이미 게시 중입니다." : "이미 게시 중단 상태입니다." };
    if (published) {
      // 국가별 자격 정보는 바뀌므로 기준일 없이 공개하지 않는다
      if (!p.infoAsOf) throw new ActionError("정보 기준일을 입력·저장한 뒤 게시할 수 있습니다.");
      if (p._count.steps === 0) throw new ActionError("단계를 1개 이상 저장한 뒤 게시할 수 있습니다.");
    }
    await prisma.pathway.update({ where: { id }, data: { published } });
    await audit(user.id, published ? "pathway.publish" : "pathway.unpublish", `Pathway:${id}`, { slug: p.slug, title: p.title });
    done(id);
    return { message: published ? "게시했습니다. 아카데미에 바로 보입니다." : "게시를 중단했습니다. 아카데미에서 숨겨집니다." };
  });
}

export async function deletePathway(id: string) {
  return runAction("pathway", async (user) => {
    const p = await prisma.pathway.findUnique({
      where: { id },
      select: { slug: true, title: true, published: true, _count: { select: { steps: true, goals: true } } },
    });
    if (!p) throw new ActionError("패스웨이를 찾을 수 없습니다.");
    if (p.published) throw new ActionError("게시 중인 패스웨이는 삭제할 수 없습니다. 먼저 게시를 중단하세요.");
    await prisma.pathway.delete({ where: { id } });
    await audit(user.id, "pathway.delete", `Pathway:${id}`, {
      slug: p.slug,
      title: p.title,
      steps: p._count.steps,
      goals: p._count.goals,
    });
    done();
    return { message: "패스웨이를 삭제했습니다." };
  });
}
