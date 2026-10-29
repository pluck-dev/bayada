// 프로그램 승인 워크플로우 상태 머신 (피그마 04)
// DRAFT → SUBMITTED → IN_REVIEW → (CLINICAL_REVIEW) → APPROVED → PUBLISHED → ARCHIVED
// 수정 요청(CHANGES_REQUESTED)은 제출·검토 단계 어디서든 가능하고, 수정 후 다시 승인 요청한다.
import type { CourseStatus } from "@bayada/db";
import type { AdminRole } from "./rbac";

export type WorkflowAction =
  | "submit"
  | "start_review"
  | "to_clinical"
  | "approve"
  | "request_changes"
  | "publish"
  | "archive"
  | "restore";

export interface Transition {
  action: WorkflowAction;
  from: CourseStatus;
  to: CourseStatus;
  roles: AdminRole[];
  label: string;
  noteRequired?: boolean;
  /** 되돌리기 어려운 전이 — 확인 대화상자 */
  confirm?: string;
}

const OPS: AdminRole[] = ["ADMIN", "CONTENT_MANAGER"];
const CLINICAL: AdminRole[] = ["ADMIN", "CLINICAL_REVIEWER"];
// 승인 요청(제출)만 파트너 관리자도 할 수 있다 — 자기 제공기관 프로그램인지는 서버 액션이 확인
const SUBMITTERS: AdminRole[] = [...OPS, "PARTNER_ADMIN"];

export const TRANSITIONS: Transition[] = [
  { action: "submit", from: "DRAFT", to: "SUBMITTED", roles: SUBMITTERS, label: "승인 요청" },
  { action: "submit", from: "CHANGES_REQUESTED", to: "SUBMITTED", roles: SUBMITTERS, label: "재제출" },
  { action: "start_review", from: "SUBMITTED", to: "IN_REVIEW", roles: OPS, label: "검토 시작" },
  { action: "request_changes", from: "SUBMITTED", to: "CHANGES_REQUESTED", roles: OPS, label: "수정 요청", noteRequired: true },
  { action: "to_clinical", from: "IN_REVIEW", to: "CLINICAL_REVIEW", roles: OPS, label: "임상 리뷰로 넘기기" },
  { action: "approve", from: "IN_REVIEW", to: "APPROVED", roles: OPS, label: "승인" },
  { action: "request_changes", from: "IN_REVIEW", to: "CHANGES_REQUESTED", roles: OPS, label: "수정 요청", noteRequired: true },
  { action: "approve", from: "CLINICAL_REVIEW", to: "APPROVED", roles: CLINICAL, label: "승인" },
  { action: "request_changes", from: "CLINICAL_REVIEW", to: "CHANGES_REQUESTED", roles: CLINICAL, label: "수정 요청", noteRequired: true },
  {
    action: "publish",
    from: "APPROVED",
    to: "PUBLISHED",
    roles: OPS,
    label: "게시",
    confirm: "게시하면 공개범위에 맞춰 카탈로그에 바로 노출되고 수강 신청을 받습니다.",
  },
  {
    action: "archive",
    from: "PUBLISHED",
    to: "ARCHIVED",
    roles: OPS,
    label: "보관",
    confirm: "보관하면 신규 수강 신청이 막힙니다. 이미 수강 중인 학습자는 계속 학습할 수 있습니다.",
  },
  {
    action: "archive",
    from: "APPROVED",
    to: "ARCHIVED",
    roles: OPS,
    label: "보관",
    confirm: "게시하지 않고 보관합니다. 다시 열려면 보관 해제 후 승인 절차를 거쳐야 합니다.",
  },
  {
    action: "restore",
    from: "ARCHIVED",
    to: "DRAFT",
    roles: OPS,
    label: "보관 해제",
    confirm: "작성 중 상태로 되돌립니다. 다시 게시하려면 승인 절차를 거쳐야 합니다.",
  },
];

export function findTransition(action: WorkflowAction, from: CourseStatus): Transition | undefined {
  return TRANSITIONS.find((t) => t.action === action && t.from === from);
}

export function availableTransitions(status: CourseStatus, role: AdminRole): Transition[] {
  return TRANSITIONS.filter((t) => t.from === status && t.roles.includes(role));
}

/** 검토가 진행 중이라 본문 수정을 잠그는 상태 */
export const LOCKED_STATUSES: CourseStatus[] = ["SUBMITTED", "IN_REVIEW", "CLINICAL_REVIEW", "APPROVED"];

/** 승인 대기 큐에 보이는 상태 */
export const QUEUE_STATUSES: CourseStatus[] = ["SUBMITTED", "IN_REVIEW", "CLINICAL_REVIEW", "APPROVED"];

export interface ChecklistInput {
  objectives: string[];
  audiences: string[];
  durationMin: number | null;
  providerId: string | null;
  lectureCount: number;
}

export interface ChecklistItem {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
}

/** 승인 요청 전 필수 필드 검증 — 하나라도 빠지면 승인 요청 불가 */
export function requiredChecklist(c: ChecklistInput, providerName?: string | null): ChecklistItem[] {
  return [
    {
      key: "objectives",
      label: "학습목표",
      ok: c.objectives.filter((o) => o.trim()).length > 0,
      detail: c.objectives.length ? `${c.objectives.length}개` : "1개 이상 입력",
    },
    {
      key: "audiences",
      label: "대상 직군",
      ok: c.audiences.length > 0,
      detail: c.audiences.length ? `${c.audiences.length}개 직군` : "1개 이상 선택",
    },
    {
      key: "durationMin",
      label: "소요시간",
      ok: !!c.durationMin && c.durationMin > 0,
      detail: c.durationMin ? `${c.durationMin}분` : "분 단위로 입력",
    },
    {
      key: "lectures",
      label: "커리큘럼",
      ok: c.lectureCount > 0,
      detail: c.lectureCount ? `레슨 ${c.lectureCount}개` : "레슨 1개 이상",
    },
    {
      key: "provider",
      label: "제공기관",
      ok: !!c.providerId,
      detail: providerName ?? "제공기관 선택",
    },
  ];
}
