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
} from "./social-auth";

const authConfig = createAuthConfig({
  findUserByEmail: async (email: string) => {
    const user = await prisma.user.findUnique({
      // 기존 사이트 이메일은 대소문자가 섞여 있어 소문자로 저장했다
      where: { email: email.toLowerCase() },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      status: user.status,
      organizationId: user.organizationId,
    };
  },
  updatePassword: async (userId, password) => {
    await prisma.user.update({ where: { id: userId }, data: { password } });
  },
  loginGuard: { isLocked: isLoginLocked, recordFailure: recordLoginFailure, clearFailures: clearLoginFailures },
  getSessionState,
});

const baseJwt = authConfig.callbacks!.jwt!;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [...authConfig.providers, ...socialAuthProviders()],
  callbacks: {
    ...authConfig.callbacks,
    // 소셜 로그인: 연결·생성은 여기서. 실패하면 로그인 화면으로 사유 코드를 들고 돌아간다(미들웨어가 로케일을 붙인다)
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
    // 소셜 로그인 직후 user.id 는 제공자 쪽 id 라서 우리 User 로 바꿔 넣는다
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
