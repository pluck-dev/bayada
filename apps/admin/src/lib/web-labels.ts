// 웹사이트 작업 영역 화면 표기 (상태 색)
import type { WebInquiryStatus } from "@bayada/db";
import type { Tone } from "./labels";

export const INQUIRY_STATUS_TONE: Record<WebInquiryStatus, Tone> = {
  NEW: "red",
  CONTACTED: "blue",
  IN_PROGRESS: "amber",
  DONE: "green",
  SPAM: "slate",
};

// 홈페이지 서비스 예약·회원
export const BOOKING_STATUS_TONE: Record<"REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED", Tone> = {
  REQUESTED: "red",
  CONFIRMED: "blue",
  COMPLETED: "green",
  CANCELLED: "slate",
};
export const VISIT_CONDITION_TONE: Record<"STABLE" | "OBSERVATION" | "URGENT", Tone> = { STABLE: "green", OBSERVATION: "amber", URGENT: "red" };
export const MEMBER_TYPE_TONE: Record<"SERVICE_USER" | "GUARDIAN" | "PROVIDER" | "ORGANIZATION", Tone> = {
  SERVICE_USER: "blue",
  GUARDIAN: "violet",
  PROVIDER: "teal",
  ORGANIZATION: "amber",
};
