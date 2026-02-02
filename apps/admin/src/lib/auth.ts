import NextAuth from "next-auth";
import { createAuthConfig } from "@bayada/shared";
import { prisma } from "@bayada/db";

// 관리자 전용 인증 설정
const authConfig = createAuthConfig({
  findUserByEmail: async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        organizationId: true,
      },
    });
    return user;
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
