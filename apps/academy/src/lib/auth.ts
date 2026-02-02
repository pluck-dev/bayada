import NextAuth from "next-auth";
import { prisma } from "@bayada/db";
import { createAuthConfig } from "@bayada/shared";

const authConfig = createAuthConfig({
  findUserByEmail: async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      organizationId: user.organizationId,
    };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
