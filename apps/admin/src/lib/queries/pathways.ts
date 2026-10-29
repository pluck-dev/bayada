import { prisma } from "@bayada/db";

/** 목록 — 국가 → 정렬순서 → 제목 */
export async function listPathways() {
  return prisma.pathway.findMany({
    orderBy: [{ country: "asc" }, { order: "asc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      country: true,
      jobRole: true,
      published: true,
      infoAsOf: true,
      updatedAt: true,
      _count: { select: { steps: true, goals: true } },
    },
  });
}

export async function getPathway(id: string) {
  return prisma.pathway.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { order: "asc" } },
      _count: { select: { goals: true } },
    },
  });
}

export interface StepLinkOptions {
  courses: { id: string; title: string; note: string }[];
  credentials: { id: string; title: string; note: string }[];
}

/**
 * 단계에 연결할 수 있는 대상: 게시된 프로그램 · 운영 중(active) 인증 과정.
 * 이미 연결돼 있지만 지금은 게시·운영 중이 아닌 대상도 선택값이 사라지지 않게 목록 끝에 붙인다(저장 시 다시 막힘).
 */
export async function stepLinkOptions(keep: { courseIds?: string[]; credentialIds?: string[] } = {}): Promise<StepLinkOptions> {
  const [courses, credentials] = await Promise.all([
    prisma.course.findMany({
      where: { OR: [{ status: "PUBLISHED" }, { id: { in: keep.courseIds ?? [] } }] },
      select: { id: true, title: true, status: true, visibility: true },
      orderBy: { title: "asc" },
    }),
    prisma.credentialProgram.findMany({
      where: { OR: [{ active: true }, { id: { in: keep.credentialIds ?? [] } }] },
      select: { id: true, title: true, active: true },
      orderBy: { title: "asc" },
    }),
  ]);
  return {
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      note: c.status !== "PUBLISHED" ? "게시 중 아님" : c.visibility === "INTERNAL" ? "사내 전용" : "",
    })),
    credentials: credentials.map((c) => ({ id: c.id, title: c.title, note: c.active ? "" : "운영 중 아님" })),
  };
}
