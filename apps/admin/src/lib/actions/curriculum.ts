"use server";

import { revalidatePath } from "next/cache";
import { prisma, type LectureType, type QuestionType } from "@bayada/db";
import { ActionError, audit, runAction } from "../session";
import { assertEditable } from "../guards";
import { QUESTION_TYPES } from "../labels";

const LECTURE_TYPES: LectureType[] = ["VIDEO", "TEXT", "QUIZ"];

function done(courseId: string) {
  revalidatePath(`/[locale]/(dashboard)/programs/${courseId}`, "page");
}

async function log(actorId: string, courseId: string, op: string, detail: Record<string, unknown>) {
  await audit(actorId, "course.curriculum", `Course:${courseId}`, { op, ...detail });
}

async function sectionCourse(sectionId: string): Promise<string> {
  const s = await prisma.section.findUnique({ where: { id: sectionId }, select: { courseId: true } });
  if (!s) throw new ActionError("섹션을 찾을 수 없습니다.");
  return s.courseId;
}

async function lectureCourse(lectureId: string): Promise<{ courseId: string; sectionId: string }> {
  const l = await prisma.lecture.findUnique({
    where: { id: lectureId },
    select: { sectionId: true, section: { select: { courseId: true } } },
  });
  if (!l) throw new ActionError("레슨을 찾을 수 없습니다.");
  return { courseId: l.section.courseId, sectionId: l.sectionId };
}

// ─── 섹션 ───
export async function addSection(courseId: string, title: string) {
  return runAction("program.write", async (user) => {
    await assertEditable(courseId);
    const t = title.trim();
    if (!t) throw new ActionError("섹션 제목을 입력하세요.");
    const last = await prisma.section.aggregate({ where: { courseId }, _max: { order: true } });
    await prisma.section.create({ data: { courseId, title: t, order: (last._max.order ?? -1) + 1 } });
    await log(user.id, courseId, "section.add", { title: t });
    done(courseId);
    return { message: "섹션을 추가했습니다." };
  });
}

export async function renameSection(sectionId: string, title: string) {
  return runAction("program.write", async (user) => {
    const courseId = await sectionCourse(sectionId);
    await assertEditable(courseId);
    const t = title.trim();
    if (!t) throw new ActionError("섹션 제목을 입력하세요.");
    await prisma.section.update({ where: { id: sectionId }, data: { title: t } });
    await log(user.id, courseId, "section.rename", { title: t });
    done(courseId);
    return { message: "섹션 제목을 바꿨습니다." };
  });
}

export async function deleteSection(sectionId: string) {
  return runAction("program.write", async (user) => {
    const courseId = await sectionCourse(sectionId);
    await assertEditable(courseId);
    const lectures = await prisma.lecture.findMany({ where: { sectionId }, select: { id: true } });
    const progress = await prisma.progress.count({ where: { lectureId: { in: lectures.map((l) => l.id) } } });
    if (progress) throw new ActionError("학습 기록이 있는 레슨이 포함된 섹션은 삭제할 수 없습니다.");
    const s = await prisma.section.delete({ where: { id: sectionId } });
    await log(user.id, courseId, "section.delete", { title: s.title });
    done(courseId);
    return { message: "섹션을 삭제했습니다." };
  });
}

/** 위/아래 이동 — 이웃과 order 를 맞바꾼다 */
export async function moveSection(sectionId: string, dir: -1 | 1) {
  return runAction("program.write", async (user) => {
    const courseId = await sectionCourse(sectionId);
    await assertEditable(courseId);
    const list = await prisma.section.findMany({ where: { courseId }, orderBy: { order: "asc" }, select: { id: true } });
    const i = list.findIndex((s) => s.id === sectionId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    await prisma.$transaction(list.map((s, idx) => prisma.section.update({ where: { id: s.id }, data: { order: idx } })));
    await log(user.id, courseId, "section.move", { sectionId, dir });
    done(courseId);
  });
}

// ─── 레슨 ───
export async function addLecture(sectionId: string, type: LectureType, title: string) {
  return runAction<{ id: string }>("program.write", async (user) => {
    const courseId = await sectionCourse(sectionId);
    await assertEditable(courseId);
    if (!LECTURE_TYPES.includes(type)) throw new ActionError("레슨 유형이 올바르지 않습니다.");
    const t = title.trim();
    if (!t) throw new ActionError("레슨 제목을 입력하세요.");
    const last = await prisma.lecture.aggregate({ where: { sectionId }, _max: { order: true } });
    const lecture = await prisma.lecture.create({
      data: {
        sectionId,
        type,
        title: t,
        order: (last._max.order ?? -1) + 1,
        ...(type === "QUIZ" ? { quiz: { create: { passingScore: 80 } } } : {}),
      },
    });
    await log(user.id, courseId, "lecture.add", { title: t, type });
    done(courseId);
    return { message: "레슨을 추가했습니다.", data: { id: lecture.id } };
  });
}

export interface LectureInput {
  title: string;
  videoUrl: string;
  durationMin: number | null;
  content: string;
  isFree: boolean;
}

export async function updateLecture(lectureId: string, input: LectureInput) {
  return runAction("program.write", async (user) => {
    const { courseId } = await lectureCourse(lectureId);
    await assertEditable(courseId);
    const title = input.title.trim();
    if (!title) throw new ActionError("레슨 제목을 입력하세요.");
    const videoUrl = input.videoUrl.trim();
    if (videoUrl && !/^https?:\/\//.test(videoUrl)) throw new ActionError("영상 URL 은 http(s) 로 시작해야 합니다.");
    const duration = input.durationMin ? Math.round(Number(input.durationMin) * 60) : null;
    await prisma.lecture.update({
      where: { id: lectureId },
      data: { title, videoUrl: videoUrl || null, duration, content: input.content.trim() || null, isFree: !!input.isFree },
    });
    await log(user.id, courseId, "lecture.update", { title });
    done(courseId);
    return { message: "레슨을 저장했습니다." };
  });
}

export async function deleteLecture(lectureId: string) {
  return runAction("program.write", async (user) => {
    const { courseId } = await lectureCourse(lectureId);
    await assertEditable(courseId);
    if (await prisma.progress.count({ where: { lectureId } })) {
      throw new ActionError("학습 기록이 있는 레슨은 삭제할 수 없습니다.");
    }
    const l = await prisma.lecture.delete({ where: { id: lectureId } });
    await log(user.id, courseId, "lecture.delete", { title: l.title });
    done(courseId);
    return { message: "레슨을 삭제했습니다." };
  });
}

export async function moveLecture(lectureId: string, dir: -1 | 1) {
  return runAction("program.write", async (user) => {
    const { courseId, sectionId } = await lectureCourse(lectureId);
    await assertEditable(courseId);
    const list = await prisma.lecture.findMany({ where: { sectionId }, orderBy: { order: "asc" }, select: { id: true } });
    const i = list.findIndex((l) => l.id === lectureId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    await prisma.$transaction(list.map((l, idx) => prisma.lecture.update({ where: { id: l.id }, data: { order: idx } })));
    await log(user.id, courseId, "lecture.move", { lectureId, dir });
    done(courseId);
  });
}

// ─── 퀴즈 ───
export interface QuestionInput {
  id?: string;
  type: QuestionType;
  text: string;
  options: { text: string; correct: boolean }[];
}

export async function saveQuiz(lectureId: string, passingScore: number, questions: QuestionInput[]) {
  return runAction("program.write", async (user) => {
    const { courseId } = await lectureCourse(lectureId);
    await assertEditable(courseId);
    const score = Math.round(Number(passingScore));
    if (!(score >= 0 && score <= 100)) throw new ActionError("합격 점수는 0~100 사이여야 합니다.");
    questions.forEach((q, i) => {
      const n = i + 1;
      if (!QUESTION_TYPES.includes(q.type)) throw new ActionError(`${n}번 문항 유형이 올바르지 않습니다.`);
      if (!q.text.trim()) throw new ActionError(`${n}번 문항 내용을 입력하세요.`);
      const opts = q.options.filter((o) => o.text.trim());
      if (!opts.length) throw new ActionError(`${n}번 문항에 보기(또는 정답)를 입력하세요.`);
      const correct = opts.filter((o) => o.correct).length;
      if ((q.type === "SINGLE" || q.type === "TRUE_FALSE") && correct !== 1) {
        throw new ActionError(`${n}번 문항은 정답을 하나만 표시하세요.`);
      }
      if (q.type === "MULTI" && correct < 1) throw new ActionError(`${n}번 문항에 정답을 1개 이상 표시하세요.`);
    });
    const lecture = await prisma.lecture.findUnique({ where: { id: lectureId }, select: { type: true, title: true } });
    if (lecture?.type !== "QUIZ") throw new ActionError("퀴즈 레슨이 아닙니다.");

    const quiz = await prisma.quiz.upsert({
      where: { lectureId },
      create: { lectureId, passingScore: score },
      update: { passingScore: score },
    });
    // 이전(WordPress) 문항 ID 는 재이전 시 매칭에 쓰이므로 유지한다
    const legacy = new Map(
      (await prisma.question.findMany({ where: { quizId: quiz.id }, select: { id: true, legacyWpId: true } })).map((q) => [
        q.id,
        q.legacyWpId,
      ]),
    );
    // 문항은 통째로 교체한다. 응시 기록(QuizAttempt)은 퀴즈에 묶여 있어 영향 없음
    await prisma.$transaction([
      prisma.question.deleteMany({ where: { quizId: quiz.id } }),
      prisma.question.createMany({
        data: questions.map((q, i) => ({
          quizId: quiz.id,
          order: i,
          type: q.type,
          legacyWpId: (q.id && legacy.get(q.id)) || null,
          text: q.text.trim(),
          options: q.options.filter((o) => o.text.trim()).map((o) => ({ text: o.text.trim(), correct: !!o.correct })),
        })),
      }),
    ]);
    await log(user.id, courseId, "quiz.save", { title: lecture.title, questions: questions.length, passingScore: score });
    done(courseId);
    return { message: `퀴즈를 저장했습니다 (${questions.length}문항).` };
  });
}
