// 피드백 화면 표기 (색·짧은 이름) — 서버·클라이언트 공용 순수 모듈
import type { Tone } from "./labels";

export const FEEDBACK_STATUS_TONE: Record<string, Tone> = {
  open: "zinc",
  discussion: "red",
  developed: "amber",
  deployed: "blue",
  resolved: "green",
};

export const FEEDBACK_KIND_TONE: Record<string, Tone> = {
  design: "blue",
  interaction: "violet",
  bug: "red",
  content: "teal",
  general: "zinc",
};
