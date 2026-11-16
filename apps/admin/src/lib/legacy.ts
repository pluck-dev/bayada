export const LEGACY_KINDS: Record<string, string> = {
  BOARD: "게시판", FILE: "첨부·이미지", CERTIFICATE: "기존 수료증", ANSWER: "시험 답안",
  REVIEW: "승인 대기 후기", ARTICLE: "기존 소식", COMMENT: "댓글", QUIZ_TIME: "시험 시간", HISTORY: "원본 학습 이력",
};
export const LEGACY_STATUS: Record<string, string> = {
  PUBLISHED: "게시", PRIVATE: "비공개", TRASH: "휴지통", PENDING: "승인 대기", PRESERVED: "보존",
};

export function legacyDate(value: string | null): string {
  if (!value) return "기록 없음";
  return value.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1-$2-$3 $4:$5:$6");
}
export const LEGACY_FIELDS: Record<string, string> = {
  author: "작성자 / 학습자", boardName: "게시판", courseTitle: "프로그램", quizTitle: "시험",
  submittedAnswer: "제출 답안", expectedAnswer: "원본 정답", attempt_number: "응시 회차",
  questions_order: "원본 문항 순서", code: "기존 수료증 코드", rating: "평점",
  subtype: "기록 종류", progress_percent: "진도(%)", progress: "원본 점수 / 진도",
  status: "원본 학습 상태", start_time: "시작 시각(원본 초)", end_time: "종료 시각(원본 초)",
  created_at: "원본 기록 시각", originalStatus: "원본 상태", fileName: "파일명", size: "파일 크기(바이트)",
};

export function legacyFields(payload: unknown): [string, string][] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  return Object.entries(payload).filter(([key, value]) => key in LEGACY_FIELDS && value !== null && value !== "")
    .map(([key, value]) => [LEGACY_FIELDS[key]!, typeof value === "object" ? JSON.stringify(value) : String(value)]);
}
