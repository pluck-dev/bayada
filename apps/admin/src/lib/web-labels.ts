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
