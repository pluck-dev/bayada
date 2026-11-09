"use client";
// 브라우저 쪽 공용 상태 — 사이트 키, API 주소, 작성자 프로필·수정 토큰 저장.
// 원본은 부서별 고정 담당자 명단을 썼지만, 바야다는 검수자가 정해져 있지 않아 소속(바야다/제작팀) + 이름 직접 입력으로 바꿨다.
import { createContext, useContext } from "react";
import { isFeedbackDepartment, isReviewerName, type FeedbackDepartment, type FeedbackKind, type FeedbackStatus, type ReviewSiteKey } from "@bayada/review/config";

export const REVIEW_API = {
  feedback: "/api/review/feedback",
  replies: "/api/review/replies",
  session: "/api/review/session",
} as const;

export const ReviewSiteContext = createContext<ReviewSiteKey>("web");
export const useReviewSite = () => useContext(ReviewSiteContext);

export type FeedbackTarget = {
  selector: string; tag: string; text: string; component: string; typography: string;
  font: string; color: string; classes: string;
  width: number; height: number; x: number; y: number;
};

export type SavedFeedback = {
  status: FeedbackStatus; rework_reason?: string | null; rework_requested_at?: string | null;
  id: number; body: string; kind: FeedbackKind; department: FeedbackDepartment | null; assignee: string | null;
  tags: string[]; edit_version: number; context: FeedbackTarget; created_at: string; reply_count: number;
};

export type FeedbackProfile = { department: FeedbackDepartment; assignee: string };

const profileKey = "bayada-review-profile";
const editTokenKey = (id: number) => `bayada-review-edit-token:${id}`;
const replyTokenKey = (id: number) => `bayada-review-reply-delete-token:${id}`;
const tokenPattern = /^[0-9a-f]{64}$/;
const storages = ["localStorage", "sessionStorage"] as const;

export function readFeedbackProfile(): FeedbackProfile | null {
  for (const storageName of storages) {
    try {
      const saved = JSON.parse(window[storageName].getItem(profileKey) ?? "null");
      if (isFeedbackDepartment(saved?.department)) return { department: saved.department, assignee: isReviewerName(saved.assignee) ? saved.assignee : "" };
    } catch { /* 다른 저장소를 확인한다 */ }
  }
  return null;
}

export function saveFeedbackProfile(profile: FeedbackProfile) {
  const value = JSON.stringify(profile);
  for (const storageName of storages) {
    try { window[storageName].setItem(profileKey, value); } catch { /* 저장소가 막혀도 현재 입력값은 그대로 쓴다 */ }
  }
}

function readToken(key: string) {
  for (const storageName of storages) {
    try {
      const token = window[storageName].getItem(key);
      if (token && tokenPattern.test(token)) return token;
    } catch { /* 다른 저장소를 확인한다 */ }
  }
  return null;
}

function saveToken(key: string, id: number, token: string) {
  if (!Number.isSafeInteger(id) || id <= 0 || !tokenPattern.test(token)) return;
  for (const storageName of storages) {
    try { window[storageName].setItem(key, token); } catch { /* 다른 저장소에 남는다 */ }
  }
}

export const readFeedbackEditToken = (id: number) => readToken(editTokenKey(id));
export const saveFeedbackEditToken = (id: number, token: string) => saveToken(editTokenKey(id), id, token);
export const readFeedbackReplyToken = (id: number) => readToken(replyTokenKey(id));
export const saveFeedbackReplyToken = (id: number, token: string) => saveToken(replyTokenKey(id), id, token);
export function clearFeedbackReplyToken(id: number) {
  for (const storageName of storages) {
    try { window[storageName].removeItem(replyTokenKey(id)); } catch { /* 다른 저장소에서 지운다 */ }
  }
}

/** JSON 응답을 읽고 실패면 서버 메시지로 에러를 던진다 */
export async function readResult(response: Response, fallback: string) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : fallback);
  return result;
}
