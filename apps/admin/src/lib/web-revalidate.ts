// 홈페이지(apps/web) 다시 만들기 요청 — 웹사이트 콘텐츠를 저장한 뒤 부른다.
// WEB_URL(컨테이너 안에선 http://web:3000) + WEB_REVALIDATE_SECRET 이 없으면 건너뛴다(홈페이지는 ISR 주기로 반영).
// 실패해도 저장은 이미 끝났으므로 에러를 던지지 않고 결과 문구만 돌려준다.
export async function revalidateWeb(): Promise<string> {
  const url = process.env.WEB_URL?.replace(/\/+$/, "");
  const secret = process.env.WEB_REVALIDATE_SECRET;
  if (!url || !secret) return "홈페이지에는 최대 5분 안에 반영됩니다.";
  try {
    const res = await fetch(`${url}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return "홈페이지에 반영됐습니다.";
  } catch (error) {
    console.error("[web-revalidate] 홈페이지 갱신 요청 실패", error);
    return "홈페이지 갱신 요청이 실패해 최대 5분 뒤 반영됩니다.";
  }
}
