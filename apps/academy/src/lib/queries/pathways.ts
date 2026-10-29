import { prisma } from "@bayada/db";
import type { Prisma } from "@bayada/db";
import type { Viewer } from "@/lib/viewer";
import { isCourseListed } from "@/lib/queries/courses";

/** 어드민이 면책 고지를 비워 두면 이 문구를 보여 준다 (법률·이민 자문이 아님을 항상 고지) */
export const DEFAULT_PATHWAY_DISCLAIMER =
  "이 정보는 일반 안내이며 법률·이민 자문이 아닙니다. 자격 요건은 국가·기관에 따라 바뀔 수 있으니 공식 기관에서 확인하세요.";

/** 바야다 인증 과정 공개 주소 (인증 기능 라우트) */
export function credentialHref(locale: string, slug: string) {
  return `/${locale}/certifications/${encodeURIComponent(slug)}`;
}

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  country: true,
  jobRole: true,
  summary: true,
  coverImage: true,
  _count: { select: { steps: true } },
} satisfies Prisma.PathwaySelect;

export type PathwayCardData = Prisma.PathwayGetPayload<{ select: typeof cardSelect }>;

/** 게시된 패스웨이 (정렬: order → 국가 → 제목) */
export async function listPublishedPathways(): Promise<PathwayCardData[]> {
  return prisma.pathway.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { country: "asc" }, { title: "asc" }],
    select: cardSelect,
  });
}

/** 국가별 묶음 — 국가 순서는 목록에서 처음 나온 순서(=어드민 정렬)를 따른다 */
export function groupByCountry<T extends { country: string }>(rows: T[]): { country: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const r of rows) {
    const list = map.get(r.country);
    if (list) list.push(r);
    else map.set(r.country, [r]);
  }
  return [...map.entries()].map(([country, items]) => ({ country, items }));
}

export type StepStatus =
  | { kind: "course"; state: "completed" | "in_progress" | "not_started"; progress: number }
  | { kind: "credential"; state: "held" | "not_held" }
  | { kind: "milestone" };

export interface PathwayStepView {
  id: string;
  order: number;
  title: string;
  description: string | null;
  /** 보는 사람이 열람할 수 있는 강의면 링크, 아니면 null */
  course: { slug: string; title: string } | null;
  /** 연결 강의는 있지만 보는 사람이 열람할 수 없는 경우 */
  courseLocked: boolean;
  credential: { slug: string; title: string; active: boolean } | null;
  status: StepStatus;
  /** 완료(수료·인증 보유) 여부. 자유 단계(milestone)는 자동 판정할 수 없어 false */
  done: boolean;
}

const stepSelect = {
  id: true,
  order: true,
  title: true,
  description: true,
  courseId: true,
  course: { select: { id: true, slug: true, title: true, status: true, visibility: true } },
  credentialProgramId: true,
  credentialProgram: { select: { id: true, slug: true, title: true, active: true } },
} satisfies Prisma.PathwayStepSelect;

type StepRow = Prisma.PathwayStepGetPayload<{ select: typeof stepSelect }>;

/** 단계 행 + 보는 사람의 수강·인증 기록 → 화면용 단계 (여러 패스웨이를 한 번에 처리) */
async function resolveSteps(rows: StepRow[], viewer: Viewer | null): Promise<Map<string, PathwayStepView>> {
  const courseIds = [...new Set(rows.map((r) => r.courseId).filter((x): x is string => !!x))];
  const programIds = [...new Set(rows.map((r) => r.credentialProgramId).filter((x): x is string => !!x))];
  const now = new Date();
  const [enrollments, credentials] = viewer
    ? await Promise.all([
        courseIds.length
          ? prisma.enrollment.findMany({
              where: { userId: viewer.id, courseId: { in: courseIds } },
              select: { courseId: true, progressPercent: true, completedAt: true },
            })
          : [],
        programIds.length
          ? prisma.credential.findMany({
              where: {
                userId: viewer.id,
                programId: { in: programIds },
                revokedAt: null,
                OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
              },
              select: { programId: true },
            })
          : [],
      ])
    : [[], []];
  const enrollmentBy = new Map(enrollments.map((e) => [e.courseId, e]));
  const held = new Set(credentials.map((c) => c.programId));

  const out = new Map<string, PathwayStepView>();
  for (const r of rows) {
    let status: StepStatus = { kind: "milestone" };
    let course: PathwayStepView["course"] = null;
    let courseLocked = false;
    let credential: PathwayStepView["credential"] = null;
    if (r.course) {
      const e = enrollmentBy.get(r.course.id);
      // 수강 중인 사람은 강의가 사내 전용·보관으로 바뀌어도 들어갈 수 있다 (강의 상세 규칙과 같음)
      if (e || isCourseListed(r.course, viewer)) course = { slug: r.course.slug, title: r.course.title };
      else courseLocked = true;
      status = {
        kind: "course",
        state: e?.completedAt ? "completed" : e ? "in_progress" : "not_started",
        progress: e?.completedAt ? 100 : (e?.progressPercent ?? 0),
      };
    } else if (r.credentialProgram) {
      credential = { slug: r.credentialProgram.slug, title: r.credentialProgram.title, active: r.credentialProgram.active };
      status = { kind: "credential", state: held.has(r.credentialProgram.id) ? "held" : "not_held" };
    }
    const done =
      (status.kind === "course" && status.state === "completed") || (status.kind === "credential" && status.state === "held");
    out.set(r.id, {
      id: r.id,
      order: r.order,
      title: r.title,
      description: r.description,
      course,
      courseLocked,
      credential,
      status,
      done,
    });
  }
  return out;
}

/** 공개 상세 — 게시된 것만 */
export async function getPublishedPathway(slug: string, viewer: Viewer | null) {
  const p = await prisma.pathway.findFirst({
    where: { slug, published: true },
    include: { steps: { orderBy: { order: "asc" }, select: stepSelect } },
  });
  if (!p) return null;
  const [resolved, goal] = await Promise.all([
    resolveSteps(p.steps, viewer),
    viewer
      ? prisma.pathwayGoal.findUnique({ where: { userId_pathwayId: { userId: viewer.id, pathwayId: p.id } } })
      : null,
  ]);
  const { steps, ...rest } = p;
  return {
    ...rest,
    steps: steps.map((s) => resolved.get(s.id)!),
    isGoal: viewer ? !!goal : null,
  };
}

export type PublishedPathway = NonNullable<Awaited<ReturnType<typeof getPublishedPathway>>>;

/**
 * 현재 위치: 완료하지 않은 첫 단계.
 * 자유 단계는 자동 판정할 수 없으므로, 그 뒤 단계를 하나라도 마쳤으면 지나간 것으로 본다.
 */
export function pathwayProgress(steps: PathwayStepView[]) {
  let lastDone = -1;
  steps.forEach((s, i) => {
    if (s.done) lastDone = i;
  });
  const passed = steps.map((s, i) => s.done || (s.status.kind === "milestone" && i < lastDone));
  const current = passed.findIndex((p) => !p);
  return { passed, current, doneCount: passed.filter(Boolean).length };
}

/** 마이 러닝 > 커리어 목표. 게시 중단된 패스웨이는 목표에서 숨긴다 */
export async function getMyPathwayGoals(viewer: Viewer) {
  const goals = await prisma.pathwayGoal.findMany({
    where: { userId: viewer.id, pathway: { published: true } },
    orderBy: { createdAt: "asc" },
    select: {
      createdAt: true,
      pathway: {
        select: {
          id: true,
          slug: true,
          title: true,
          country: true,
          jobRole: true,
          infoAsOf: true,
          steps: { orderBy: { order: "asc" }, select: stepSelect },
        },
      },
    },
  });
  const resolved = await resolveSteps(
    goals.flatMap((g) => g.pathway.steps),
    viewer,
  );
  return goals.map((g) => {
    const steps = g.pathway.steps.map((s) => resolved.get(s.id)!);
    return { ...g.pathway, createdAt: g.createdAt, steps, progress: pathwayProgress(steps) };
  });
}
