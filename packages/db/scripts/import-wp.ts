/**
 * bestcareacademy.com (WordPress + MasterStudy LMS) → 새 플랫폼 DB 이전.
 *
 * 원본은 2026-10-26 백업을 복원한 로컬 MySQL(bestcareacademy-restore, 127.0.0.1:3307)이다.
 * 여러 번 실행해도 되도록 legacyWpId 기준으로 upsert 한다.
 *
 *   WP_MYSQL_URL=mysql://root:root@127.0.0.1:3307/bestcba6_WPEP7 \
 *   VIDEO_BASE_URL=https://videos.example.com/ \
 *   DATABASE_URL=postgresql://... pnpm --filter @bayada/db import:wp
 */
import { readFileSync } from "node:fs";
import mysql from "mysql2/promise";
import { PrismaClient, type JobRole, type QuestionType } from "@prisma/client";
import { unserialize } from "./php-unserialize";

const WP = process.env.WP_MYSQL_URL ?? "mysql://root:root@127.0.0.1:3307/bestcba6_WPEP7";
const P = "lLJ_";
const VIDEO_BASE_URL = (process.env.VIDEO_BASE_URL ?? "http://localhost:8089/videos/").replace(/\/?$/, "/");
const UPLOADS_BASE_URL = (process.env.UPLOADS_BASE_URL ?? "http://localhost:8088/wp-content/uploads/").replace(/\/?$/, "/");
// 2026-10-28 영상 백업: cloudflare uid → 파일명 (bestcareacademy-restore/scripts/video_map.json)
const VIDEO_MAP_PATH =
  process.env.VIDEO_MAP_PATH ?? "D:/dev/clients/bayada/bestcareacademy-restore/scripts/video_map.json";

const prisma = new PrismaClient();

type Row = Record<string, any>;

// "9분 56초" / "1시간 5분" → 초
function parseKoreanDuration(s?: string | null): number | null {
  if (!s) return null;
  let sec = 0;
  for (const [, n, u] of s.matchAll(/(\d+)\s*(시간|분|초)/g)) {
    sec += Number(n) * (u === "시간" ? 3600 : u === "분" ? 60 : 1);
  }
  return sec || null;
}

const toDate = (unix?: number | null) => (unix && unix > 0 ? new Date(unix * 1000) : undefined);

// 카테고리 이름으로 대상 직군을 추정한다. 원본에 직군 필드가 없다.
function audiencesFor(categoryName?: string): JobRole[] {
  if (!categoryName) return [];
  if (categoryName.includes("간호")) return ["RN", "NURSE_AIDE"];
  if (categoryName.includes("요양")) return ["CAREGIVER"];
  if (categoryName.includes("PSP")) return ["CAREGIVER", "NURSE_AIDE"];
  return [];
}

async function main() {
  const db = await mysql.createConnection({ uri: WP, charset: "utf8mb4" });
  const q = async (sql: string, params: any[] = []) => (await db.query(sql, params))[0] as Row[];
  const videoMap: Record<string, string> = JSON.parse(readFileSync(VIDEO_MAP_PATH, "utf8"));

  const metaOf = async (ids: number[]) => {
    const out = new Map<number, Record<string, string>>();
    if (!ids.length) return out;
    for (const r of await q(`SELECT post_id, meta_key, meta_value FROM ${P}postmeta WHERE post_id IN (?)`, [ids])) {
      if (!out.has(r.post_id)) out.set(r.post_id, {});
      out.get(r.post_id)![r.meta_key] = r.meta_value;
    }
    return out;
  };

  // ─── 제공기관 ───
  const bayada = await prisma.provider.upsert({
    where: { slug: "bayada" },
    update: {},
    create: { name: "바야다홈헬스케어", slug: "bayada" },
  });

  // ─── 회원 ───
  const users = await q(`SELECT ID, user_email, user_pass, display_name, user_registered FROM ${P}users`);
  const umeta = new Map<number, Record<string, string>>();
  for (const r of await q(
    `SELECT user_id, meta_key, meta_value FROM ${P}usermeta WHERE meta_key IN ('first_name','last_name','billing_phone','pw_user_status','${P}capabilities')`
  )) {
    if (!umeta.has(r.user_id)) umeta.set(r.user_id, {});
    umeta.get(r.user_id)![r.meta_key] = r.meta_value;
  }
  const userId = new Map<number, string>();
  for (const u of users) {
    const m = umeta.get(u.ID) ?? {};
    const caps = m[`${P}capabilities`] ?? "";
    const name = `${m.last_name ?? ""}${m.first_name ?? ""}`.trim() || u.display_name;
    const status = m.pw_user_status === "pending" ? "PENDING" : m.pw_user_status === "denied" ? "REJECTED" : "APPROVED";
    const data = {
      email: u.user_email.toLowerCase(),
      name,
      // WordPress 해시를 그대로 둔다. 로그인 시 검증 후 bcrypt 로 바꾼다 (shared/auth.ts).
      password: u.user_pass,
      role: caps.includes("administrator") ? ("ADMIN" as const) : ("STUDENT" as const),
      status: status as "PENDING" | "APPROVED" | "REJECTED",
      phone: m.billing_phone || null,
      createdAt: new Date(u.user_registered),
    };
    const saved = await prisma.user.upsert({
      where: { legacyWpId: u.ID },
      update: { ...data, password: undefined }, // 이미 로그인해 bcrypt 로 바뀐 비밀번호는 덮지 않는다
      create: { ...data, legacyWpId: u.ID },
    });
    userId.set(u.ID, saved.id);
  }
  console.log(`users: ${userId.size}`);

  // ─── 카테고리 ───
  const cats = await q(
    `SELECT t.term_id, t.name, t.slug, tr.object_id FROM ${P}terms t
     JOIN ${P}term_taxonomy tt ON tt.term_id = t.term_id AND tt.taxonomy = 'stm_lms_course_taxonomy'
     LEFT JOIN ${P}term_relationships tr ON tr.term_taxonomy_id = tt.term_taxonomy_id`
  );
  const catByCourse = new Map<number, { id: string; name: string }>();
  const catIds = new Map<number, string>();
  let catOrder = 0;
  for (const c of cats) {
    if (!catIds.has(c.term_id)) {
      const slug = decodeURIComponent(c.slug);
      const saved = await prisma.category.upsert({
        where: { slug },
        update: { name: c.name },
        create: { name: c.name, slug, order: catOrder++ },
      });
      catIds.set(c.term_id, saved.id);
    }
    if (c.object_id) catByCourse.set(c.object_id, { id: catIds.get(c.term_id)!, name: c.name });
  }

  // ─── 강의 ───
  const courses = await q(
    `SELECT ID, post_title, post_name, post_content, post_excerpt, post_status, post_date FROM ${P}posts
     WHERE post_type = 'stm-courses' AND post_status IN ('publish','private')`
  );
  const cmeta = await metaOf(courses.map((c) => c.ID));
  const thumbIds = [...cmeta.values()].map((m) => Number(m._thumbnail_id)).filter(Boolean);
  const thumbs = new Map<number, string>();
  if (thumbIds.length) {
    for (const r of await q(
      `SELECT post_id, meta_value FROM ${P}postmeta WHERE meta_key = '_wp_attached_file' AND post_id IN (?)`,
      [thumbIds]
    )) {
      thumbs.set(r.post_id, UPLOADS_BASE_URL + r.meta_value);
    }
  }
  const courseId = new Map<number, string>();
  for (const c of courses) {
    const m = cmeta.get(c.ID) ?? {};
    const cat = catByCourse.get(c.ID);
    const slug = decodeURIComponent(c.post_name) || `course-${c.ID}`;
    const price = Number(m.price || 0) || 0;
    const data = {
      title: c.post_title,
      slug,
      description: c.post_content || null,
      summary: c.post_excerpt || null,
      thumbnail: thumbs.get(Number(m._thumbnail_id)) ?? null,
      price,
      // private 강의는 사내 전용으로 본다
      status: c.post_status === "publish" ? ("PUBLISHED" as const) : ("ARCHIVED" as const),
      visibility: "INTERNAL" as const, // 기존 강의는 전부 직원 교육. 외부 공개는 관리자에서 개별 전환
      durationMin: Math.round((parseKoreanDuration(m.duration_info) ?? 0) / 60) || null,
      audiences: audiencesFor(cat?.name),
      categoryId: cat?.id ?? null,
      providerId: bayada.id,
      publishedAt: new Date(c.post_date),
    };
    const saved = await prisma.course.upsert({
      where: { legacyWpId: c.ID },
      update: data,
      create: { ...data, legacyWpId: c.ID },
    });
    courseId.set(c.ID, saved.id);
  }
  console.log(`courses: ${courseId.size}`);

  // ─── 커리큘럼 (섹션 → 레슨/퀴즈) ───
  const sections = await q(`SELECT id, title, course_id, \`order\` FROM ${P}stm_lms_curriculum_sections ORDER BY course_id, \`order\``);
  const materials = await q(
    `SELECT m.post_id, m.post_type, m.section_id, m.\`order\`, p.post_title, p.post_content
     FROM ${P}stm_lms_curriculum_materials m JOIN ${P}posts p ON p.ID = m.post_id ORDER BY m.section_id, m.\`order\``
  );
  const mmeta = await metaOf([...new Set(materials.map((m) => m.post_id))]);
  // wp 강의 ID + wp 레슨 ID → 새 Lecture ID (같은 레슨을 여러 강의가 공유한다)
  const lectureKey = (wpCourse: number, wpLesson: number) => `${wpCourse}:${wpLesson}`;
  const lectureId = new Map<string, string>();
  const quizByLecture = new Map<string, string>();
  let missingVideo = 0;

  for (const s of sections) {
    const cid = courseId.get(s.course_id);
    if (!cid) continue;
    const section = await prisma.section.upsert({
      where: { legacyWpId: s.id },
      update: { title: s.title || "커리큘럼", order: s.order, courseId: cid },
      create: { title: s.title || "커리큘럼", order: s.order, courseId: cid, legacyWpId: s.id },
    });
    for (const mat of materials.filter((x) => x.section_id === s.id)) {
      const meta = mmeta.get(mat.post_id) ?? {};
      const isQuiz = mat.post_type === "stm-quizzes";
      let type: "VIDEO" | "TEXT" | "QUIZ" = isQuiz ? "QUIZ" : meta.type === "video" ? "VIDEO" : "TEXT";
      let videoUrl: string | null = null;
      if (type === "VIDEO") {
        // 복원판에서 이미 바꾼 MP4 파일명 또는 원래 Cloudflare uid 에서 파일명을 찾는다
        const html = `${mat.post_content} ${meta.lesson_embed_ctx ?? ""} ${meta.lesson_vimeo_url ?? ""} ${meta.lesson_video_url ?? ""}`;
        const file =
          html.match(/videos\/(\d{3}_[0-9a-f]{32}\.mp4)/)?.[1] ??
          videoMap[html.match(/(?:cloudflarestream\.com|videodelivery\.net)\/([0-9a-f]{32})/)?.[1] ?? ""];
        if (file) videoUrl = VIDEO_BASE_URL + file;
        else missingVideo++; // Cloudflare 에서 삭제돼 백업이 없는 영상
      }
      const data = {
        title: mat.post_title,
        order: mat.order,
        type,
        videoUrl,
        content: type === "TEXT" ? mat.post_content : null,
        duration: parseKoreanDuration(meta.duration),
        sectionId: section.id,
        legacyWpId: mat.post_id,
      };
      const existing = await prisma.lecture.findFirst({ where: { sectionId: section.id, legacyWpId: mat.post_id } });
      const lec = existing
        ? await prisma.lecture.update({ where: { id: existing.id }, data })
        : await prisma.lecture.create({ data });
      lectureId.set(lectureKey(s.course_id, mat.post_id), lec.id);

      if (isQuiz) {
        const quiz = await prisma.quiz.upsert({
          where: { lectureId: lec.id },
          update: { passingScore: Number(meta.passing_grade || 80) },
          create: { lectureId: lec.id, passingScore: Number(meta.passing_grade || 80) },
        });
        quizByLecture.set(lectureKey(s.course_id, mat.post_id), quiz.id);
        const qids = (meta.questions ?? "").split(",").map(Number).filter(Boolean);
        if (qids.length) {
          const qposts = await q(`SELECT ID, post_title FROM ${P}posts WHERE ID IN (?)`, [qids]);
          const qmeta = await metaOf(qids);
          await prisma.question.deleteMany({ where: { quizId: quiz.id } });
          for (const [i, qid] of qids.entries()) {
            const qp = qposts.find((x) => x.ID === qid);
            const qm = qmeta.get(qid) ?? {};
            if (!qp) continue;
            const answers = (unserialize(qm.answers ?? "") as any[]) ?? [];
            const options = Object.values(answers).map((a: any) => ({ text: String(a.text ?? ""), correct: !!Number(a.isTrue) }));
            const qtype: QuestionType =
              qm.type === "fill_the_gap" ? "FILL_GAP"
              : qm.type === "keywords" ? "KEYWORDS"
              : qm.type === "multi_choice" ? "MULTI"
              : qm.type === "true_false" ? "TRUE_FALSE"
              : "SINGLE";
            await prisma.question.create({
              data: { quizId: quiz.id, order: i + 1, type: qtype, text: qp.post_title, options, legacyWpId: qid },
            });
          }
        }
      }
    }
  }
  console.log(`lectures: ${lectureId.size} (영상 백업 없음 ${missingVideo})`);

  // ─── 수강 · 진도 · 퀴즈 · 수료증 ───
  const enrolls = await q(`SELECT user_id, course_id, progress_percent, start_time, end_time FROM ${P}stm_lms_user_courses`);
  let enrolled = 0, certs = 0;
  const year = (d: Date) => d.getFullYear();
  for (const e of enrolls) {
    const uid = userId.get(e.user_id), cid = courseId.get(e.course_id);
    if (!uid || !cid) continue;
    const done = e.progress_percent >= 100;
    const createdAt = toDate(e.start_time) ?? new Date();
    const completedAt = done ? toDate(e.end_time) ?? createdAt : null;
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: uid, courseId: cid } },
      update: { progressPercent: e.progress_percent, completedAt },
      create: { userId: uid, courseId: cid, progressPercent: e.progress_percent, completedAt, createdAt },
    });
    enrolled++;
    if (done) {
      const exists = await prisma.certificate.findUnique({ where: { userId_courseId: { userId: uid, courseId: cid } } });
      if (!exists) {
        const issuedAt = completedAt ?? createdAt;
        const n = (await prisma.certificate.count()) + 1;
        await prisma.certificate.create({
          data: { userId: uid, courseId: cid, issuedAt, number: `BA-${year(issuedAt)}-${String(n).padStart(6, "0")}` },
        });
        certs++;
      }
    }
  }
  const lessons = await q(`SELECT user_id, course_id, lesson_id, end_time FROM ${P}stm_lms_user_lessons`);
  let progressed = 0;
  for (const l of lessons) {
    const uid = userId.get(l.user_id), lid = lectureId.get(lectureKey(l.course_id, l.lesson_id));
    if (!uid || !lid) continue;
    const completedAt = toDate(l.end_time) ?? null;
    await prisma.progress.upsert({
      where: { userId_lectureId: { userId: uid, lectureId: lid } },
      update: { completed: true, completedAt },
      create: { userId: uid, lectureId: lid, completed: true, completedAt },
    });
    progressed++;
  }
  const quizzes = await q(`SELECT user_id, course_id, quiz_id, progress, status, created_at FROM ${P}stm_lms_user_quizzes`);
  await prisma.quizAttempt.deleteMany({ where: { user: { legacyWpId: { not: null } } } });
  let attempts = 0;
  for (const a of quizzes) {
    const uid = userId.get(a.user_id), qid = quizByLecture.get(lectureKey(a.course_id, a.quiz_id));
    if (!uid || !qid) continue;
    await prisma.quizAttempt.create({
      data: { userId: uid, quizId: qid, score: a.progress, passed: a.status === "passed", createdAt: a.created_at ?? undefined },
    });
    attempts++;
  }
  console.log(`enrollments: ${enrolled}, certificates: +${certs}, progress: ${progressed}, quiz attempts: ${attempts}`);

  await db.end();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
