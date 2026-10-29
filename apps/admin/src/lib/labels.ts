// 화면 표기용 라벨 (어드민은 한국어 단일 운영)
import type {
  CourseStatus,
  JobRole,
  LearningMode,
  Level,
  LectureType,
  ProductType,
  QuestionType,
  Role,
  UserStatus,
  Visibility,
} from "@bayada/db";

export const COURSE_STATUSES: CourseStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "CLINICAL_REVIEW",
  "CHANGES_REQUESTED",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
];

export const COURSE_STATUS_LABEL: Record<CourseStatus, string> = {
  DRAFT: "작성 중",
  SUBMITTED: "승인 요청",
  IN_REVIEW: "형식·품질 검토",
  CLINICAL_REVIEW: "임상 검토",
  CHANGES_REQUESTED: "수정 요청",
  APPROVED: "승인",
  PUBLISHED: "게시",
  ARCHIVED: "보관",
};

export type Tone = "zinc" | "blue" | "violet" | "amber" | "red" | "teal" | "green" | "slate";

export const COURSE_STATUS_TONE: Record<CourseStatus, Tone> = {
  DRAFT: "zinc",
  SUBMITTED: "blue",
  IN_REVIEW: "blue",
  CLINICAL_REVIEW: "violet",
  CHANGES_REQUESTED: "amber",
  APPROVED: "teal",
  PUBLISHED: "green",
  ARCHIVED: "slate",
};

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  INTERNAL: "사내",
  PUBLIC: "외부",
};

export const PRODUCT_TYPES: ProductType[] = ["COURSE", "TRACK", "CERTIFICATION", "PATHWAY"];
export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  COURSE: "단과",
  TRACK: "스킬 트랙",
  CERTIFICATION: "인증과정",
  PATHWAY: "커리어 패스웨이",
};

export const JOB_ROLES: JobRole[] = ["CAREGIVER", "NURSE_AIDE", "RN", "PT", "MANAGER", "OTHER"];
export const JOB_ROLE_LABEL: Record<JobRole, string> = {
  CAREGIVER: "요양보호사",
  NURSE_AIDE: "간호조무사",
  RN: "간호사",
  PT: "방문운동사",
  MANAGER: "센터 관리자",
  OTHER: "기타",
};

export const LEARNING_MODES: LearningMode[] = ["ONLINE", "BLENDED", "OFFLINE", "LIVE"];
export const LEARNING_MODE_LABEL: Record<LearningMode, string> = {
  ONLINE: "온라인",
  BLENDED: "블렌디드 (온라인+실습)",
  OFFLINE: "오프라인",
  LIVE: "라이브",
};

export const LEVELS: Level[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
export const LEVEL_LABEL: Record<Level, string> = {
  BEGINNER: "입문",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
};

export const LECTURE_TYPE_LABEL: Record<LectureType, string> = {
  VIDEO: "영상",
  TEXT: "텍스트",
  QUIZ: "퀴즈",
};

export const QUESTION_TYPES: QuestionType[] = ["SINGLE", "MULTI", "TRUE_FALSE", "FILL_GAP", "KEYWORDS"];
export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  SINGLE: "단일 선택",
  MULTI: "복수 선택",
  TRUE_FALSE: "O/X",
  FILL_GAP: "빈칸 채우기",
  KEYWORDS: "키워드 입력",
};

export const ROLES: Role[] = [
  "STUDENT",
  "ADMIN",
  "CONTENT_MANAGER",
  "CLINICAL_REVIEWER",
  "ORG_ADMIN",
  "PARTNER_ADMIN",
];
export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Super Admin",
  CONTENT_MANAGER: "콘텐츠 운영자",
  CLINICAL_REVIEWER: "임상 리뷰어",
  STUDENT: "학습자",
  ORG_ADMIN: "기관 관리자",
  PARTNER_ADMIN: "파트너 관리자",
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인",
  REJECTED: "거절",
};
export const USER_STATUS_TONE: Record<UserStatus, Tone> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "slate",
};

// 감사 로그 action 표기
export const AUDIT_ACTION_LABEL: Record<string, string> = {
  "course.create": "프로그램 생성",
  "course.update": "기본정보 수정",
  "course.delete": "프로그램 삭제",
  "course.curriculum": "커리큘럼 수정",
  "course.visibility": "공개범위 변경",
  "course.featured": "메인 큐레이션 변경",
  "course.submit": "승인 요청",
  "course.start_review": "검토 시작",
  "course.to_clinical": "임상 리뷰로 넘김",
  "course.approve": "승인",
  "course.request_changes": "수정 요청",
  "course.publish": "게시",
  "course.archive": "보관",
  "course.restore": "보관 해제",
  "banner.create": "배너 생성",
  "banner.update": "배너 수정",
  "banner.delete": "배너 삭제",
  "category.create": "카테고리 생성",
  "category.update": "카테고리 수정",
  "category.delete": "카테고리 삭제",
  "provider.create": "제공기관 생성",
  "provider.update": "제공기관 수정",
  "provider.delete": "제공기관 삭제",
  "user.approve": "가입 승인",
  "user.reject": "가입 거절",
  "user.role": "역할 변경",
  "page.create": "문서 생성",
  "page.update": "문서 수정",
  "pathway.create": "패스웨이 생성",
  "pathway.update": "패스웨이 수정",
  "pathway.steps": "패스웨이 단계 수정",
  "pathway.publish": "패스웨이 게시",
  "pathway.unpublish": "패스웨이 게시 중단",
  "pathway.delete": "패스웨이 삭제",
  "session.create": "실습 일정 생성",
  "session.update": "실습 일정 수정",
  "session.delete": "실습 일정 삭제",
  "session.export": "신청자 명단 내보내기",
  "review.hide": "후기 숨김",
  "review.publish": "후기 다시 게시",
  "review.dismiss": "신고 기각",
  "organization.create": "기관 생성",
  "partner.assign": "파트너 관리자 지정",
  "partner.unassign": "파트너 관리자 해제",
};

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" });
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
