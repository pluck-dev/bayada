import assert from "node:assert/strict";
import { prisma } from "@bayada/db";
import { getLectureEnrollment, saveWatchedSec, watchedEnough, markLectureComplete, quizBlockedBy, gradeQuiz } from "../src/lib/queries/learning";

const url = new URL(process.env.DATABASE_URL ?? "http://invalid");
if (url.hostname !== "127.0.0.1" || url.port !== "55433" || url.pathname !== "/bayada_functional_qa") throw new Error("This integration test writes only to the isolated synthetic QA database.");

async function main() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: "qa-student@qa.invalid" } });
  const suffix = Date.now().toString(36);
  const course = await prisma.course.create({ data: { title: `QA 학습 통합 ${suffix}`, slug: `qa-learning-${suffix}`, price: 0, status: "PUBLISHED", visibility: "PUBLIC", audiences: ["RN"], objectives: ["가상 학습 흐름 검증"], durationMin: 2 } });
  const section = await prisma.section.create({ data: { courseId: course.id, title: "QA 섹션", order: 0 } });
  const video = await prisma.lecture.create({ data: { sectionId: section.id, title: "QA 영상", order: 0, type: "VIDEO", duration: 100, videoUrl: "/media/qa-fixture.mp4" } });
  const text = await prisma.lecture.create({ data: { sectionId: section.id, title: "QA 읽기", order: 1, type: "TEXT", content: "<p>가상 읽기 자료</p>" } });
  const quiz = await prisma.lecture.create({ data: { sectionId: section.id, title: "QA 평가", order: 2, type: "QUIZ", quiz: { create: { passingScore: 80, questions: { create: [{ order: 0, type: "SINGLE", text: "정답을 선택하세요", options: [{ text: "정답", correct: true }, { text: "오답" }] }, { order: 1, type: "MULTI", text: "모든 정답 선택", options: [{ text: "정답1", correct: true }, { text: "오답" }, { text: "정답2", correct: true }] }] } } } }, include: { quiz: { include: { questions: { orderBy: { order: "asc" } } } } } });
  assert.equal((await getLectureEnrollment(user.id, video.id))?.enrolled, false);
  await prisma.enrollment.create({ data: { userId: user.id, courseId: course.id } });
  assert.equal((await getLectureEnrollment(user.id, video.id))?.enrolled, true);
  assert.equal(await quizBlockedBy(user.id, course.id, quiz.id), video.id);
  assert.equal(await saveWatchedSec(user.id, video.id, 100), 5);
  await Promise.all(Array.from({ length: 8 }, () => saveWatchedSec(user.id, video.id, 100)));
  const early = await prisma.progress.findUniqueOrThrow({ where: { userId_lectureId: { userId: user.id, lectureId: video.id } } });
  assert.equal(early.watchedSec, 5);
  assert.equal(watchedEnough(early.watchedSec, video.duration), false);
  // Simulated elapsed time tests server accounting; no real video playback is claimed.
  await prisma.progress.update({ where: { id: early.id }, data: { updatedAt: new Date(Date.now() - 60000) } });
  assert.equal(await saveWatchedSec(user.id, video.id, 95), 95);
  assert.equal(watchedEnough(95, video.duration), true);
  await markLectureComplete(user.id, video.id, course.id);
  assert.equal(await quizBlockedBy(user.id, course.id, quiz.id), text.id);
  await markLectureComplete(user.id, text.id, course.id);
  assert.equal(await quizBlockedBy(user.id, course.id, quiz.id), null);
  const questions = quiz.quiz!.questions;
  const failed = await gradeQuiz(user.id, quiz.id, questions.map((q) => ({ questionId: q.id, choices: [1] })));
  assert.equal(failed?.passed, false);
  assert.equal(await prisma.certificate.count({ where: { userId: user.id, courseId: course.id } }), 0);
  const passed = await gradeQuiz(user.id, quiz.id, [{ questionId: questions[0]!.id, choices: [0] }, { questionId: questions[1]!.id, choices: [0, 2] }]);
  assert.equal(passed?.passed, true);
  const enrollment = await markLectureComplete(user.id, quiz.id, course.id);
  assert.equal(enrollment?.progressPercent, 100);
  assert.ok(enrollment?.completedAt);
  await markLectureComplete(user.id, quiz.id, course.id);
  const certificates = await prisma.certificate.findMany({ where: { userId: user.id, courseId: course.id } });
  assert.equal(certificates.length, 1);
  assert.match(certificates[0]!.number, /^BA-\d{4}-\d{6}$/);
  console.log(JSON.stringify({ passed: true, courseId: course.id, slug: course.slug, lectureIds: { video: video.id, text: text.id, quiz: quiz.id }, certificate: certificates[0]!.number, coverage: ["enrollment lookup", "quiz prerequisites", "parallel progress reports", "95 percent threshold", "failed and passed quiz", "completion and idempotent certificate"] }));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Integration failed"); process.exitCode = 1; }).finally(() => prisma.$disconnect());
