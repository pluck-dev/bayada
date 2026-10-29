import NextAuth from "next-auth";
import { createAuthConfig } from "@bayada/shared/auth";
import { prisma } from "@bayada/db";

// 관리자 전용 인증 설정
const authConfig = createAuthConfig({
  findUserByEmail: async (email: string) => {
    const user = await prisma.user.findUnique({
      // 기존 사이트 이메일은 대소문자가 섞여 있어 소문자로 저장했다
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        status: true,
        organizationId: true,
      },
    });
    return user;
  },
  updatePassword: async (userId, password) => {
    await prisma.user.update({ where: { id: userId }, data: { password } });
  },
});

// ADMIN 역할만 허용하도록 콜백 확장
const adminAuthConfig = {
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }: { user: { role?: string } }) {
      // ADMIN 역할만 로그인 허용
      if (user.role !== "ADMIN") {
        return false;
      }
      return true;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(adminAuthConfig);
