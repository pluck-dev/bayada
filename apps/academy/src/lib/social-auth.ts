import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { prisma } from "@bayada/db";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import type { Provider } from "next-auth/providers";

// 카카오·구글 로그인 (학습자 사이트 전용, 어드민 없음). 키가 있는 것만 켠다 — 없으면 버튼도 숨긴다.
export type SocialProviderId = "kakao" | "google";

export function enabledSocialProviders(): SocialProviderId[] {
  const out: SocialProviderId[] = [];
  if (process.env.AUTH_KAKAO_ID && process.env.AUTH_KAKAO_SECRET) out.push("kakao");
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) out.push("google");
  return out;
}

export function socialAuthProviders(): Provider[] {
  return enabledSocialProviders().map((id) =>
    id === "kakao"
      ? Kakao({ clientId: process.env.AUTH_KAKAO_ID, clientSecret: process.env.AUTH_KAKAO_SECRET })
      : Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })
  );
}

export const isSocialProvider = (id: string | undefined): id is SocialProviderId => id === "kakao" || id === "google";

/** 제공자가 "확인된 이메일"이라고 보증하는지. 확인 안 된 이메일로는 기존 계정에 연결하지 않는다(계정 탈취 방지) */
export function verifiedEmailFromProfile(provider: SocialProviderId, profile: Record<string, unknown> | undefined): string | null {
  if (!profile) return null;
  if (provider === "google") {
    return profile.email_verified === true && typeof profile.email === "string" ? profile.email.toLowerCase() : null;
  }
  const account = profile.kakao_account as
    | { email?: string; is_email_valid?: boolean; is_email_verified?: boolean }
    | undefined;
  return account?.email && account.is_email_valid && account.is_email_verified ? account.email.toLowerCase() : null;
}

export type SocialLinkResult =
  | { ok: true; user: { id: string; email: string; name: string | null; role: string; organizationId: string | null } }
  | { ok: false; error: "SocialPending" | "SocialEmailInUse" };

const userSelect = { id: true, email: true, name: true, role: true, status: true, organizationId: true } as const;

/**
 * 소셜 계정 → 우리 User.
 * 1) 이미 연결된 계정 2) 확인된 같은 이메일의 기존 계정에 연결 3) 새 STUDENT(APPROVED) 생성.
 * 이메일을 못 받았거나 확인되지 않은 경우 새 계정은 자리표시 주소(`.invalid`, 메일 발송 안 됨)로 만든다.
 * 확인 안 된 이메일이 이미 가입돼 있으면 연결도 생성도 하지 않는다.
 */
export async function linkOrCreateSocialUser(input: {
  provider: SocialProviderId;
  providerAccountId: string;
  verifiedEmail: string | null;
  rawEmail: string | null;
  name: string | null;
}): Promise<SocialLinkResult> {
  const { provider, providerAccountId } = input;
  const linked = await prisma.socialAccount.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    select: { user: { select: userSelect } },
  });
  if (linked) {
    return linked.user.status === "APPROVED" ? { ok: true, user: linked.user } : { ok: false, error: "SocialPending" };
  }

  if (input.verifiedEmail) {
    const existing = await prisma.user.findUnique({ where: { email: input.verifiedEmail }, select: { ...userSelect, emailVerifiedAt: true } });
    if (existing) {
      if (existing.status !== "APPROVED") return { ok: false, error: "SocialPending" };
      await prisma.$transaction([
        prisma.socialAccount.create({ data: { userId: existing.id, provider, providerAccountId, email: input.verifiedEmail } }),
        ...(existing.emailVerifiedAt ? [] : [prisma.user.update({ where: { id: existing.id }, data: { emailVerifiedAt: new Date() } })]),
      ]);
      return { ok: true, user: existing };
    }
  } else if (input.rawEmail && (await prisma.user.findUnique({ where: { email: input.rawEmail.toLowerCase() }, select: { id: true } }))) {
    return { ok: false, error: "SocialEmailInUse" };
  }

  const email = input.verifiedEmail ?? `${provider}-${providerAccountId}@social.bayada.invalid`;
  // 비밀번호 로그인은 쓰지 않는 계정 — 아무도 모르는 임의 값의 해시 (원하면 비밀번호 재설정으로 만들 수 있다)
  const password = await hash(randomBytes(32).toString("base64url"), 10);
  const user = await prisma.user.create({
    data: {
      email,
      name: input.name,
      password,
      role: "STUDENT",
      status: "APPROVED",
      emailVerifiedAt: input.verifiedEmail ? new Date() : null,
      socialAccounts: { create: { provider, providerAccountId, email: input.verifiedEmail ?? input.rawEmail } },
    },
    select: userSelect,
  });
  return { ok: true, user };
}

export async function findSocialUser(provider: string, providerAccountId: string) {
  const row = await prisma.socialAccount.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    select: { user: { select: userSelect } },
  });
  return row?.user ?? null;
}
