// 한국 시간(UTC+9, 서머타임 없음) 변환 — 서버가 UTC 컨테이너에서 돌아도 입력·표시가 어긋나지 않게 한다.
// 클라이언트·서버 공용.
const KST_MS = 9 * 3600_000;

/** Date/ISO → <input type="datetime-local"> 값 (KST) */
export function toKstInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  const t = new Date(typeof d === "string" ? d : d.getTime()).getTime() + KST_MS;
  return new Date(t).toISOString().slice(0, 16);
}

/** datetime-local 값(KST 로 입력된 것) → Date. 형식이 틀리면 null */
export function fromKstInput(v: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const d = new Date(`${v}:00+09:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
