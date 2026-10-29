import NextAuth from "next-auth";
import { prisma } from "@bayada/db";
import { createAuthConfig } from "@bayada/shared/auth";

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
});

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
