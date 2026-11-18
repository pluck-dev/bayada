import assert from "node:assert/strict";
import { test } from "node:test";
import { curriculumIssues, type ReadyLecture } from "../src/lib/curriculum-readiness";
const lecture: ReadyLecture = { title: "영상", type: "VIDEO", videoUrl: "/media/test.mp4", duration: 100, content: null, quiz: null };
test("publishing rejects incomplete videos, empty text and questionless quizzes", () => {
  assert.deepEqual(curriculumIssues([lecture]), []);
  assert.equal(curriculumIssues([]).length, 1);
  assert.deepEqual(curriculumIssues([{ ...lecture, type: "TEXT", content: '<img src="/media/diagram.png" alt="교육 도표">' }]), []);
  assert.equal(curriculumIssues([{ ...lecture, videoUrl: null, duration: null }]).length, 1);
  assert.equal(curriculumIssues([{ ...lecture, type: "TEXT", content: "<p>&nbsp;</p>" }]).length, 1);
  assert.equal(curriculumIssues([{ ...lecture, type: "QUIZ", quiz: { questions: [] } }]).length, 1);
  assert.deepEqual(curriculumIssues([{ ...lecture, type: "TEXT", content: "<p>학습 자료</p>" }, { ...lecture, type: "QUIZ", quiz: { questions: [{ id: "q" }] } }]), []);
});
