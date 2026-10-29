import NextAuth from "next-auth";
import { createAuthConfig } from "@bayada/shared/auth";
import { prisma } from "@bayada/db";
import { DEFAULT_ROLE_PERMISSIONS, effectivePermissions, isAdminRole } from "./rbac";

// 어드민 콘솔 인증 — Super Admin·콘텐츠 운영자·임상 리뷰어·파트너 관리자(제공기관 지정된 경우)·사용자 정의 역할만 로그인한다.
// 페이지/액션별 권한은 lib/session.ts 의 requirePage·runAction 이 매 요청 DB 기준으로 다시 검사한다.
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

// 아카데미와 같은 호스트(로컬 localhost, 운영 시 같은 상위 도메인)에서도 세션이 섞이지 않게 쿠키 이름을 따로 쓴다.
// 기본 이름(authjs.*)을 같이 쓰면 한쪽 로그인이 다른 쪽 세션 쿠키를 덮어쓴다.
const secure = process.env.NODE_ENV === "production";
const cookie = (name: string, httpOnly = true) => ({
  name: `${secure ? "__Secure-" : ""}bayada-admin.${name}`,
  options: { httpOnly, sameSite: "lax" as const, path: "/", secure },
});

const adminAuthConfig = {
  ...authConfig,
  cookies: {
    sessionToken: cookie("session-token"),
    callbackUrl: cookie("callback-url"),
    csrfToken: { ...cookie("csrf-token"), name: `${secure ? "__Host-" : ""}bayada-admin.csrf-token` },
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }: { user: { id?: string; role?: string } }) {
      if (!user.id) return false;
      const u = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, providerId: true, customRoleKey: true },
      });
      if (!u) return false;
      // 사용자 정의 역할(customRoleKey)이 있으면 그 역할로, 없으면 시스템 운영 역할만 들어온다
      if (!u.customRoleKey && !isAdminRole(u.role)) return false;
      // 파트너 관리자는 담당 제공기관이 있어야 콘솔에 들어올 수 있다
      if (!u.customRoleKey && u.role === "PARTNER_ADMIN" && !u.providerId) return false;
      // 권한이 하나도 없는 역할(또는 삭제된 역할)은 들어와도 갈 곳이 없다
      const key = u.customRoleKey ?? u.role;
      if (key === "ADMIN") return true;
      const def = await prisma.adminRoleDef.findUnique({ where: { key }, select: { permissions: true } });
      return effectivePermissions(key, def ? def.permissions : isAdminRole(key) ? DEFAULT_ROLE_PERMISSIONS[key] : []).length > 0;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(adminAuthConfig);
