"use server";

import { revalidatePath } from "next/cache";
import { prisma, type CredentialAppStatus, type Prisma } from "@bayada/db";
import { ActionError, audit, runAction } from "../session";
import { judge } from "../credentials";

// ─── 인증 과정 (정책 값은 전부 데이터 — 고객사 정책 미확정) ───

export interface CredentialProgramInput {
  title: string;
  slug: string;
  summary: string;
  description: string;
  requiredCourseIds: string[];
  examPassingScore: number;
  practicalRequired: boolean;
  practicalPassingScore: number;
  /** "" = 영구 */
  validityMonths: string;
  renewalNoticeDays: number;
  criteria: string;
  active: boolean;
}

function score(v: unknown, label: string): number {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 100) throw new ActionError(`${label}는 0~100 사이 정수여야 합니다.`);
  return n;
}

function cleanProgram(input: CredentialProgramInput) {
  const title = input.title.trim();
  if (!title) throw new ActionError("과정명을 입력하세요.");
  const slug = input.slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ActionError("주소(slug)는 영문 소문자·숫자·하이픈만 쓸 수 있습니다.");
  const requiredCourseIds = [...new Set(input.requiredCourseIds.filter(Boolean))];
  let validityMonths: number | null = null;
  if (input.validityMonths.trim() !== "") {
    validityMonths = Number(input.validityMonths);
    if (!Number.isInteger(validityMonths) || validityMonths < 1 || validityMonths > 600)
      throw new ActionError("유효기간은 1~600개월 사이 정수이거나 비워 두세요(영구).");
  }
  const renewalNoticeDays = Number(input.renewalNoticeDays);
  if (!Number.isInteger(renewalNoticeDays) || renewalNoticeDays < 0 || renewalNoticeDays > 365)
    throw new ActionError("갱신 알림은 0~365일 사이여야 합니다.");
  return {
    title,
    slug,
    summary: input.summary.trim() || null,
    description: input.description.trim() || null,
    requiredCourseIds,
    examPassingScore: score(input.examPassingScore, "시험 합격 점수"),
    practicalRequired: !!input.practicalRequired,
    practicalPassingScore: score(input.practicalPassingScore, "실기 합격 점수"),
    validityMonths,
    renewalNoticeDays,
    criteria: input.criteria.trim() || null,
    active: !!input.active,
  };
}

async function assertCourses(ids: string[], active: boolean) {
  if (ids.length === 0) {
    if (active) throw new ActionError("공개하려면 선수 프로그램을 1개 이상 지정하세요.");
    return;
  }
  const n = await prisma.course.count({ where: { id: { in: ids } } });
  if (n !== ids.length) throw new ActionError("선택한 선수 프로그램 중 찾을 수 없는 것이 있습니다.");
}

function doneProgram(id?: string) {
  revalidatePath("/[locale]/(dashboard)/credentials", "layout");
  if (id) revalidatePath(`/[locale]/(dashboard)/credentials/programs/${id}`, "page");
}

export async function createCredentialProgram(input: CredentialProgramInput) {
  return runAction<{ id: string }>("credential.program", async (user) => {
    const data = cleanProgram(input);
    await assertCourses(data.requiredCourseIds, data.active);
    const p = await prisma.credentialProgram.create({ data });
    await audit(user.id, "credential_program.create", `CredentialProgram:${p.id}`, { title: p.title, active: p.active });
    doneProgram();
    return { message: "인증 과정을 만들었습니다.", data: { id: p.id } };
  });
}

export async function updateCredentialProgram(id: string, input: CredentialProgramInput) {
  return runAction("credential.program", async (user) => {
    const data = cleanProgram(input);
    await assertCourses(data.requiredCourseIds, data.active);
    const before = await prisma.credentialProgram.findUnique({ where: { id } });
    if (!before) throw new ActionError("인증 과정을 찾을 수 없습니다.");
    await prisma.credentialProgram.update({ where: { id }, data });
    // 바뀐 정책 값만 이전 값과 함께 남긴다 (정책 미확정이라 나중에 "언제 무엇이 바뀌었나"가 중요)
    const changed: Record<string, { from: unknown; to: unknown }> = {};
    for (const k of Object.keys(data) as (keyof typeof data)[]) {
      if (k === "description" || k === "criteria") continue;
      if (JSON.stringify(before[k]) !== JSON.stringify(data[k])) changed[k] = { from: before[k], to: data[k] };
    }
    await audit(user.id, "credential_program.update", `CredentialProgram:${id}`, { title: data.title, changed });
    doneProgram(id);
    return { message: "저장했습니다." };
  });
}

export async function deleteCredentialProgram(id: string) {
  return runAction("credential.program", async (user) => {
    const p = await prisma.credentialProgram.findUnique({
      where: { id },
      select: { title: true, _count: { select: { applications: true, credentials: true } } },
    });
    if (!p) throw new ActionError("인증 과정을 찾을 수 없습니다.");
    // 삭제는 연쇄 삭제(신청·발급 인증까지)라 기록이 하나라도 있으면 막는다 — 대신 비공개로 돌린다
    if (p._count.applications || p._count.credentials)
      throw new ActionError("신청·발급 기록이 있는 과정은 삭제할 수 없습니다. 비공개로 전환하세요.");
    await prisma.credentialProgram.delete({ where: { id } });
    await audit(user.id, "credential_program.delete", `CredentialProgram:${id}`, { title: p.title });
    doneProgram();
    return { message: "인증 과정을 삭제했습니다." };
  });
}

// ─── 심사 ───

const target = (id: string) => `CredentialApplication:${id}`;

function doneApp(id: string) {
  revalidatePath("/[locale]/(dashboard)", "layout");
  revalidatePath(`/[locale]/(dashboard)/credentials/applications/${id}`, "page");
}

/** 기대한 상태일 때만 바꾼다 — 두 사람이 동시에 눌러도 한 번만 반영 */
async function transition(
  id: string,
  from: CredentialAppStatus[],
  data: Prisma.CredentialApplicationUncheckedUpdateManyInput,
  tx: Prisma.TransactionClient = prisma,
) {
  const r = await tx.credentialApplication.updateMany({ where: { id, status: { in: from } }, data });
  if (r.count !== 1) throw new ActionError("다른 사용자가 먼저 처리했거나 지금 상태에서는 할 수 없는 작업입니다. 새로고침 후 다시 확인하세요.");
}

async function loadApp(id: string) {
  const app = await prisma.credentialApplication.findUnique({
    where: { id },
    include: {
      program: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!app) throw new ActionError("신청을 찾을 수 없습니다.");
  return app;
}

export interface ScoreInput {
  examScore: string;
  practicalScore: string;
  evaluatorNote: string;
}

function cleanScores(input: ScoreInput, practicalRequired: boolean) {
  const opt = (v: string, label: string) => (v.trim() === "" ? null : score(v, label));
  return {
    examScore: opt(input.examScore, "시험 점수"),
    // 실기를 보지 않는 과정이면 실기 점수는 받지 않는다
    practicalScore: practicalRequired ? opt(input.practicalScore, "실기 점수") : null,
    evaluatorNote: input.evaluatorNote.trim() || null,
  };
}

export async function startEvaluation(id: string) {
  return runAction("credential.evaluate", async (user) => {
    await loadApp(id);
    await transition(id, ["SUBMITTED"], { status: "EVALUATING", evaluatorId: user.id });
    await audit(user.id, "credential.start_evaluation", target(id));
    doneApp(id);
    return { message: "평가를 시작했습니다." };
  });
}

export async function saveScores(id: string, input: ScoreInput) {
  return runAction("credential.evaluate", async (user) => {
    const app = await loadApp(id);
    const data = cleanScores(input, app.program.practicalRequired);
    await transition(id, ["EVALUATING"], { ...data, evaluatorId: user.id });
    await audit(user.id, "credential.score", target(id), { examScore: data.examScore, practicalScore: data.practicalScore });
    doneApp(id);
    return { message: "점수를 임시 저장했습니다." };
  });
}

export async function completeEvaluation(id: string, input: ScoreInput) {
  return runAction("credential.evaluate", async (user) => {
    const app = await loadApp(id);
    const data = cleanScores(input, app.program.practicalRequired);
    const passed = judge(app.program, data.examScore, data.practicalScore);
    if (passed === null)
      throw new ActionError(app.program.practicalRequired ? "시험·실기 점수를 모두 입력해야 평가를 마칠 수 있습니다." : "시험 점수를 입력해야 평가를 마칠 수 있습니다.");
    await transition(id, ["EVALUATING"], { ...data, status: "EVALUATED", evaluatorId: user.id });
    // 판정은 저장 필드가 없어 매번 계산한다 → 평가 완료 시점의 기준과 결과를 감사 로그에 남긴다
    await audit(user.id, "credential.evaluate", target(id), {
      examScore: data.examScore,
      practicalScore: data.practicalScore,
      passed,
      thresholds: {
        exam: app.program.examPassingScore,
        practical: app.program.practicalRequired ? app.program.practicalPassingScore : null,
      },
    });
    doneApp(id);
    return { message: passed ? "평가 완료 — 합격으로 운영자 승인 대기에 올렸습니다." : "평가 완료 — 불합격으로 판정했습니다." };
  });
}

export async function reopenEvaluation(id: string) {
  return runAction("credential.evaluate", async (user) => {
    await loadApp(id);
    await transition(id, ["EVALUATED"], { status: "EVALUATING", evaluatorId: user.id });
    await audit(user.id, "credential.reopen", target(id));
    doneApp(id);
    return { message: "다시 평가 중으로 돌렸습니다." };
  });
}

/** 한국 시간 기준 연도 (연말 자정 전후 9시간 차이로 번호 연도가 어긋나지 않게) */
function kstYear(d: Date): number {
  return Number(d.toLocaleString("en-US", { timeZone: "Asia/Seoul", year: "numeric" }));
}

function addMonths(d: Date, months: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r;
}

export async function approveApplication(id: string, note: string) {
  return runAction<{ number: string }>("credential.approve", async (user) => {
    const app = await loadApp(id);
    if (app.status !== "EVALUATED") throw new ActionError("평가가 끝난 신청만 승인할 수 있습니다.");
    if (judge(app.program, app.examScore, app.practicalScore) !== true)
      throw new ActionError("현재 합격 기준에 못 미쳐 발급할 수 없습니다. 반려하거나 재평가를 요청하세요.");
    const done = await prisma.enrollment.count({
      where: { userId: app.userId, courseId: { in: app.program.requiredCourseIds }, completedAt: { not: null } },
    });
    if (done < app.program.requiredCourseIds.length) throw new ActionError("선수 프로그램을 모두 수료하지 않은 신청입니다.");

    const issuedAt = new Date();
    const expiresAt = app.program.validityMonths ? addMonths(issuedAt, app.program.validityMonths) : null;
    const prefix = `BC-${kstYear(issuedAt)}-`;
    const credential = await prisma.$transaction(async (tx) => {
      await transition(id, ["EVALUATED"], { status: "APPROVED", decidedAt: issuedAt, decisionNote: note.trim() || null }, tx);
      // 연도별 일련번호 — 동시 발급이 같은 번호를 잡지 않게 트랜잭션 락으로 직렬화
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('credential-number'))`;
      const last = await tx.credential.findFirst({
        where: { number: { startsWith: prefix } },
        orderBy: { number: "desc" },
        select: { number: true },
      });
      const seq = (last ? Number(last.number.slice(prefix.length)) : 0) + 1;
      return tx.credential.create({
        data: {
          number: `${prefix}${String(seq).padStart(6, "0")}`,
          programId: app.programId,
          userId: app.userId,
          issuedAt,
          expiresAt,
        },
      });
    });
    await audit(user.id, "credential.approve", target(id), { number: credential.number, expiresAt, note: note.trim() || undefined });
    await audit(user.id, "credential.issue", `Credential:${credential.id}`, {
      number: credential.number,
      userId: app.userId,
      program: app.program.title,
    });
    doneApp(id);
    return { message: `승인했습니다. 인증번호 ${credential.number}`, data: { number: credential.number } };
  });
}

export async function rejectApplication(id: string, note: string) {
  return runAction("credential.approve", async (user) => {
    const reason = note.trim();
    if (!reason) throw new ActionError("반려 사유를 입력하세요. 학습자에게 그대로 보입니다.");
    await loadApp(id);
    await transition(id, ["SUBMITTED", "EVALUATING", "EVALUATED"], { status: "REJECTED", decidedAt: new Date(), decisionNote: reason });
    await audit(user.id, "credential.reject", target(id), { note: reason });
    doneApp(id);
    return { message: "반려했습니다." };
  });
}

// ─── 발급된 인증 ───

export async function revokeCredential(id: string, reason: string) {
  return runAction("credential.approve", async (user) => {
    const why = reason.trim();
    if (!why) throw new ActionError("취소 사유를 입력하세요.");
    const r = await prisma.credential.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: new Date() } });
    if (r.count !== 1) throw new ActionError("이미 취소됐거나 찾을 수 없는 인증입니다.");
    const c = await prisma.credential.findUnique({ where: { id }, select: { number: true } });
    await audit(user.id, "credential.revoke", `Credential:${id}`, { number: c?.number, reason: why });
    revalidatePath("/[locale]/(dashboard)/credentials", "layout");
    return { message: `${c?.number ?? "인증"}을 취소했습니다. 검증 페이지에 '취소됨'으로 표시됩니다.` };
  });
}
