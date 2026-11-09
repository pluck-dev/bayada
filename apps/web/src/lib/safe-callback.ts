/** 로그인 후 돌아갈 주소 — 같은 사이트 경로만 허용 (열린 리다이렉트 방지) */
export function safeCallback(raw: unknown, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}
