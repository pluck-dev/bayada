// 리뷰 모드 접근 — 공개 사이트 전체가 아니라 리뷰 도구·피드백 API 만 비밀번호로 연다.
// 원본 site_access 가드(HMAC 서명·7일)와 같은 방식이고, 사이트 키를 서명에 넣어 웹사이트 쿠키를 아카데미에서 못 쓰게 한다.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { reviewCookieName, reviewHintCookieName, type ReviewSiteKey } from "./config";

export { reviewCookieName, reviewHintCookieName };

export const REVIEW_ACCESS_TTL_SECONDS = 60 * 60 * 24 * 7;

/** 두 환경변수가 모두 있어야 리뷰 모드가 켜진다 (없으면 도구·API 모두 꺼짐) */
export function reviewAccessEnabled() {
  return Boolean(process.env.REVIEW_ACCESS_PASSWORD && process.env.REVIEW_ACCESS_SECRET);
}

function signature(site: ReviewSiteKey, expiresAt: string) {
  const secret = process.env.REVIEW_ACCESS_SECRET;
  if (!secret) return "";
  return createHmac("sha256", secret).update(`${site}.${expiresAt}`).digest("base64url");
}

const digest = (value: string) => createHash("sha256").update(value).digest();

export function isReviewTokenValid(site: ReviewSiteKey, token: string | undefined) {
  if (!token || !reviewAccessEnabled()) return false;
  const [expiresAt, supplied, extra] = token.split(".");
  if (!expiresAt || !supplied || extra !== undefined || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;
  return timingSafeEqual(digest(supplied), digest(signature(site, expiresAt)));
}

export function verifyReviewPassword(password: string) {
  const expected = process.env.REVIEW_ACCESS_PASSWORD;
  if (!expected || password.length > 256) return false;
  return timingSafeEqual(digest(password), digest(expected));
}

export function createReviewToken(site: ReviewSiteKey) {
  const expiresAt = String(Math.floor(Date.now() / 1000) + REVIEW_ACCESS_TTL_SECONDS);
  return `${expiresAt}.${signature(site, expiresAt)}`;
}

/** 잠금 해제 후 돌아갈 주소 — 같은 사이트 경로만 (해시 허용, //·역슬래시·리뷰 화면 자신은 거부) */
export function safeReviewDestination(value: unknown) {
  if (typeof value !== "string" || value.length > 2000 || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.includes("\\") || /[\r\n]/.test(value) || value.startsWith("/review-access")) return "/";
  return value;
}

/** 시간당 등록 제한용 IP 익명화 (원문 IP 는 저장하지 않는다) */
export function reviewIpHash(ip: string) {
  return createHmac("sha256", process.env.REVIEW_ACCESS_SECRET ?? "review").update(ip).digest("hex");
}

export function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
