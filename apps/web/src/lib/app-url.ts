import { isValidLocale } from "@bayada/shared/i18n";

// 메일 링크(비밀번호 재설정·이메일 인증)의 절대 주소 기준 — 요청 Host 헤더가 아니라 설정값만 쓴다(Host 조작으로 링크 탈취 방지).
// 로컬은 NEXTAUTH_URL(3001), 운영은 AUTH_URL/NEXTAUTH_URL = https://${WEB_HOST}
export const APP_URL = (process.env.AUTH_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001").replace(/\/+$/, "");

export const localeOr = (value: unknown) => (typeof value === "string" && isValidLocale(value) ? value : "ko");

export const appUrl = (path: string) => `${APP_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** 아카데미(교육 플랫폼) 주소 — 마이페이지의 교육 현황 바로가기 */
export const ACADEMY_URL = (process.env.ACADEMY_URL || "http://localhost:3100").replace(/\/+$/, "");
