import { readWpTable } from "./wp-history-source";
import { unserialize } from "./php-unserialize";

export type ArchiveRecord = {
  id: string; kind: string; sourceId: string; title: string; body: string; status: string;
  userWpId: number | null; courseWpId: number | null; sourceDate: string | null;
  payload: Record<string, unknown>;
};
export const plainText = (value: unknown) => String(value ?? "")
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
  .replace(/<\/?(?:p|div|br|li|h[1-6])\b[^>]*>/gi, "\n")
  .replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
  .replace(/\n{3,}/g, "\n\n").trim();

export function answerText(value: unknown): string {
  const text = String(value ?? "");
  const parsed = /^[abidsN]:/.test(text) ? unserialize(text) : null;
  if (parsed === null) return plainText(text);
  const collect = (v: unknown): string => v && typeof v === "object" ? Object.values(v).map(collect).join(" / ") : plainText(v);
  return collect(parsed);
}

export function buildArchive(sql: string) {
  const rows = (name: string) => readWpTable(sql, name);
  const posts = rows("posts"), postMap = new Map(posts.map((p) => [Number(p.ID), p]));
  const users = new Map(rows("users").map((u) => [Number(u.ID), plainText(u.display_name)]));
  const metadata = new Map<number, Record<string, unknown>>();
  for (const m of rows("postmeta")) {
    const id = Number(m.post_id), entry = metadata.get(id) ?? {};
    entry[String(m.meta_key)] = m.meta_value; metadata.set(id, entry);
  }
  const boardNames = new Map(rows("kboard_board_setting").map((b) => [Number(b.uid), String(b.board_name)]));
  const records: ArchiveRecord[] = [];
  const add = (kind: string, sourceId: string | number, title: string, body: string, status: string,
    userWpId: number | null, courseWpId: number | null, sourceDate: unknown, payload: Record<string, unknown>) => {
    const record = { id: `wp-${kind.toLowerCase()}-${sourceId}`, kind, sourceId: String(sourceId), title, body, status,
      userWpId: userWpId || null, courseWpId: courseWpId || null, sourceDate: sourceDate ? String(sourceDate) : null, payload };
    records.push(record); return record;
  };
  const courseName = (id: unknown) => plainText(postMap.get(Number(id))?.post_title) || `기존 프로그램 #${id}`;
  const userName = (id: unknown) => users.get(Number(id)) || `미연결 회원 #${id}`;
  for (const b of rows("kboard_board_content")) {
    const { password: _password, ...snapshot } = b;
    add("BOARD", Number(b.uid), plainText(b.title), plainText(b.content),
      b.status === "trash" ? "TRASH" : b.secret === "true" || Number(b.secret) === 1 ? "PRIVATE" : "PUBLISHED",
      Number(b.member_uid), null, b.date, { ...snapshot, boardName: boardNames.get(Number(b.board_id)) ?? "게시판", author: plainText(b.member_display), originalHtml: b.content });
  }
  for (const [table, prefix] of [["kboard_board_attached", "attached"], ["kboard_meida", "media"]] as const) {
    for (const f of rows(table)) add("FILE", `${prefix}-${f.uid}`, String(f.file_name), "", "PRESERVED", null, null, f.date,
      { originalPath: f.file_path, fileName: f.file_name, sourceSize: f.file_size, boardRecordId: f.content_uid ? `wp-board-${f.content_uid}` : null });
  }
  for (const m of rows("usermeta")) {
    const match = String(m.meta_key).match(/^stm_lms_certificate_code_(\d+)$/);
    if (!match) continue;
    const courseId = Number(match[1]);
    add("CERTIFICATE", Number(m.umeta_id), courseName(courseId), String(m.meta_value ?? ""), "PRESERVED", Number(m.user_id), courseId, null,
      { code: String(m.meta_value ?? ""), author: userName(m.user_id), sourceMetaKey: m.meta_key });
  }
  for (const a of rows("stm_lms_user_answers")) {
    const question = postMap.get(Number(a.question_id));
    add("ANSWER", Number(a.user_answer_id), plainText(question?.post_title) || `기존 문항 #${a.question_id}`, answerText(a.user_answer), "PRESERVED",
      Number(a.user_id), Number(a.course_id), null,
      { ...a, submittedAnswer: answerText(a.user_answer), expectedAnswer: answerText(a.correct_answer), author: userName(a.user_id), courseTitle: courseName(a.course_id), quizTitle: plainText(postMap.get(Number(a.quiz_id))?.post_title), questionText: question?.post_title ?? null });
  }
  for (const p of posts.filter((p) => p.post_type === "stm-reviews")) {
    const meta = metadata.get(Number(p.ID)) ?? {}, uid = Number(meta.review_user ?? p.post_author), cid = Number(meta.review_course);
    add("REVIEW", Number(p.ID), plainText(p.post_title) || courseName(cid), plainText(p.post_content), p.post_status === "publish" ? "PUBLISHED" : "PENDING",
      uid, cid, p.post_date, { author: userName(uid), courseTitle: courseName(cid), rating: meta.review_mark, originalStatus: p.post_status, originalHtml: p.post_content });
  }
  for (const p of posts.filter((p) => p.post_type === "post" && p.post_status === "publish"))
    add("ARTICLE", Number(p.ID), plainText(p.post_title), plainText(p.post_content), "PUBLISHED", Number(p.post_author), null, p.post_date,
      { originalHtml: p.post_content, author: userName(p.post_author), slug: p.post_name });
  for (const c of rows("comments")) add("COMMENT", Number(c.comment_ID), plainText(postMap.get(Number(c.comment_post_ID))?.post_title) || "기존 댓글",
    plainText(c.comment_content), c.comment_approved === "1" || c.comment_approved === 1 ? "PUBLISHED" : "PENDING", Number(c.user_id), null, c.comment_date,
    { postWpId: c.comment_post_ID, author: plainText(c.comment_author), originalStatus: c.comment_approved });
  for (const t of rows("stm_lms_user_quizzes_times")) add("QUIZ_TIME", Number(t.user_quiz_time_id), plainText(postMap.get(Number(t.quiz_id))?.post_title) || `기존 시험 #${t.quiz_id}`,
    "", "PRESERVED", Number(t.user_id), null, null, { ...t, author: userName(t.user_id) });
  // Also preserve history which the first importer could not attach to active accounts/curricula.
  for (const [table, idField, subtype] of [["stm_lms_user_courses", "user_course_id", "ENROLLMENT"], ["stm_lms_user_lessons", "user_lesson_id", "LESSON"], ["stm_lms_user_quizzes", "user_quiz_id", "QUIZ"]] as const)
    for (const r of rows(table)) add("HISTORY", `${subtype}-${r[idField]}`, courseName(r.course_id), "", "PRESERVED", Number(r.user_id), Number(r.course_id), null,
      { ...r, subtype, author: userName(r.user_id), courseTitle: courseName(r.course_id) });
  return records;
}

export function safeUploadRelative(original: string): string {
  const prefix = "/wp-content/uploads/";
  if (!original.startsWith(prefix)) throw new Error("Attachment is outside WP uploads");
  const relative = original.slice(prefix.length);
  if (!relative || relative.includes("\\") || relative.split("/").some((p) => p === ".." || p === "." || p.includes(":")) || /[\x00-\x1f]/.test(relative))
    throw new Error("Invalid attachment path");
  return relative;
}
