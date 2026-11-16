import assert from "node:assert/strict";
import { test } from "node:test";
import { readHistoryTable, unixDate, quizDate, mergeEnrollment } from "./wp-history-source";

const schema = "CREATE TABLE `lLJ_stm_lms_user_quizzes` (\n  `id` int,\n  `value` text\n) ENGINE=InnoDB;\n";
const read = (body: string) => readHistoryTable(schema + body, "stm_lms_user_quizzes");

test("reads multiline INSERT batches and ignores unrelated SQL", () => {
  assert.deepEqual(read('INSERT INTO `lLJ_stm_lms_user_quizzes` VALUES (1,"a,();b"),\n(2,NULL);\nDROP DATABASE unrelated;\nINSERT INTO `lLJ_stm_lms_user_quizzes` VALUES (3,42);'), [
    { id: 1, value: "a,();b" }, { id: 2, value: null }, { id: 3, value: 42 },
  ]);
});

test("decodes MySQL escaping without executing source text", () => {
  assert.deepEqual(read(String.raw`INSERT INTO \`lLJ_stm_lms_user_quizzes\` VALUES (1,'it\'s'),(2,"line\nnext"),(3,'double''quote');`.replaceAll("\\`", "`")), [
    { id: 1, value: "it's" }, { id: 2, value: "line\nnext" }, { id: 3, value: "double'quote" },
  ]);
});

test("rejects truncated backups, wrong column counts and executable expressions", () => {
  for (const input of [
    'INSERT INTO `lLJ_stm_lms_user_quizzes` VALUES (1,"unterminated',
    'INSERT INTO `lLJ_stm_lms_user_quizzes` VALUES (1);',
    'INSERT INTO `lLJ_stm_lms_user_quizzes` VALUES (1,NOW());',
  ]) assert.throws(() => read(input));
  assert.throws(() => readHistoryTable("", "stm_lms_user_courses"), /Missing schema/);
});

test("does not fabricate missing completion dates and requires explicit quiz timezone", () => {
  assert.equal(unixDate(0), null);
  assert.equal(unixDate(null), null);
  assert.equal(unixDate(1644396200)?.toISOString(), "2022-02-09T08:43:20.000Z");
  assert.equal(quizDate(null, "+09:00"), null);
  assert.equal(quizDate("0000-00-00 00:00:00", "+09:00"), null);
  assert.equal(quizDate("2022-02-09 18:43:20", "+09:00")?.toISOString(), "2022-02-09T09:43:20.000Z");
  assert.throws(() => quizDate("2022-02-09 18:43:20", ""), /offset/);
});

test("old backups cannot lower current progress or remove completion and original registration", () => {
  const old = { progressPercent: 100, completedAt: new Date("2026-11-10T00:00:00Z"), createdAt: new Date("2022-02-09T00:00:00Z") };
  const source = { progress_percent: 20, start_time: 1644396200, end_time: 0 };
  assert.deepEqual(mergeEnrollment(source, old), old);
  const current = { ...old, progressPercent: 40, completedAt: null };
  assert.deepEqual(mergeEnrollment({ ...source, progress_percent: 80 }, current), { ...current, progressPercent: 80 });
  const done = mergeEnrollment({ ...source, progress_percent: 100, end_time: 1644396300 }, current);
  assert.equal(done.completedAt?.getTime(), 1644396300000);
  assert.equal(done.createdAt, current.createdAt);
  assert.throws(() => mergeEnrollment({ ...source, progress_percent: 101 }), /Invalid source progress/);
  assert.throws(() => mergeEnrollment({ ...source, start_time: 0 }), /Missing enrollment start date/);
});
