// 어드민 역할·권한 (피그마 05 RBAC 매트릭스 1차 MVP 범위)
// 클라이언트·서버 양쪽에서 쓰는 순수 모듈 — prisma 를 import 하지 않는다.

export const ADMIN_ROLES = ["ADMIN", "CONTENT_MANAGER", "CLINICAL_REVIEWER", "PARTNER_ADMIN"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role: unknown): role is AdminRole {
  return typeof role === "string" && (ADMIN_ROLES as readonly string[]).includes(role);
}

export type Permission =
  | "dashboard"
  | "program.read"
  | "program.write" // 프로그램 생성·수정·커리큘럼·공개범위
  | "approval.queue" // 승인 대기 큐 열람
  | "workflow.operate" // 형식·품질 검토, 승인, 게시, 보관
  | "workflow.clinical" // 임상 리뷰 단계 승인·수정 요청
  | "curation"
  | "taxonomy"
  | "member.read"
  | "member.write" // 가입 승인·거절, 역할 변경
  | "audit"
  | "commerce" // 주문·청구서·기관 (기존 화면)
  | "review" // 후기 숨김·다시 게시
  | "session" // 실습·오프라인 일정, 신청자 명단
  | "pages" // 정적 문서 (약관·개인정보처리방침·환불 규정)
  | "partner.manage" // 파트너 제공기관·파트너 관리자 지정
  | "partner.console"; // 파트너 콘솔 — 자기 제공기관 프로그램만

const MATRIX: Record<AdminRole, readonly Permission[]> = {
  // Super Admin — 전부
  ADMIN: [
    "dashboard",
    "program.read",
    "program.write",
    "approval.queue",
    "workflow.operate",
    "workflow.clinical",
    "curation",
    "taxonomy",
    "member.read",
    "member.write",
    "audit",
    "commerce",
    "review",
    "session",
    "pages",
    "partner.manage",
  ],
  // 콘텐츠 운영자 — 프로그램 CRU + 승인/게시, 배너 CRUD, 회원은 조회만
  CONTENT_MANAGER: [
    "dashboard",
    "program.read",
    "program.write",
    "approval.queue",
    "workflow.operate",
    "curation",
    "taxonomy",
    "member.read",
    "review",
    "session",
  ],
  // 임상 리뷰어 — 승인 대기 큐 중 CLINICAL_REVIEW 항목만
  CLINICAL_REVIEWER: ["approval.queue", "workflow.clinical"],
  // 파트너 관리자 — 파트너 콘솔만. 자기 제공기관 프로그램 작성·수정·승인 요청(승인·게시 불가), 통계는 인원·수료율만
  PARTNER_ADMIN: ["partner.console"],
};

/** 프로그램 본문·커리큘럼을 고칠 수 있는 권한 — 파트너는 서버에서 제공기관 소유를 다시 확인한다 */
export const PROGRAM_EDIT: Permission[] = ["program.write", "partner.console"];

export function can(role: AdminRole, permission: Permission): boolean {
  return MATRIX[role].includes(permission);
}

/** 역할별 첫 화면 */
export function homePath(role: AdminRole, locale: string): string {
  if (role === "CLINICAL_REVIEWER") return `/${locale}/approvals`;
  if (role === "PARTNER_ADMIN") return `/${locale}/partner-console`;
  return `/${locale}`;
}
