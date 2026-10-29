import type { JobRole, LearningMode, Level, ProductType, LectureType } from "@bayada/db";

// 직군 탭·필터 순서 (피그마 W1 ③)
export const JOB_ROLES: JobRole[] = ["CAREGIVER", "NURSE_AIDE", "RN", "PT", "MANAGER"];

export const JOB_ROLE_LABEL: Record<JobRole, string> = {
  CAREGIVER: "요양보호사·간병인",
  NURSE_AIDE: "간호조무사",
  RN: "간호사(RN)",
  PT: "방문운동사",
  MANAGER: "센터 관리자",
  OTHER: "기타",
};

// 커리어 패스웨이(PATHWAY)는 3차 범위라 1차 필터에서 뺀다
export const PRODUCT_TYPES: ProductType[] = ["COURSE", "TRACK", "CERTIFICATION"];

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  COURSE: "단과 강좌",
  TRACK: "스킬 트랙",
  CERTIFICATION: "바야다 인증과정",
  PATHWAY: "커리어 패스웨이",
};

export const LEVELS: Level[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

export const LEVEL_LABEL: Record<Level, string> = {
  BEGINNER: "입문",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
};

export const LEARNING_MODES: LearningMode[] = ["ONLINE", "BLENDED", "OFFLINE", "LIVE"];

export const LEARNING_MODE_LABEL: Record<LearningMode, string> = {
  ONLINE: "온라인",
  BLENDED: "블렌디드",
  OFFLINE: "오프라인",
  LIVE: "라이브",
};

// 인증 유형 필터: 바야다 인증과정(CERTIFICATION)만 '바야다 인증', 나머지는 이수 시 수료증
export const CERT_KINDS = ["COMPLETION", "BAYADA"] as const;
export type CertKind = (typeof CERT_KINDS)[number];
export const CERT_KIND_LABEL: Record<CertKind, string> = { COMPLETION: "수료증", BAYADA: "바야다 인증" };

export const PRICE_KINDS = ["free", "paid"] as const;
export type PriceKind = (typeof PRICE_KINDS)[number];
export const PRICE_KIND_LABEL: Record<PriceKind, string> = { free: "무료", paid: "유료" };

export const LECTURE_TYPE_LABEL: Record<LectureType, string> = {
  VIDEO: "영상",
  TEXT: "읽기",
  QUIZ: "퀴즈",
};

/** 분 → "1시간 20분" */
export function formatMinutes(min: number | null | undefined): string | null {
  if (!min || min <= 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}분`;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

/** 초 → "12:05" */
export function formatSeconds(sec: number | null | undefined): string | null {
  if (!sec || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function formatPrice(price: number): string {
  return price > 0 ? `${price.toLocaleString("ko-KR")}원` : "무료";
}

const KST_PARTS = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function kst(d: Date) {
  const p = Object.fromEntries(KST_PARTS.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}.${p.month}.${p.day}`, weekday: p.weekday, time: `${p.hour}:${p.minute}` };
}

/** 실습 일정 표기 (한국 시간): "2026.11.08 (토) 10:00–17:00", 날짜가 다르면 끝 날짜도 */
export function formatSessionRange(start: Date, end: Date): string {
  const s = kst(start);
  const e = kst(end);
  return s.date === e.date
    ? `${s.date} (${s.weekday}) ${s.time}–${e.time}`
    : `${s.date} (${s.weekday}) ${s.time} – ${e.date} (${e.weekday}) ${e.time}`;
}
