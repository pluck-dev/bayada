import { prisma, Prisma } from "@bayada/db";
import { htmlToText } from "@/lib/html-text";
import { paymentService } from "@/lib/services";

// ─── 진도 · 수료 ───

/** 강의의 레슨 id 목록 (섹션·레슨 순서대로) */
async function orderedLectureIds(courseId: string): Promise<string[]> {
  const sections = await prisma.section.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: { lectures: { orderBy: { order: "asc" }, select: { id: true } } },
  });
  return sections.flatMap((s) => s.lectures.map((l) => l.id));
}

/** 다음 수료증 번호: BA-YYYY-NNNNNN (연도별 일련번호) */
async function nextCertificateNumber(tx: Prisma.TransactionClient, year: number): Promise<string> {
  const prefix = `BA-${year}-`;
  const last = await tx.certificate.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const seq = last ? Number(last.number.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(seq).padStart(6, "0")}`;
}

async function issueCertificate(userId: string, courseId: string) {
  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) return existing;
  // 동시에 두 명이 수료하면 같은 번호를 잡을 수 있어 unique 충돌 시 재시도
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const number = await nextCertificateNumber(tx, new Date().getFullYear());
        return tx.certificate.create({ data: { userId, courseId, number } });
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        const mine = await prisma.certificate.findUnique({
          where: { userId_courseId: { userId, courseId } },
        });
        if (mine) return mine;
        continue;
      }
      throw e;
    }
  }
  throw new Error("수료증 번호 발급에 실패했습니다");
}

/**
 * 수강 진도율 재계산. 100% 가 되면 completedAt 기록 + 수료증 발급.
 * 이미 수료한 기록(옮겨 온 데이터 포함)은 진도율이 내려가도 completedAt 을 지우지 않는다.
 */
export async function recomputeEnrollment(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment) return null;
  const lectureIds = await orderedLectureIds(courseId);
  if (lectureIds.length === 0) return enrollment;
  const done = await prisma.progress.count({
    where: { userId, lectureId: { in: lectureIds }, completed: true },
  });
  const completed = done === lectureIds.length;
  const percent = completed ? 100 : Math.min(99, Math.round((done / lectureIds.length) * 100));
  const updated = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      // 옮겨 온 진도율(WP)이 레슨 기록보다 높을 수 있어 내려가지 않게 한다
      progressPercent: Math.max(percent, enrollment.progressPercent, enrollment.completedAt ? 100 : 0),
      ...(completed && !enrollment.completedAt ? { completedAt: new Date() } : {}),
    },
  });
  if (updated.completedAt) await issueCertificate(userId, courseId);
  return updated;
}

/** 레슨이 속한 강의 + 사용자 수강 여부 */
export async function getLectureEnrollment(userId: string, lectureId: string) {
  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    select: {
      id: true,
      type: true,
      duration: true,
      section: { select: { courseId: true, course: { select: { price: true, productType: true } } } },
    },
  });
  if (!lecture) return null;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lecture.section.courseId } },
    select: { id: true },
  });
  // 패스가 끝난 패스 수강은 진도 저장·퀴즈 응시도 막는다
  const enrolled = !!enrollment && (await paymentService.enrollmentActive(enrollment.id, userId, lecture.section.course));
  return { lecture, courseId: lecture.section.courseId, enrolled };
}

export async function markLectureComplete(userId: string, lectureId: string, courseId: string) {
  await prisma.progress.upsert({
    where: { userId_lectureId: { userId, lectureId } },
    create: { userId, lectureId, completed: true, completedAt: new Date() },
    update: { completed: true, completedAt: new Date() },
  });
  return recomputeEnrollment(userId, courseId);
}

/** 영상 완료 기준: 길이의 95% 이상 시청 (버퍼링·마지막 몇 초 오차 감안) */
export const VIDEO_COMPLETE_RATIO = 0.95;
/** 시청 위치가 늘 수 있는 최대 속도 — 플레이어 최고 배속(2배) + 여유 */
const MAX_WATCH_RATE = 2;
const WATCH_SLACK_SEC = 5;
/** 오래 멈췄다 다시 봐도 한 번 보고에 인정하는 경과 시간 상한 (보고 주기 5초) */
const MAX_ELAPSED_SEC = 60;

/**
 * 시청 기록 저장. watchedSec 는 '지금까지 본 가장 먼 지점'이다(이어보기 위치 겸 완료 판정 기준).
 * - 줄어들지 않는다(앞부분을 다시 봐도 유지).
 * - 직전 기록 이후 실제로 흐른 시간만큼만 늘 수 있다 → 요청을 조작해 끝으로 건너뛰어도 인정되지 않는다.
 */
export async function saveWatchedSec(userId: string, lectureId: string, watchedSec: number): Promise<number> {
  if (!Number.isFinite(watchedSec)) throw new Error("유효한 시청 위치가 필요합니다.");
  const reported = Math.max(0, Math.floor(watchedSec));
  const where = { where: { userId_lectureId: { userId, lectureId } } };
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.progress.findUnique({ ...where, select: { id: true, watchedSec: true, updatedAt: true } });
    if (!existing) {
      try {
        const row = await prisma.progress.create({ data: { userId, lectureId, watchedSec: Math.min(reported, WATCH_SLACK_SEC) } });
        return row.watchedSec;
      } catch (error) {
        if ((error as { code?: string }).code === "P2002") continue;
        throw error;
      }
    }
    const elapsed = Math.max(0, (Date.now() - existing.updatedAt.getTime()) / 1000);
    // 최초 보고의 여유 시간은 한 번만 준다. 반복 요청마다 더하면 시청 시간을 만들어낼 수 있다.
    const allowed = existing.watchedSec + Math.floor(Math.min(elapsed, MAX_ELAPSED_SEC) * MAX_WATCH_RATE);
    const next = Math.max(existing.watchedSec, Math.min(reported, allowed));
    const changed = await prisma.progress.updateMany({
      where: { id: existing.id, watchedSec: existing.watchedSec, updatedAt: existing.updatedAt },
      data: { watchedSec: next },
    });
    if (changed.count === 1) return next;
  }
  // 동시 보고가 겹치면 이미 확정된 위치를 돌려주고 다음 정기 보고에서 재시도한다.
  return (await prisma.progress.findUnique({ ...where, select: { watchedSec: true } }))?.watchedSec ?? 0;
}

/** 영상 완료 길이는 운영자가 저장한 서버 메타데이터만 신뢰한다. */
export function watchedEnough(watchedSec: number, lectureDuration: number | null): boolean {
  if (!lectureDuration || lectureDuration <= 0 || !Number.isFinite(lectureDuration) || !Number.isFinite(watchedSec) || watchedSec < 0) return false;
  return watchedSec >= Math.ceil(lectureDuration * VIDEO_COMPLETE_RATIO);
}

/**
 * 퀴즈 잠금: 같은 프로그램에서 이 퀴즈보다 앞에 있는 레슨을 모두 완료해야 열린다.
 * 잠겨 있으면 먼저 들어야 할 첫 레슨 id 를, 열려 있으면 null 을 돌려준다.
 */
export async function quizBlockedBy(userId: string, courseId: string, lectureId: string): Promise<string | null> {
  const ids = await orderedLectureIds(courseId);
  const before = ids.slice(0, Math.max(0, ids.indexOf(lectureId)));
  if (!before.length) return null;
  const done = new Set(
    (
      await prisma.progress.findMany({
        where: { userId, completed: true, lectureId: { in: before } },
        select: { lectureId: true },
      })
    ).map((p) => p.lectureId)
  );
  return before.find((id) => !done.has(id)) ?? null;
}

// ─── 퀴즈 채점 ───

interface QuizOption {
  text: string;
  correct?: boolean;
}

export type QuizAnswer = { questionId: string; choices?: number[]; texts?: string[] };

/** 대소문자·공백 무시 비교용 */
const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();

/** FILL_GAP 본문 "...|정답|..." 의 정답 목록 */
export function fillGapAnswers(text: string): string[] {
  return [...htmlToText(text).matchAll(/\|([^|]+)\|/g)].map((m) => m[1] ?? "");
}

function gradeQuestion(
  q: { type: string; options: Prisma.JsonValue },
  a: QuizAnswer | undefined
): boolean {
  const options = (Array.isArray(q.options) ? q.options : []) as unknown as QuizOption[];
  if (!a) return false;
  switch (q.type) {
    case "SINGLE":
    case "MULTI":
    case "TRUE_FALSE": {
      const correct = options.flatMap((o, i) => (o.correct ? [i] : []));
      const chosen = [...new Set(a.choices ?? [])].sort((x, y) => x - y);
      return correct.length > 0 && correct.length === chosen.length && correct.every((c, i) => c === chosen[i]);
    }
    case "FILL_GAP": {
      const answers = fillGapAnswers(options[0]?.text ?? "");
      const texts = a.texts ?? [];
      return answers.length > 0 && answers.every((ans, i) => norm(texts[i] ?? "") === norm(ans));
    }
    case "KEYWORDS": {
      // 키워드를 모두 포함하면 정답
      const input = norm((a.texts ?? []).join(" "));
      const keywords = options.map((o) => norm(o.text)).filter(Boolean);
      return input.length > 0 && keywords.length > 0 && keywords.every((k) => input.includes(k));
    }
    default:
      return false;
  }
}

export async function gradeQuiz(userId: string, lectureId: string, answers: QuizAnswer[]) {
  const quiz = await prisma.quiz.findUnique({
    where: { lectureId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) return null;
  const byId = new Map(answers.map((a) => [a.questionId, a]));
  const results = quiz.questions.map((q) => ({ questionId: q.id, correct: gradeQuestion(q, byId.get(q.id)) }));
  const correctCount = results.filter((r) => r.correct).length;
  const score = quiz.questions.length ? Math.floor((correctCount / quiz.questions.length) * 100) : 0;
  const passed = quiz.questions.length > 0 && correctCount * 100 >= quiz.passingScore * quiz.questions.length;
  await prisma.quizAttempt.create({ data: { userId, quizId: quiz.id, score, passed } });
  return { score, passed, passingScore: quiz.passingScore, correctCount, total: quiz.questions.length, results };
}

// ─── 마이 러닝 ───

export async function getMyEnrollments(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      progressPercent: true,
      completedAt: true,
      createdAt: true,
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          thumbnail: true,
          coverMode: true,
          productType: true,
          level: true,
          audiences: true,
          status: true,
          category: { select: { name: true, slug: true } },
          provider: { select: { name: true } },
          sections: {
            orderBy: { order: "asc" },
            select: { lectures: { orderBy: { order: "asc" }, select: { id: true } } },
          },
        },
      },
    },
  });
  const allLectureIds = enrollments.flatMap((e) => e.course.sections.flatMap((s) => s.lectures.map((l) => l.id)));
  const done = new Set(
    (
      await prisma.progress.findMany({
        where: { userId, completed: true, lectureId: { in: allLectureIds } },
        select: { lectureId: true },
      })
    ).map((p) => p.lectureId)
  );
  return enrollments.map((e) => {
    const ids = e.course.sections.flatMap((s) => s.lectures.map((l) => l.id));
    const doneCount = ids.filter((id) => done.has(id)).length;
    // 이어보기: 첫 미완료 레슨, 다 들었으면 첫 레슨
    const resumeLectureId = ids.find((id) => !done.has(id)) ?? ids[0] ?? null;
    return {
      id: e.id,
      progressPercent: e.completedAt ? 100 : e.progressPercent,
      completedAt: e.completedAt,
      enrolledAt: e.createdAt,
      lectureCount: ids.length,
      doneCount,
      resumeLectureId,
      course: {
        slug: e.course.slug,
        title: e.course.title,
        thumbnail: e.course.thumbnail,
        coverMode: e.course.coverMode,
        productType: e.course.productType,
        level: e.course.level,
        audiences: e.course.audiences,
        archived: e.course.status !== "PUBLISHED",
        category: e.course.category,
        provider: e.course.provider?.name ?? null,
      },
    };
  });
}

export async function getMyCertificates(userId: string) {
  return prisma.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
    select: {
      number: true,
      issuedAt: true,
      expiresAt: true,
      course: { select: { title: true, slug: true, thumbnail: true, provider: { select: { name: true } } } },
    },
  });
}

export async function getCertificateByNumber(number: string) {
  return prisma.certificate.findUnique({
    where: { number },
    select: {
      number: true,
      issuedAt: true,
      expiresAt: true,
      userId: true,
      user: { select: { name: true, email: true } },
      course: {
        select: { title: true, durationMin: true, provider: { select: { name: true } } },
      },
    },
  });
}

/** 첫 미완료 레슨 (상세 페이지 "이어보기") */
export async function getResumeLectureId(userId: string, courseId: string): Promise<string | null> {
  const ids = await orderedLectureIds(courseId);
  if (!ids.length) return null;
  const done = new Set(
    (
      await prisma.progress.findMany({
        where: { userId, completed: true, lectureId: { in: ids } },
        select: { lectureId: true },
      })
    ).map((p) => p.lectureId)
  );
  return ids.find((id) => !done.has(id)) ?? ids[0];
}
