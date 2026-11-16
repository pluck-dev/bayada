import assert from "node:assert/strict";
import { test } from "node:test";
import { buildArchive, safeUploadRelative, plainText, answerText } from "./wp-archive";
import { readWpTable } from "./wp-history-source";

function table(name: string, data: Record<string, unknown>[]) {
  const columns = data.length ? Object.keys(data[0]!) : ["id"];
  return `CREATE TABLE \`lLJ_${name}\` (\n${columns.map((key) => `  \`${key}\` text`).join(",\n")}\n) ENGINE=InnoDB;\n` +
    (data.length ? `INSERT INTO \`lLJ_${name}\` VALUES ${data.map((r) => `(${columns.map((k) => r[k] === null ? "NULL" : typeof r[k] === "number" ? r[k] : JSON.stringify(r[k])).join(",")})`).join(",\n")};\n` : "");
}

test("preserves pending, secret, trash and deleted-user records with stable identities, excluding passwords", () => {
  const fixtures: Record<string, Record<string, unknown>[]> = {
    posts: [{ ID: 10, post_title: "과정", post_type: "stm-courses", post_author: 1, post_status: "publish", post_content: "", post_date: "2022-01-01" },
      { ID: 20, post_title: "후기", post_type: "stm-reviews", post_author: 999, post_status: "pending", post_content: "<p>후기 본문</p>", post_date: "2022-01-02" }],
    users: [{ ID: 1, display_name: "학습자", user_pass: "MUST_NOT_IMPORT" }],
    postmeta: [{ post_id: 20, meta_key: "review_course", meta_value: "10" }],
    kboard_board_setting: [{ uid: 1, board_name: "문의게시판" }],
    kboard_board_content: [{ uid: 1, title: "비공개 문의", content: "<p>내용</p><script>bad()</script>", status: "", secret: "true", member_uid: 999, board_id: 1, member_display: "이전 회원", date: "20220101", password: "MUST_NOT_IMPORT" },
      { uid: 2, title: "휴지통", content: "보존", status: "trash", secret: "", member_uid: 1, board_id: 1, member_display: "회원", date: "20220101", password: "MUST_NOT_IMPORT" }],
    kboard_board_attached: [{ uid: 1, content_uid: 1, file_name: "자료.pdf", file_path: "/wp-content/uploads/a.pdf", file_size: 123, date: "20220101" }],
    kboard_meida: [], usermeta: [{ umeta_id: 1, user_id: 999, meta_key: "stm_lms_certificate_code_10", meta_value: "OLD-123" }],
    stm_lms_user_answers: [{ user_answer_id: 1, user_id: 999, course_id: 10, quiz_id: 30, question_id: 40, user_answer: "답", correct_answer: "정답", attempt_number: 2 }],
    comments: [], stm_lms_user_quizzes_times: [],
    stm_lms_user_courses: [{ user_course_id: 1, user_id: 999, course_id: 10, progress_percent: 80 }],
    stm_lms_user_lessons: [], stm_lms_user_quizzes: [],
  };
  const sql = Object.entries(fixtures).map(([name, data]) => table(name, data)).join("\n");
  const records = buildArchive(sql);
  assert.deepEqual(buildArchive(sql), records);
  assert.equal(new Set(records.map((r) => r.id)).size, records.length);
  assert.equal(records.find((r) => r.id === "wp-board-1")?.status, "PRIVATE");
  assert.equal(records.find((r) => r.id === "wp-board-2")?.status, "TRASH");
  assert.equal(records.find((r) => r.kind === "REVIEW")?.status, "PENDING");
  assert.equal(records.find((r) => r.kind === "ANSWER")?.userWpId, 999);
  assert.equal(records.find((r) => r.kind === "CERTIFICATE")?.body, "OLD-123");
  assert.equal(records.find((r) => r.kind === "HISTORY")?.userWpId, 999);
  assert.equal(records.find((r) => r.kind === "FILE")?.payload.boardRecordId, "wp-board-1");
  assert.equal(JSON.stringify(records).includes("MUST_NOT_IMPORT"), false);
  assert.equal(records.find((r) => r.id === "wp-board-1")?.body, "내용");
});

test("attachment paths cannot escape uploads or use Windows absolute paths", () => {
  assert.equal(safeUploadRelative("/wp-content/uploads/kboard_attached/a.pdf"), "kboard_attached/a.pdf");
  for (const value of ["/etc/passwd", "/wp-content/uploads/../secret", "/wp-content/uploads/C:/secret", "/wp-content/uploads/a\\b", "/wp-content/uploads/a\0b"])
    assert.throws(() => safeUploadRelative(value));
  assert.throws(() => readWpTable("", "users` injected"));
});

test("displays old HTML as text and decodes serialized submitted answers", () => {
  assert.equal(plainText('<script>alert(1)</script><p>안내 &amp; 자료</p>'), "안내 & 자료");
  assert.equal(answerText('a:2:{i:0;s:1:"A";i:1;s:1:"B";}'), "A / B");
  assert.equal(answerText("일반 답안"), "일반 답안");
});
