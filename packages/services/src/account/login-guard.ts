// 로그인 실패 제한 — 이메일+IP 기준 15분에 5회. 기록은 DB(LoginAttempt)에 둬서 인스턴스가 여러 개여도 같이 센다.
// 실패만 기록하고, 성공하면 그 이메일+IP 기록을 지운다. 하루 지난 기록은 실패 기록 때마다 정리한다.
import { prisma } from "@bayada/db";

export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_WINDOW_MINUTES = 15;
const WINDOW_MS = LOGIN_WINDOW_MINUTES * 60 * 1000;
const RETAIN_MS = 24 * 60 * 60 * 1000;

const norm = (email: string) => email.trim().toLowerCase();

/** 프록시 뒤라면 x-forwarded-for 첫 번째 값(클라이언트), 없으면 x-real-ip */
export function clientIp(headers: Headers | undefined | null): string {
  const fwd = headers?.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || headers?.get("x-real-ip")?.trim() || "unknown";
}

export async function isLoginLocked(email: string, ip: string): Promise<boolean> {
  const failures = await prisma.loginAttempt.count({
    where: { email: norm(email), ip, createdAt: { gt: new Date(Date.now() - WINDOW_MS) } },
  });
  return failures >= LOGIN_MAX_FAILURES;
}

export async function recordLoginFailure(email: string, ip: string): Promise<void> {
  await prisma.$transaction([
    prisma.loginAttempt.create({ data: { email: norm(email), ip } }),
    prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - RETAIN_MS) } } }),
  ]);
}

export async function clearLoginFailures(email: string, ip: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { email: norm(email), ip } });
}

/** 세션 유효성 검사용 (auth jwt 콜백). 계정이 지워졌으면 null */
export async function getSessionState(userId: string): Promise<{ passwordChangedAt: Date | null; status: string } | null> {
  return prisma.user.findUnique({ where: { id: userId }, select: { passwordChangedAt: true, status: true } });
}
