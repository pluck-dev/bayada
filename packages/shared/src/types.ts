// ─── 사용자 관련 타입 ───
export type UserRole = "ADMIN" | "STUDENT" | "ORG_ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  organizationId: string | null;
}

// ─── 강의 관련 타입 ───
export type CourseStatusType = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type LectureTypeValue = "VIDEO" | "TEXT";

export interface CourseWithDetails {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  status: CourseStatusType;
  category: { id: string; name: string; slug: string } | null;
  sections: SectionWithLectures[];
  _count?: {
    enrollments: number;
  };
}

export interface SectionWithLectures {
  id: string;
  title: string;
  order: number;
  lectures: LectureSummary[];
}

export interface LectureSummary {
  id: string;
  title: string;
  order: number;
  type: LectureTypeValue;
  duration: number | null;
  isFree: boolean;
}

// ─── 주문 관련 타입 ───
export type OrderTypeValue = "B2C" | "B2B";
export type OrderStatusValue = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface CartItem {
  courseId: string;
  title: string;
  price: number;
  thumbnail: string | null;
  quantity: number; // B2B: 수강생 수
}

// ─── 진도 관련 타입 ───
export interface ProgressInfo {
  lectureId: string;
  completed: boolean;
  watchedSec: number;
}

export interface CourseProgress {
  courseId: string;
  totalLectures: number;
  completedLectures: number;
  progressPercent: number;
}

// ─── API 응답 타입 ───
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
