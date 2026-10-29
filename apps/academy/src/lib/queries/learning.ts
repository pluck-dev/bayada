import { prisma, Prisma } from "@bayada/db";
import { htmlToText } from "@/lib/html-text";

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
  const percent = Math.round((done / lectureIds.length) * 100);
  const completed = percent >= 100;
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
    select: { id: true, type: true, section: { select: { courseId: true } } },
  });
  if (!lecture) return null;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lecture.section.courseId } },
    select: { id: true },
  });
  return { lecture, courseId: lecture.section.courseId, enrolled: !!enrollment };
}

export async function markLectureComplete(userId: string, lectureId: string, courseId: string) {
  await prisma.progress.upsert({
    where: { userId_lectureId: { userId, lectureId } },
    create: { userId, lectureId, completed: true, completedAt: new Date() },
    update: { completed: true, completedAt: new Date() },
  });
  return recomputeEnrollment(userId, courseId);
}

export async function saveWatchedSec(userId: string, lectureId: string, watchedSec: number) {
  const sec = Math.max(0, Math.floor(watchedSec));
  await prisma.progress.upsert({
    where: { userId_lectureId: { userId, lectureId } },
    create: { userId, lectureId, watchedSec: sec },
    update: { watchedSec: sec },
  });
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
  const score = quiz.questions.length ? Math.round((correctCount / quiz.questions.length) * 100) : 0;
  const passed = score >= quiz.passingScore;
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
          status: true,
          category: { select: { name: true } },
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
        archived: e.course.status !== "PUBLISHED",
        category: e.course.category?.name ?? null,
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
