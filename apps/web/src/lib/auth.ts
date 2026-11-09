import NextAuth from "next-auth";
import { prisma } from "@bayada/db";
import { createAuthConfig } from "@bayada/shared/auth";
import { clearLoginFailures, getSessionState, isLoginLocked, recordLoginFailure } from "@bayada/services/account";
import {
  findSocialUser,
  isSocialProvider,
  linkOrCreateSocialUser,
  socialAuthProviders,
  verifiedEmailFromProfile,
} from "@bayada/shared/social-auth";

// 홈페이지 회원 로그인 — 아카데미와 같은 User 테이블·비밀번호 규칙(WP 해시 포함)·로그인 실패 제한·세션 무효를 쓴다.
// 한 계정으로 홈페이지·아카데미 둘 다 로그인된다. 세션 쿠키는 따로(bayada-web.*) 둬서 같은 호스트에서도 섞이지 않는다.
const authConfig = createAuthConfig({
  findUserByEmail: async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, password: true, role: true, status: true, organizationId: true },
    });
    return user;
  },
  updatePassword: async (userId, password) => {
    await prisma.user.update({ where: { id: userId }, data: { password } });
  },
  loginGuard: { isLocked: isLoginLocked, recordFailure: recordLoginFailure, clearFailures: clearLoginFailures },
  getSessionState,
});

const secure = process.env.NODE_ENV === "production";
const cookie = (name: string, httpOnly = true) => ({
  name: `${secure ? "__Secure-" : ""}bayada-web.${name}`,
  options: { httpOnly, sameSite: "lax" as const, path: "/", secure },
});

const baseJwt = authConfig.callbacks!.jwt!;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // 운영은 WEB_AUTH_SECRET 을 AUTH_SECRET 으로 넣는다 (아카데미·어드민과 다른 값)
  providers: [...authConfig.providers, ...socialAuthProviders()],
  cookies: {
    sessionToken: cookie("session-token"),
    callbackUrl: cookie("callback-url"),
    csrfToken: { ...cookie("csrf-token"), name: `${secure ? "__Host-" : ""}bayada-web.csrf-token` },
    pkceCodeVerifier: cookie("pkce.code_verifier"),
    state: cookie("state"),
    nonce: cookie("nonce"),
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (!account || !isSocialProvider(account.provider)) return true;
      const result = await linkOrCreateSocialUser({
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        verifiedEmail: verifiedEmailFromProfile(account.provider, profile as Record<string, unknown> | undefined),
        rawEmail: user.email ?? null,
        name: user.name ?? null,
      });
      return result.ok ? true : `/auth/login?error=${result.error}`;
    },
    async jwt(params) {
      const { account } = params;
      if (params.user && account && isSocialProvider(account.provider)) {
        const dbUser = await findSocialUser(account.provider, account.providerAccountId);
        if (!dbUser) return null;
        return baseJwt({ ...params, user: dbUser });
      }
      return baseJwt(params);
    },
  },
});
