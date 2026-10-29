// 어드민 역할·권한 (피그마 05 RBAC 매트릭스 1차 MVP 범위)
// 클라이언트·서버 양쪽에서 쓰는 순수 모듈 — prisma 를 import 하지 않는다.

export const ADMIN_ROLES = ["ADMIN", "CONTENT_MANAGER", "CLINICAL_REVIEWER"] as const;
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
  | "commerce"; // 주문·청구서·기관 (기존 화면)

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
  ],
  // 임상 리뷰어 — 승인 대기 큐 중 CLINICAL_REVIEW 항목만
  CLINICAL_REVIEWER: ["approval.queue", "workflow.clinical"],
};

export function can(role: AdminRole, permission: Permission): boolean {
  return MATRIX[role].includes(permission);
}

/** 역할별 첫 화면 */
export function homePath(role: AdminRole, locale: string): string {
  return role === "CLINICAL_REVIEWER" ? `/${locale}/approvals` : `/${locale}`;
}
