import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { hash } from "bcryptjs";
import { verifyPassword } from "./password";
import type { SessionUser } from "./types";

// NextAuth 공유 설정 생성 함수
// 각 앱에서 prisma 인스턴스를 주입하여 사용
export function createAuthConfig(deps: {
  findUserByEmail: (
    email: string
  ) => Promise<{
    id: string;
    email: string;
    name: string | null;
    password: string;
    role: string;
    status?: string;
    organizationId: string | null;
  } | null>;
  // 옮겨 온 WordPress 해시로 로그인에 성공하면 bcrypt 로 바꿔 저장한다
  updatePassword?: (userId: string, bcryptHash: string) => Promise<void>;
}): NextAuthConfig {
  return {
    providers: [
      Credentials({
        name: "credentials",
        credentials: {
          email: { label: "이메일", type: "email" },
          password: { label: "비밀번호", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const email = credentials.email as string;
          const password = credentials.password as string;

          const user = await deps.findUserByEmail(email);
          if (!user) return null;

          const { valid, needsRehash } = await verifyPassword(password, user.password);
          if (!valid) return null;
          // 가입 승인 대기·거절 계정은 로그인 불가 (기존 New User Approve 정책)
          if (user.status && user.status !== "APPROVED") return null;
          if (needsRehash && deps.updatePassword) {
            await deps.updatePassword(user.id, await hash(password, 10));
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.role = (user as SessionUser).role;
          token.organizationId = (user as SessionUser).organizationId;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          (session.user as SessionUser).role = token.role as SessionUser["role"];
          (session.user as SessionUser).organizationId =
            token.organizationId as string | null;
        }
        return session;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
    session: {
      strategy: "jwt",
    },
  };
}

// NextAuth 타입 확장
declare module "next-auth" {
  interface User {
    role?: string;
    organizationId?: string | null;
  }
}

declare module "next-auth" {
  interface Session {
    user: SessionUser & {
      image?: string | null;
    };
  }
}
