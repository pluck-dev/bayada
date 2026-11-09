// 어드민 역할·권한 — 권한 목록(코드)과 역할별 기본값. 역할별 실제 권한은 DB(AdminRoleDef)에서 읽는다(lib/roles.ts).
// 클라이언트·서버 양쪽에서 쓰는 순수 모듈 — prisma 를 import 하지 않는다.

/** 시스템 운영 역할 (Role enum 중 어드민 콘솔에 들어오는 것) */
export const ADMIN_ROLES = ["ADMIN", "CONTENT_MANAGER", "CLINICAL_REVIEWER", "PARTNER_ADMIN"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role: unknown): role is AdminRole {
  return typeof role === "string" && (ADMIN_ROLES as readonly string[]).includes(role);
}

/** 권한 정의 — 그룹·한국어 이름·한 줄 설명. 순서가 화면(역할·권한 매트릭스) 순서다 */
export const PERMISSION_DEFS = [
  { key: "dashboard", group: "공통", label: "대시보드", desc: "운영 현황 숫자와 최근 활동을 봅니다." },
  { key: "program.read", group: "프로그램", label: "프로그램 조회", desc: "프로그램 목록·상세·커리큘럼을 봅니다." },
  { key: "program.write", group: "프로그램", label: "프로그램 작성·수정", desc: "생성·기본정보·커리큘럼·공개범위를 바꾸고 승인 요청합니다." },
  { key: "approval.queue", group: "프로그램", label: "승인 대기 큐", desc: "승인 대기 큐를 봅니다 (처리는 아래 검토 권한)." },
  { key: "workflow.operate", group: "프로그램", label: "형식·품질 검토·게시", desc: "검토 시작, 승인, 수정 요청, 게시, 보관을 처리합니다." },
  { key: "workflow.clinical", group: "프로그램", label: "임상 리뷰", desc: "임상 검토 단계의 승인·수정 요청을 처리합니다." },
  { key: "curation", group: "프로그램", label: "배너·메인 큐레이션", desc: "홈 배너와 메인 노출 프로그램을 관리합니다." },
  { key: "taxonomy", group: "프로그램", label: "택소노미", desc: "카테고리·제공기관을 관리합니다." },
  { key: "pathway", group: "프로그램", label: "커리어 패스웨이", desc: "국가·직군별 경로와 단계를 작성·게시합니다." },
  { key: "member.read", group: "회원·학습", label: "회원 조회", desc: "회원 목록·수강 현황을 봅니다." },
  { key: "member.write", group: "회원·학습", label: "회원 관리", desc: "가입 승인·거절, 역할 변경을 합니다." },
  { key: "review", group: "회원·학습", label: "후기 관리", desc: "신고된 후기를 숨기거나 다시 게시합니다." },
  { key: "session", group: "회원·학습", label: "실습·오프라인 일정", desc: "일정을 만들고 신청자 명단을 내려받습니다." },
  { key: "credential.read", group: "바야다 인증", label: "인증 심사 큐", desc: "인증 신청·심사 현황을 봅니다." },
  { key: "credential.evaluate", group: "바야다 인증", label: "심사위원 평가", desc: "시험·실기 점수를 입력하고 평가를 완료합니다." },
  { key: "credential.approve", group: "바야다 인증", label: "승인·발급·취소", desc: "평가 완료된 신청을 승인(발급)·반려하고 발급된 인증을 취소합니다." },
  { key: "credential.program", group: "바야다 인증", label: "인증 과정 설정", desc: "선수 강의·합격 점수·유효기간 등 과정 정책을 정합니다." },
  { key: "partner.manage", group: "파트너", label: "파트너 관리", desc: "파트너 제공기관과 파트너 관리자를 지정합니다." },
  { key: "partner.console", group: "파트너", label: "파트너 콘솔", desc: "자기 제공기관 프로그램만 다룹니다. 파트너 관리자 전용(변경 불가)." },
  { key: "commerce", group: "B2B·결제", label: "기관·주문·요금제·청구서", desc: "기관, 주문·환불, 패스 요금제, 청구서를 관리합니다." },
  { key: "pages", group: "사이트 운영", label: "문서 관리", desc: "이용약관·개인정보처리방침·환불 규정 원문을 고칩니다." },
  { key: "site.manage", group: "사이트 운영", label: "사이트 설정", desc: "아카데미 홈 문구·섹션·FAQ·푸터·SEO 기본값을 바꿉니다." },
  { key: "feedback", group: "사이트 운영", label: "클라이언트 피드백", desc: "웹사이트·아카데미 리뷰 모드에서 남긴 피드백의 상태·댓글을 관리합니다." },
  { key: "audit", group: "사이트 운영", label: "감사 로그", desc: "누가 언제 무엇을 바꿨는지 봅니다." },
  { key: "role.manage", group: "사이트 운영", label: "역할·권한", desc: "역할별 권한을 바꾸고 사용자 정의 역할을 만듭니다." },
] as const;

export type Permission = (typeof PERMISSION_DEFS)[number]["key"];
export const ALL_PERMISSIONS: Permission[] = PERMISSION_DEFS.map((p) => p.key);

export function isPermission(v: unknown): v is Permission {
  return typeof v === "string" && (ALL_PERMISSIONS as string[]).includes(v);
}

/**
 * 파트너 콘솔은 PARTNER_ADMIN 전용으로 고정한다. 소유권 검사(guards.ts)가 role === PARTNER_ADMIN 기준이라
 * 다른 역할에 주면 다른 기관 프로그램까지 고칠 수 있게 된다.
 */
export const FIXED_PERMISSIONS: Partial<Record<Permission, AdminRole>> = { "partner.console": "PARTNER_ADMIN" };

/** 시스템 역할 기본 권한 — AdminRoleDef 가 비어 있을 때 시드 값 (피그마 05 RBAC 매트릭스) */
export const DEFAULT_ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  // Super Admin — 전부 (실제로는 코드에서 항상 전체 권한)
  ADMIN: ALL_PERMISSIONS.filter((p) => p !== "partner.console"),
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
    "pathway",
    "credential.read",
    "credential.approve",
    "credential.program",
  ],
  // 임상 리뷰어 — 승인 대기 큐 중 CLINICAL_REVIEW 항목만 + 바야다 인증 심사위원(평가만, 발급은 운영자)
  CLINICAL_REVIEWER: ["approval.queue", "workflow.clinical", "credential.read", "credential.evaluate"],
  // 파트너 관리자 — 파트너 콘솔만. 자기 제공기관 프로그램 작성·수정·승인 요청(승인·게시 불가)
  PARTNER_ADMIN: ["partner.console"],
};

export const SYSTEM_ROLE_DEFAULTS: Record<AdminRole, { name: string; description: string }> = {
  ADMIN: { name: "Super Admin", description: "모든 권한. 잠금 — 권한을 뺄 수 없습니다." },
  CONTENT_MANAGER: { name: "콘텐츠 운영자", description: "프로그램 작성·검토·게시, 큐레이션, 회원 조회" },
  CLINICAL_REVIEWER: { name: "임상 리뷰어", description: "임상 검토 단계 승인, 인증 심사위원" },
  PARTNER_ADMIN: { name: "파트너 관리자", description: "파트너 콘솔 — 자기 제공기관 프로그램만" },
};

/** ADMIN 은 DB 값과 무관하게 항상 전체 권한 (잠금 — 역할·권한 화면에서 스스로 잠기는 사고 방지) */
export function effectivePermissions(roleKey: string, stored: readonly string[]): Permission[] {
  if (roleKey === "ADMIN") return [...DEFAULT_ROLE_PERMISSIONS.ADMIN];
  const fixedOk = (p: Permission) => !FIXED_PERMISSIONS[p] || FIXED_PERMISSIONS[p] === roleKey;
  const set = new Set(stored.filter(isPermission).filter(fixedOk));
  if (roleKey === "PARTNER_ADMIN") set.add("partner.console");
  return ALL_PERMISSIONS.filter((p) => set.has(p));
}

/** 프로그램 본문·커리큘럼을 고칠 수 있는 권한 — 파트너는 서버에서 제공기관 소유를 다시 확인한다 */
export const PROGRAM_EDIT: Permission[] = ["program.write", "partner.console"];

export interface PermissionSubject {
  permissions: readonly Permission[];
}

export function can(user: PermissionSubject, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

/** 권한별 첫 화면 후보 (사이드바 순서) */
const HOME_ORDER: [Permission, string][] = [
  ["dashboard", ""],
  ["partner.console", "/partner-console"],
  ["approval.queue", "/approvals"],
  ["program.read", "/programs"],
  ["curation", "/curation"],
  ["taxonomy", "/taxonomy"],
  ["member.read", "/members"],
  ["review", "/reviews"],
  ["session", "/sessions"],
  ["pathway", "/pathways"],
  ["credential.read", "/credentials"],
  ["partner.manage", "/partners"],
  ["pages", "/pages"],
  ["site.manage", "/site-settings"],
  ["feedback", "/feedback"],
  ["role.manage", "/roles"],
  ["audit", "/audit"],
  ["commerce", "/organizations"],
];

/** 사용자별 첫 화면 — 가진 권한 중 사이드바 순서로 첫 번째 (권한이 하나도 없으면 로그인 자체가 막힌다) */
export function homePath(user: PermissionSubject & { role?: string }, locale: string): string {
  // 임상 리뷰어는 대시보드가 있어도 큐가 첫 화면이던 기존 동작 유지
  if (user.role === "CLINICAL_REVIEWER" && can(user, "approval.queue")) return `/${locale}/approvals`;
  const hit = HOME_ORDER.find(([p]) => can(user, p));
  return `/${locale}${hit ? hit[1] : ""}`;
}
