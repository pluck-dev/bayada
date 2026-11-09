import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * 레슨 영상 서명 주소.
 *
 * 미디어 서버(Caddy)는 영상 파일을 주기 전에 `/api/media/verify` 로 서명을 확인받는다(forward_auth).
 * 서명은 강의실 페이지가 수강 자격을 확인한 뒤에만 붙이므로, 주소를 밖으로 퍼뜨려도 유효기간이 지나면 막힌다.
 * 확인은 HMAC 계산만 해서(DB 조회 없음) 영상 범위 요청이 많아도 가볍다.
 *
 * MEDIA_SIGNING_SECRET 이 없으면 서명하지 않는다(로컬 개발의 nginx 미디어 서버는 확인 단계가 없다).
 */

/** 영상 한 편을 다 보고도 남을 만큼. 만료되면 플레이어의 '다시 시도'가 새 주소를 받아 온다 */
const TTL_SEC = 6 * 60 * 60;
const SIGNED_PREFIX = "/videos/";

function secret(): string | null {
  return process.env.MEDIA_SIGNING_SECRET || null;
}

function sign(path: string, exp: number, key: string): string {
  return createHmac("sha256", key).update(`${path}\n${exp}`).digest("base64url");
}

/** 강의실에서 내려 줄 영상 주소. 서명 대상이 아니면(외부 주소·비밀값 없음) 그대로 돌려준다 */
export function signMediaUrl(url: string | null, now = Date.now()): string | null {
  const key = secret();
  if (!url || !key) return url;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (!parsed.pathname.startsWith(SIGNED_PREFIX)) return url;
  const exp = Math.floor(now / 1000) + TTL_SEC;
  parsed.searchParams.set("exp", String(exp));
  parsed.searchParams.set("sig", sign(parsed.pathname, exp, key));
  return parsed.toString();
}

export type MediaVerifyResult = "ok" | "disabled" | "missing" | "expired" | "invalid";

/** Caddy 가 넘겨 준 원래 요청 주소(경로+쿼리)의 서명 확인 */
export function verifyMediaUri(requestUri: string | null, now = Date.now()): MediaVerifyResult {
  const key = secret();
  if (!key) return "disabled";
  if (!requestUri) return "missing";
  let parsed: URL;
  try {
    parsed = new URL(requestUri, "http://media.local");
  } catch {
    return "invalid";
  }
  const exp = Number(parsed.searchParams.get("exp"));
  const sig = parsed.searchParams.get("sig");
  if (!parsed.pathname.startsWith(SIGNED_PREFIX) || !sig || !Number.isInteger(exp)) return "missing";
  if (exp < Math.floor(now / 1000)) return "expired";
  const expected = Buffer.from(sign(parsed.pathname, exp, key));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "invalid";
  return "ok";
}
