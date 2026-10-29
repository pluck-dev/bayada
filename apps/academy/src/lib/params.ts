/** 동적 세그먼트가 퍼센트 인코딩된 채 들어오는 경우(한글 slug)를 대비해 한 번 디코딩 */
export function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** 한국어 이름 가운데 글자 가리기: 홍길동 → 홍*동, 김철 → 김*, 남궁민수 → 남**수 */
export function maskName(name: string | null | undefined): string {
  const n = (name ?? "").trim();
  if (!n) return "수료자";
  if (n.length === 1) return n;
  if (n.length === 2) return `${n[0]}*`;
  return `${n[0]}${"*".repeat(n.length - 2)}${n[n.length - 1]}`;
}
