import { isValidLocale } from "@bayada/shared/i18n";
import { SITE_URL } from "./site";

// 메일 링크(비밀번호 재설정·이메일 인증·초대)의 절대 주소 기준.
// 요청 Host 헤더로 만들면 Host 를 조작한 요청으로 남의 재설정 링크를 공격자 도메인으로 보낼 수 있어 설정값만 쓴다.
// 로컬은 NEXTAUTH_URL(3100), 운영은 AUTH_URL/NEXTAUTH_URL 이 아카데미 주소다. (SITE_URL 은 로컬에서 web 3000 을 가리켜 우선순위를 낮춤)
export const APP_URL = (process.env.AUTH_URL || process.env.NEXTAUTH_URL || SITE_URL).replace(/\/+$/, "");

export const localeOr = (value: unknown) => (typeof value === "string" && isValidLocale(value) ? value : "ko");

export const appUrl = (path: string) => `${APP_URL}${path.startsWith("/") ? path : `/${path}`}`;
