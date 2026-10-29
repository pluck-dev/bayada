import type { NextAuthConfig } from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { hash } from "bcryptjs";
import { verifyPassword } from "./password";
import type { SessionUser } from "./types";

/** 로그인 실패 제한에 걸림 — 클라이언트 signIn 결과의 code 가 "rate_limited" */
export class LoginRateLimited extends CredentialsSignin {
  code = "rate_limited";
}

// 프록시 뒤라면 x-forwarded-for 첫 번째 값(클라이언트), 없으면 x-real-ip
function requestIp(request: Request | undefined): string {
  const h = request?.headers;
  return h?.get("x-forwarded-for")?.split(",")[0]?.trim() || h?.get("x-real-ip")?.trim() || "unknown";
}

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
  // 로그인 실패 제한 (이메일+IP). 잠겨 있으면 비밀번호를 확인하지 않고 LoginRateLimited
  loginGuard?: {
    isLocked: (email: string, ip: string) => Promise<boolean>;
    recordFailure: (email: string, ip: string) => Promise<void>;
    clearFailures: (email: string, ip: string) => Promise<void>;
  };
  // 매 요청 세션 확인: 계정이 없거나 로그인 이후 비밀번호가 바뀌었으면(재설정) 세션 무효
  getSessionState?: (userId: string) => Promise<{ passwordChangedAt: Date | null } | null>;
}): NextAuthConfig {
  return {
    providers: [
      Credentials({
        name: "credentials",
        credentials: {
          email: { label: "이메일", type: "email" },
          password: { label: "비밀번호", type: "password" },
        },
        async authorize(credentials, request) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const email = (credentials.email as string).trim().toLowerCase();
          const password = credentials.password as string;
          const ip = requestIp(request);
          const guard = deps.loginGuard;
          if (guard && (await guard.isLocked(email, ip))) throw new LoginRateLimited();

          const user = await deps.findUserByEmail(email);
          const { valid, needsRehash } = user
            ? await verifyPassword(password, user.password)
            : { valid: false, needsRehash: false };
          if (!user || !valid) {
            await guard?.recordFailure(email, ip);
            return null;
          }
          await guard?.clearFailures(email, ip);
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
          // 로그인 시각 — 이후 비밀번호가 바뀌면(passwordChangedAt > authTime) 이 세션은 무효
          token.authTime = Date.now();
          return token;
        }
        if (deps.getSessionState && typeof token.id === "string") {
          const state = await deps.getSessionState(token.id);
          if (!state) return null;
          const changedAt = state.passwordChangedAt?.getTime() ?? 0;
          // authTime 이 없는 토큰(이 기능 이전 발급)은 비밀번호를 바꾼 적이 있으면 무효
          if (changedAt > (typeof token.authTime === "number" ? token.authTime : 0)) return null;
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
