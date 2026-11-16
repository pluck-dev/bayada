/**
 * Supplement existing WP users/curricula from dump.sql without changing accounts,
 * content, permissions or certificates. Defaults to a read-only reconciliation.
 * Run from repository root with the SAME env file as apps/admin:
 * node --env-file=apps/admin/.env.local --import=./packages/db/node_modules/tsx/dist/loader.mjs
 *   packages/db/scripts/import-wp-history.ts --source=<dump.sql> --source-offset=+09:00 [--apply]
 * --source-only validates/counts the backup without connecting to a database.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { readHistoryTable, unixDate, quizDate, mergeEnrollment } from "./wp-history-source";

const args = process.argv.slice(2);
const allowed = /^(--source=.+|--source-offset=[+-]\d\d:\d\d|--apply|--source-only)$/;
if (args.some((arg) => !allowed.test(arg))) throw new Error("Unknown option");
const source = args.find((arg) => arg.startsWith("--source="))?.slice(9);
if (!source) throw new Error("Provide --source=<dump.sql>");
const offset = args.find((arg) => arg.startsWith("--source-offset="))?.slice(16);
const apply = args.includes("--apply");
if (apply && args.includes("--source-only")) throw new Error("--source-only cannot apply changes");
const sql = readFileSync(source, "utf8");
const enrollments = readHistoryTable(sql, "stm_lms_user_courses");
const lessons = readHistoryTable(sql, "stm_lms_user_lessons");
const attempts = readHistoryTable(sql, "stm_lms_user_quizzes");
console.log(JSON.stringify({ sourceSha256: createHash("sha256").update(sql).digest("hex"),
  sourceRows: { enrollments: enrollments.length, lessons: lessons.length, attempts: attempts.length } }));

async function main() {
  if (args.includes("--source-only")) return;
  if (!offset) throw new Error("Backup has no timezone declaration. Provide --source-offset after checking the source server timezone.");
  quizDate(null, offset);
  if (!process.env.DATABASE_URL) throw new Error("Load the admin DATABASE_URL explicitly");
  const target = new URL(process.env.DATABASE_URL);
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", target: `${target.hostname}:${target.port}${target.pathname}`, sourceOffset: offset }));
  const prisma = new PrismaClient();
  try {
    await prisma.$transaction(async (tx) => {
      // Serialize importer runs and reject a stale concurrent update rather than lose new progress.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(716420261116)`;
      const [users, courses, lectures, existingEnrollments, existingProgress, existingAttempts] = await Promise.all([
        tx.user.findMany({ where: { legacyWpId: { not: null } }, select: { id: true, legacyWpId: true } }),
        tx.course.findMany({ where: { legacyWpId: { not: null } }, select: { id: true, legacyWpId: true } }),
        tx.lecture.findMany({ where: { legacyWpId: { not: null } }, select: { id: true, legacyWpId: true, section: { select: { course: { select: { legacyWpId: true } } } }, quiz: { select: { id: true } } } }),
        tx.enrollment.findMany(), tx.progress.findMany(), tx.quizAttempt.findMany(),
      ]);
      const userMap = new Map(users.map((u) => [u.legacyWpId, u.id]));
      const courseMap = new Map(courses.map((c) => [c.legacyWpId, c.id]));
      const lectureMap = new Map<string, typeof lectures>();
      for (const l of lectures) {
        const key = `${l.section.course.legacyWpId}:${l.legacyWpId}`;
        lectureMap.set(key, [...(lectureMap.get(key) ?? []), l]);
      }
      const enrolled = new Map(existingEnrollments.map((e) => [`${e.userId}:${e.courseId}`, e]));
      const progress = new Map(existingProgress.map((p) => [`${p.userId}:${p.lectureId}`, p]));
      const consumed = new Set<string>();
      const summary = {
        enrollments: { create: 0, update: 0, unchanged: 0, missingUser: 0, missingCourse: 0 },
        lessons: { create: 0, update: 0, unchanged: 0, missingUser: 0, missingLecture: 0, incomplete: 0 },
        attempts: { create: 0, unchanged: 0, missingUser: 0, missingQuiz: 0, undated: 0 },
      };
      const stats = summary.enrollments;
      for (const row of enrollments) {
        const userId = userMap.get(Number(row.user_id)), courseId = courseMap.get(Number(row.course_id));
        if (!userId) { stats.missingUser++; continue; }
        if (!courseId) { stats.missingCourse++; continue; }
        const key = `${userId}:${courseId}`, old = enrolled.get(key);
        const merged = mergeEnrollment(row, old);
        const { progressPercent, completedAt } = merged;
        const data = { userId, courseId, ...merged };
        if (old && old.progressPercent === progressPercent && old.completedAt?.getTime() === completedAt?.getTime()) stats.unchanged++;
        else {
          if (old) stats.update++; else stats.create++;
          if (apply) await tx.enrollment.upsert({ where: { userId_courseId: { userId, courseId } }, create: data, update: { progressPercent, completedAt } });
        }
        enrolled.set(key, { ...data, id: old?.id ?? "planned" });
      }
      for (const row of lessons) {
        const stats = summary.lessons, userId = userMap.get(Number(row.user_id));
        if (!userId) { stats.missingUser++; continue; }
        const matches = lectureMap.get(`${row.course_id}:${row.lesson_id}`);
        if (!matches?.length) { stats.missingLecture++; continue; }
        const date = unixDate(row.end_time);
        if (!date) { stats.incomplete++; continue; }
        for (const lecture of matches) {
          const key = `${userId}:${lecture.id}`, old = progress.get(key);
          if (old?.completed && old.completedAt) { stats.unchanged++; continue; }
          const data = { completed: true, completedAt: old?.completedAt ?? date };
          if (old) stats.update++; else stats.create++;
          if (apply) await tx.progress.upsert({ where: { userId_lectureId: { userId, lectureId: lecture.id } }, create: { userId, lectureId: lecture.id, ...data }, update: data });
          progress.set(key, { id: old?.id ?? "planned", userId, lectureId: lecture.id, watchedSec: old?.watchedSec ?? 0, updatedAt: old?.updatedAt ?? date, ...data });
        }
      }
      for (const row of attempts) {
        const stats = summary.attempts, userId = userMap.get(Number(row.user_id));
        if (!userId) { stats.missingUser++; continue; }
        const matches = lectureMap.get(`${row.course_id}:${row.quiz_id}`)?.filter((l) => l.quiz);
        if (!matches?.length) { stats.missingQuiz++; continue; }
        const date = quizDate(row.created_at, offset);
        if (!date) stats.undated++;
        const score = Number(row.progress), passed = row.status === "passed";
        if (!Number.isInteger(score) || score < 0 || score > 100) throw new Error("Invalid source quiz score");
        for (const lecture of matches) {
          const quizId = lecture.quiz!.id;
          const id = `wp-history-${date ? "dated" : "undated"}-${row.user_quiz_id}-${quizId}`;
          // Match the previous importer's randomly generated IDs, preserving repeated attempts.
          const old = existingAttempts.find((a) => a.id === id) ?? existingAttempts.find((a) =>
            !consumed.has(a.id) && a.userId === userId && a.quizId === quizId && a.score === score && a.passed === passed && (!date || a.createdAt.getTime() === date.getTime()));
          if (old) { consumed.add(old.id); stats.unchanged++; continue; }
          stats.create++;
          if (apply) await tx.quizAttempt.create({ data: { id, userId, quizId, score, passed, createdAt: date ?? new Date(0) } });
        }
      }
      console.log(JSON.stringify(summary, null, 2));
    }, { isolationLevel: "Serializable", timeout: 120_000, maxWait: 15_000 });
  } finally { await prisma.$disconnect(); }
}

main().catch((error) => {
  // Do not print connection strings, source values or Prisma query arguments.
  console.error(error instanceof Error ? error.message.replace(/(?:postgres(?:ql)?|mysql):\/\/\S+/g, "[redacted]") : "History import failed");
  process.exitCode = 1;
});
