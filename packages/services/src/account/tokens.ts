// 비밀번호 재설정·이메일 인증 1회용 토큰.
// 원문 토큰은 메일 링크에만 있고 DB 에는 sha256 만 저장한다(DB 가 새어도 링크를 못 만든다).
import { createHash, randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { prisma, type AuthTokenType } from "@bayada/db";
import { passwordError } from "@bayada/shared/password-policy";
import { sendMail } from "./mailer";
import { emailVerifyMail, passwordResetMail } from "./templates";

export const RESET_TOKEN_MINUTES = 30;
export const VERIFY_TOKEN_HOURS = 24;
/** 같은 계정의 재설정 메일은 15분에 3통까지 (메일 폭탄 방지). 초과해도 응답은 같다 */
const RESET_REQUESTS_PER_WINDOW = 3;
const RESET_REQUEST_WINDOW_MS = 15 * 60 * 1000;

const sha256 = (raw: string) => createHash("sha256").update(raw).digest("hex");

async function issueToken(userId: string, type: AuthTokenType, ttlMs: number): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  const now = Date.now();
  await prisma.$transaction([
    // 오래된 토큰 정리 (만료 후 하루 지난 것)
    prisma.authToken.deleteMany({ where: { expiresAt: { lt: new Date(now - 24 * 60 * 60 * 1000) } } }),
    prisma.authToken.create({ data: { userId, type, tokenHash: sha256(raw), expiresAt: new Date(now + ttlMs) } }),
  ]);
  return raw;
}

/** 아직 쓸 수 있는 토큰인지(소비하지 않음) — 재설정 화면에서 만료 링크를 미리 안내하는 용도 */
export async function isTokenUsable(raw: string, type: AuthTokenType): Promise<boolean> {
  if (!raw) return false;
  const t = await prisma.authToken.findUnique({ where: { tokenHash: sha256(raw) }, select: { type: true, usedAt: true, expiresAt: true } });
  return !!t && t.type === type && !t.usedAt && t.expiresAt > new Date();
}

/**
 * 재설정 메일 요청. 이메일 존재 여부와 상관없이 호출 측은 같은 응답을 보낸다(계정 존재 노출 방지).
 * 승인되지 않은 계정·자리표시 이메일(소셜)·요청 과다는 조용히 건너뛴다.
 */
export async function requestPasswordReset(input: {
  email: string;
  /** 토큰을 받아 재설정 화면 절대 주소를 만든다 (요청 Host 헤더가 아니라 설정된 앱 주소로) */
  buildUrl: (token: string) => string;
  admin?: boolean;
}): Promise<void> {
  const email = input.email.trim().toLowerCase();
  if (!email) return;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, status: true } });
  if (!user || user.status !== "APPROVED") return;
  const recent = await prisma.authToken.count({
    where: { userId: user.id, type: "PASSWORD_RESET", createdAt: { gt: new Date(Date.now() - RESET_REQUEST_WINDOW_MS) } },
  });
  if (recent >= RESET_REQUESTS_PER_WINDOW) return;
  const token = await issueToken(user.id, "PASSWORD_RESET", RESET_TOKEN_MINUTES * 60 * 1000);
  await sendMail(passwordResetMail({ to: user.email, name: user.name, url: input.buildUrl(token), minutes: RESET_TOKEN_MINUTES, admin: input.admin }));
}

export type ResetResult = { ok: true; email: string } | { ok: false; error: string };

/**
 * 토큰 소비 + 비밀번호 변경. 토큰은 updateMany(usedAt null 조건)로 한 번만 소비된다(동시 제출 이중 사용 방지).
 * passwordChangedAt 을 갱신해 이전에 발급된 모든 세션을 무효화한다(auth jwt 콜백이 확인).
 */
export async function resetPassword(raw: string, newPassword: string): Promise<ResetResult> {
  const pwError = passwordError(newPassword);
  if (pwError) return { ok: false, error: pwError };
  if (!raw) return { ok: false, error: "재설정 링크가 올바르지 않아요." };
  const tokenHash = sha256(raw);
  const passwordHash = await hash(newPassword, 12);
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const token = await tx.authToken.findUnique({ where: { tokenHash }, select: { id: true, userId: true, type: true } });
    if (!token || token.type !== "PASSWORD_RESET") return { ok: false as const, error: "재설정 링크가 올바르지 않아요." };
    const consumed = await tx.authToken.updateMany({
      where: { id: token.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (consumed.count !== 1) return { ok: false as const, error: "만료됐거나 이미 사용한 링크예요. 재설정 메일을 다시 요청해 주세요." };
    const before = await tx.user.findUniqueOrThrow({ where: { id: token.userId }, select: { emailVerifiedAt: true } });
    const user = await tx.user.update({
      where: { id: token.userId },
      // 메일 링크로 비밀번호를 바꿨다 = 이메일 소유 확인
      data: { password: passwordHash, passwordChangedAt: now, emailVerifiedAt: before.emailVerifiedAt ?? now },
      select: { email: true },
    });
    // 같은 계정의 다른 재설정 링크도 함께 막는다
    await tx.authToken.updateMany({ where: { userId: token.userId, type: "PASSWORD_RESET", usedAt: null }, data: { usedAt: now } });
    // 잠금 상태였다면 풀어 준다
    await tx.loginAttempt.deleteMany({ where: { email: user.email } });
    return { ok: true as const, email: user.email };
  });
}

/** 이메일 인증 메일 (가입 직후·재발송). 이미 인증했거나 자리표시 이메일이면 false */
export async function sendVerificationEmail(userId: string, buildUrl: (token: string) => string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true, emailVerifiedAt: true } });
  if (!user || user.emailVerifiedAt) return false;
  const token = await issueToken(userId, "EMAIL_VERIFY", VERIFY_TOKEN_HOURS * 60 * 60 * 1000);
  await sendMail(emailVerifyMail({ to: user.email, name: user.name, url: buildUrl(token), hours: VERIFY_TOKEN_HOURS }));
  return true;
}

/** 재발송 간격 제한용: 마지막 인증 메일 발송 시각 */
export async function lastVerificationSentAt(userId: string): Promise<Date | null> {
  const t = await prisma.authToken.findFirst({
    where: { userId, type: "EMAIL_VERIFY" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return t?.createdAt ?? null;
}

export type VerifyResult = "verified" | "already" | "invalid";

/** 메일 링크 열기 = 인증. 링크 미리보기(메일 보안 스캐너)가 먼저 열어도 결과는 같아 GET 에서 처리해도 된다 */
export async function verifyEmail(raw: string): Promise<VerifyResult> {
  if (!raw) return "invalid";
  const now = new Date();
  const token = await prisma.authToken.findUnique({
    where: { tokenHash: sha256(raw) },
    select: { id: true, userId: true, type: true, usedAt: true, expiresAt: true, user: { select: { emailVerifiedAt: true } } },
  });
  if (!token || token.type !== "EMAIL_VERIFY") return "invalid";
  if (token.user.emailVerifiedAt) return "already";
  if (token.usedAt || token.expiresAt <= now) return "invalid";
  await prisma.$transaction([
    prisma.authToken.updateMany({ where: { userId: token.userId, type: "EMAIL_VERIFY", usedAt: null }, data: { usedAt: now } }),
    prisma.user.update({ where: { id: token.userId }, data: { emailVerifiedAt: now } }),
  ]);
  return "verified";
}
