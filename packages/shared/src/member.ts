// 홈페이지 회원 영역(마이페이지) 공용 정의 — 회원 유형·예약 상태·시간대·방문 서비스·건강 수치 범위·이상 징후 판정.
// 순수 모듈(타입·라벨·규칙). web(회원 화면·서버 액션)과 admin(회원·예약 관리)이 같이 쓴다.
import { WEB_SERVICE_OPTIONS, kstDate } from "./web-content";

// ─── 회원 유형 ───

export const MEMBER_TYPES = ["SERVICE_USER", "GUARDIAN", "PROVIDER", "ORGANIZATION"] as const;
export type MemberTypeKey = (typeof MEMBER_TYPES)[number];

export const MEMBER_TYPE_LABEL: Record<MemberTypeKey, string> = {
  SERVICE_USER: "서비스 이용자",
  GUARDIAN: "보호자",
  PROVIDER: "제공자",
  ORGANIZATION: "기관",
};

export const MEMBER_TYPE_DESC: Record<MemberTypeKey, string> = {
  SERVICE_USER: "방문 서비스를 직접 받는 본인이에요. 예약·건강 기록·복약을 관리해요.",
  GUARDIAN: "가족의 서비스를 챙기는 보호자예요. 가족과 연결해 기록을 함께 봐요.",
  PROVIDER: "간호사·요양보호사 등 서비스를 제공하는 개인이에요. 교육 현황과 방문 일정을 봐요.",
  ORGANIZATION: "의료기관·센터·지자체·벤더 담당자예요. 기관 정보와 자격 심사 상태를 봐요.",
};

export function isMemberType(v: unknown): v is MemberTypeKey {
  return typeof v === "string" && (MEMBER_TYPES as readonly string[]).includes(v);
}

export const PROVIDER_ROLES = ["간호사", "간호조무사", "요양보호사", "물리치료사·운동사", "사회복지사", "기타"] as const;
export const ORG_TYPES = ["병원·의원", "장기요양센터", "방문간호센터", "데이케어센터", "지자체·공공기관", "벤더·기업", "기타"] as const;
export const FAMILY_RELATIONSHIPS = ["자녀", "배우자", "부모", "형제자매", "손자녀", "기타"] as const;

// ─── 서비스 예약 ───

export const BOOKING_STATUSES = ["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export type BookingStatusKey = (typeof BOOKING_STATUSES)[number];
export const BOOKING_STATUS_LABEL: Record<BookingStatusKey, string> = {
  REQUESTED: "신청 접수",
  CONFIRMED: "예약 확정",
  COMPLETED: "방문 완료",
  CANCELLED: "취소",
};

export const TIME_SLOTS = ["MORNING", "AFTERNOON", "EVENING"] as const;
export type TimeSlotKey = (typeof TIME_SLOTS)[number];
export const TIME_SLOT_LABEL: Record<TimeSlotKey, string> = {
  MORNING: "오전 (9~12시)",
  AFTERNOON: "오후 (13~17시)",
  EVENING: "저녁 (18~21시)",
};
export const TIME_SLOT_SHORT: Record<TimeSlotKey, string> = { MORNING: "오전", AFTERNOON: "오후", EVENING: "저녁" };
/** 시간대 시작 시각(KST) — 취소 가능 시한 계산용 */
const TIME_SLOT_START_HOUR: Record<TimeSlotKey, number> = { MORNING: 9, AFTERNOON: 13, EVENING: 18 };

export function isTimeSlot(v: unknown): v is TimeSlotKey {
  return typeof v === "string" && (TIME_SLOTS as readonly string[]).includes(v);
}

/** 방문형 서비스만 예약 대상 (임상시험·컨설팅·교육 등은 상담 신청으로) */
const BOOKABLE_SLUGS = [
  "skilled-nursing",
  "private-assistive-care",
  "home-health",
  "personal-care",
  "companion-care",
  "private-duty-nursing",
  "physical-trainer",
  "habilitation",
  "ltci-beneficiary-care",
  "hospice",
] as const;
export const BOOKABLE_SERVICES = BOOKABLE_SLUGS.map((slug) => ({
  slug,
  name: WEB_SERVICE_OPTIONS.find((s) => s.slug === slug)?.name ?? slug,
}));
export function isBookableService(v: unknown): v is (typeof BOOKABLE_SLUGS)[number] {
  return typeof v === "string" && (BOOKABLE_SLUGS as readonly string[]).includes(v);
}
export function serviceName(slug: string): string {
  return WEB_SERVICE_OPTIONS.find((s) => s.slug === slug)?.name ?? slug;
}

/** 방문 예정 시각(시간대 시작, KST) */
export function visitStartsAt(scheduledDate: Date, slot: TimeSlotKey, scheduledTime?: string | null): Date {
  const day = scheduledDate.toISOString().slice(0, 10);
  const hm = scheduledTime && /^\d{2}:\d{2}$/.test(scheduledTime) ? scheduledTime : `${String(TIME_SLOT_START_HOUR[slot]).padStart(2, "0")}:00`;
  return new Date(`${day}T${hm}:00+09:00`);
}

/** 회원 취소 규칙: 신청 접수는 언제든, 확정된 예약은 방문 24시간 전까지 (기능명세 06 §2) */
export const CANCEL_BEFORE_HOURS = 24;
export function memberCanCancel(b: { status: string; scheduledDate: Date; timeSlot: TimeSlotKey; scheduledTime?: string | null }, now = new Date()): boolean {
  if (b.status === "REQUESTED") return true;
  if (b.status !== "CONFIRMED") return false;
  return visitStartsAt(b.scheduledDate, b.timeSlot, b.scheduledTime).getTime() - now.getTime() >= CANCEL_BEFORE_HOURS * 3600_000;
}
/** 회원 변경 규칙: 운영자가 확정하기 전(신청 접수)만 */
export const memberCanChange = (status: string) => status === "REQUESTED";

/** KST 오늘 YYYY-MM-DD */
export const kstToday = (now = new Date()) => kstDate(now);
/** YYYY-MM-DD → @db.Date 저장값(UTC 자정) */
export function dateOnly(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const d = new Date(`${ymd}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== ymd ? null : d;
}
/** @db.Date 값 → YYYY-MM-DD */
export const ymd = (d: Date) => d.toISOString().slice(0, 10);
/** 희망일은 내일부터 90일 안 */
export const BOOKING_MAX_DAYS_AHEAD = 90;

// ─── 방문 기록 ───

export const VISIT_CONDITIONS = ["STABLE", "OBSERVATION", "URGENT"] as const;
export type VisitConditionKey = (typeof VISIT_CONDITIONS)[number];
export const VISIT_CONDITION_LABEL: Record<VisitConditionKey, string> = {
  STABLE: "안정",
  OBSERVATION: "관찰 필요",
  URGENT: "긴급",
};
export const VISIT_SERVICE_ITEMS = [
  "활력징후 측정",
  "투약 관리",
  "상처·욕창 관리",
  "식사 보조",
  "위생·목욕 보조",
  "이동·운동 보조",
  "인지 활동",
  "정서 지원·말벗",
  "가사 지원",
  "보호자 상담",
] as const;

// ─── 건강 기록 ───

export type HealthMetric = "bloodPressure" | "bloodSugar" | "temperature" | "heartRate" | "weight";
export const HEALTH_METRICS: { key: HealthMetric; label: string; unit: string }[] = [
  { key: "bloodPressure", label: "혈압", unit: "mmHg" },
  { key: "bloodSugar", label: "혈당", unit: "mg/dL" },
  { key: "temperature", label: "체온", unit: "°C" },
  { key: "heartRate", label: "맥박", unit: "bpm" },
  { key: "weight", label: "체중", unit: "kg" },
];

/** 입력 허용 범위 (기능명세 06 §3) — 체중은 명세에 없어 10~300kg */
export const HEALTH_RANGES = {
  bloodPressureSys: [60, 250],
  bloodPressureDia: [30, 150],
  bloodSugar: [20, 600],
  temperature: [34, 42],
  heartRate: [30, 200],
  weight: [10, 300],
} as const;
export type HealthField = keyof typeof HEALTH_RANGES;
export const HEALTH_FIELD_LABEL: Record<HealthField, string> = {
  bloodPressureSys: "수축기 혈압",
  bloodPressureDia: "이완기 혈압",
  bloodSugar: "혈당",
  temperature: "체온",
  heartRate: "맥박",
  weight: "체중",
};

export type HealthValues = Partial<Record<HealthField, number>>;

/** 범위 검사 — 틀린 항목의 한국어 안내, 없으면 null */
export function healthRangeError(v: HealthValues): string | null {
  for (const [k, [min, max]] of Object.entries(HEALTH_RANGES) as [HealthField, readonly [number, number]][]) {
    const x = v[k];
    if (x === undefined) continue;
    if (!Number.isFinite(x) || x < min || x > max) return `${HEALTH_FIELD_LABEL[k]}은(는) ${min}~${max} 사이로 입력해 주세요.`;
  }
  if ((v.bloodPressureSys === undefined) !== (v.bloodPressureDia === undefined)) return "혈압은 수축기·이완기를 함께 입력해 주세요.";
  if (Object.values(v).every((x) => x === undefined)) return "측정값을 하나 이상 입력해 주세요.";
  return null;
}

/** 이상 징후 (기능명세 06 §3): URGENT 가 WARNING 보다 우선. 사유 목록도 같이 */
export function healthAlert(v: HealthValues): { type: "URGENT" | "WARNING"; reasons: string[] } | null {
  const urgent: string[] = [];
  const warning: string[] = [];
  if (v.bloodPressureSys !== undefined && (v.bloodPressureSys >= 180 || v.bloodPressureSys <= 80)) urgent.push("수축기 혈압 이상");
  if (v.bloodSugar !== undefined && (v.bloodSugar >= 300 || v.bloodSugar <= 50)) urgent.push("혈당 이상");
  if (v.temperature !== undefined && v.temperature >= 38.5) warning.push("고열");
  if (urgent.length) return { type: "URGENT", reasons: [...urgent, ...warning] };
  if (warning.length) return { type: "WARNING", reasons: warning };
  return null;
}

// ─── 가족 연결 ───

export const FAMILY_LINK_STATUS_LABEL: Record<"PENDING" | "APPROVED" | "REJECTED" | "REVOKED", string> = {
  PENDING: "승인 대기",
  APPROVED: "연결됨",
  REJECTED: "거절됨",
  REVOKED: "연결 해제",
};

/** 휴대폰 번호 비교용 — 숫자만 */
export const digitsOnly = (s: string) => s.replace(/\D/g, "");
