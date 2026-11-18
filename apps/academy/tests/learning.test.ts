import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma } from "@bayada/db";
import { gradeQuiz, recomputeEnrollment, saveWatchedSec, watchedEnough } from "../src/lib/queries/learning";

test("rapid repeated video reports cannot mint extra watched seconds", async () => {
  const oldFind = prisma.progress.findUnique, oldUpsert = prisma.progress.upsert, oldCreate = prisma.progress.create, oldUpdate = prisma.progress.updateMany;
  const oldNow = Date.now;
  let now = 100000;
  let row: { id: string; watchedSec: number; updatedAt: Date } | null = null;
  Date.now = () => now;
  try {
    prisma.progress.findUnique = (async () => row ? { ...row } : null) as unknown as typeof oldFind;
    prisma.progress.upsert = (async (args: any) => { row = { id: "p", watchedSec: args.update.watchedSec, updatedAt: new Date(now) }; return row; }) as unknown as typeof oldUpsert;
    prisma.progress.create = (async (args: any) => { row = { id: "p", watchedSec: args.data.watchedSec, updatedAt: new Date(now) }; return row; }) as unknown as typeof oldCreate;
    prisma.progress.updateMany = (async (args: any) => { row = { ...row!, watchedSec: args.data.watchedSec, updatedAt: new Date(now) }; return { count: 1 }; }) as typeof oldUpdate;
    assert.equal(await saveWatchedSec("u", "l", 1000), 5);
    for (let i = 0; i < 20; i++) await saveWatchedSec("u", "l", 1000);
    assert.equal(row!.watchedSec, 5, "same-clock requests must not repeatedly receive the initial allowance");
    now += 5000;
    assert.equal(await saveWatchedSec("u", "l", 1000), 15);
    assert.equal(await saveWatchedSec("u", "l", 1), 15, "rewatching never lowers the saved position");
  } finally {
    prisma.progress.findUnique = oldFind; prisma.progress.upsert = oldUpsert; prisma.progress.create = oldCreate; prisma.progress.updateMany = oldUpdate; Date.now = oldNow;
  }
});
test("rounding 199 of 200 lessons must not issue a certificate", async () => {
  const oldEnrollment = prisma.enrollment.findUnique, oldSections = prisma.section.findMany, oldCount = prisma.progress.count, oldUpdate = prisma.enrollment.update;
  const oldCertificate = prisma.certificate.findUnique;
  let certificateRead = false;
  let saved: any;
  try {
    prisma.enrollment.findUnique = (async () => ({ id: "e", progressPercent: 0, completedAt: null })) as unknown as typeof oldEnrollment;
    prisma.section.findMany = (async () => [{ lectures: Array.from({ length: 200 }, (_, i) => ({ id: `l${i}` })) }]) as unknown as typeof oldSections;
    prisma.progress.count = (async () => 199) as typeof oldCount;
    prisma.enrollment.update = (async (args: any) => { saved = args.data; return { id: "e", completedAt: null, ...args.data }; }) as typeof oldUpdate;
    prisma.certificate.findUnique = (async () => { certificateRead = true; return { id: "c" }; }) as unknown as typeof oldCertificate;
    await recomputeEnrollment("u", "c");
    assert.equal(saved.completedAt, undefined);
    assert.equal(saved.progressPercent, 99);
    assert.equal(certificateRead, false);
  } finally {
    prisma.enrollment.findUnique = oldEnrollment; prisma.section.findMany = oldSections; prisma.progress.count = oldCount; prisma.enrollment.update = oldUpdate; prisma.certificate.findUnique = oldCertificate;
  }
});
test("video completion does not round a one-second lesson down to zero", () => {
  assert.equal(watchedEnough(0, 1), false);
  assert.equal(watchedEnough(100, null), false);
  assert.equal(watchedEnough(Infinity, 100), false);
  assert.equal(watchedEnough(94, 100), false);
  assert.equal(watchedEnough(95, 100), true);
});

test("quiz passing is based on exact correct-answer ratio and never an empty quiz", async () => {
  const oldQuiz = prisma.quiz.findUnique, oldAttempt = prisma.quizAttempt.create;
  const questions = Array.from({ length: 200 }, (_, i) => ({ id: `q${i}`, type: "SINGLE", options: [{ text: "정답", correct: true }, { text: "오답" }] }));
  let configured: any = { id: "quiz", passingScore: 100, questions };
  try {
    prisma.quiz.findUnique = (async () => configured) as unknown as typeof oldQuiz;
    prisma.quizAttempt.create = (async () => ({ id: "attempt" })) as unknown as typeof oldAttempt;
    const answers = questions.map((q, i) => ({ questionId: q.id, choices: [i === 0 ? 1 : 0] }));
    const result = await gradeQuiz("u", "l", answers);
    assert.equal(result?.passed, false);
    assert.equal(result?.score, 99);
    configured = { id: "quiz", passingScore: 0, questions: [] };
    assert.equal((await gradeQuiz("u", "l", []))?.passed, false);
  } finally { prisma.quiz.findUnique = oldQuiz; prisma.quizAttempt.create = oldAttempt; }
});
