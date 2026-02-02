import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button, Badge, DataTable, type Column, Input } from "@bayada/ui";
import { COURSE_STATUS_LABELS, formatPrice } from "@bayada/shared";
import type { CourseStatusType } from "@bayada/shared";

// 플레이스홀더 데이터
const courses = [
  {
    id: "1",
    title: "간호 실무 기초 과정",
    slug: "nursing-basics",
    status: "PUBLISHED" as CourseStatusType,
    price: 150000,
    category: "간호",
    students: 324,
    createdAt: "2024-12-15",
  },
  {
    id: "2",
    title: "감염관리 전문가 과정",
    slug: "infection-control",
    status: "PUBLISHED" as CourseStatusType,
    price: 200000,
    category: "감염관리",
    students: 186,
    createdAt: "2024-11-20",
  },
  {
    id: "3",
    title: "환자 안전 관리",
    slug: "patient-safety",
    status: "PUBLISHED" as CourseStatusType,
    price: 89000,
    category: "안전",
    students: 412,
    createdAt: "2024-10-05",
  },
  {
    id: "4",
    title: "재활간호 입문",
    slug: "rehab-nursing-intro",
    status: "DRAFT" as CourseStatusType,
    price: 120000,
    category: "재활",
    students: 0,
    createdAt: "2025-01-28",
  },
  {
    id: "5",
    title: "간호 리더십 과정",
    slug: "nursing-leadership",
    status: "PUBLISHED" as CourseStatusType,
    price: 180000,
    category: "리더십",
    students: 97,
    createdAt: "2024-09-12",
  },
  {
    id: "6",
    title: "노인간호 전문 과정",
    slug: "geriatric-nursing",
    status: "ARCHIVED" as CourseStatusType,
    price: 160000,
    category: "간호",
    students: 251,
    createdAt: "2024-06-01",
  },
  {
    id: "7",
    title: "의료 커뮤니케이션",
    slug: "medical-communication",
    status: "DRAFT" as CourseStatusType,
    price: 75000,
    category: "소통",
    students: 0,
    createdAt: "2025-02-01",
  },
];

type CourseRow = (typeof courses)[number];

const statusBadgeVariant: Record<string, "default" | "success" | "secondary"> = {
  DRAFT: "secondary",
  PUBLISHED: "success",
  ARCHIVED: "default",
};

const columns: Column<CourseRow>[] = [
  {
    key: "title",
    header: "강의명",
    render: (row) => (
      <div>
        <Link
          href={`/courses/${row.id}/edit`}
          className="font-medium text-[color:var(--fg)] hover:text-[#ce0e2d] hover:underline"
        >
          {row.title}
        </Link>
        <p className="mt-0.5 text-xs text-[color:var(--muted)]">/{row.slug}</p>
      </div>
    ),
  },
  {
    key: "category",
    header: "카테고리",
  },
  {
    key: "price",
    header: "가격",
    render: (row) => formatPrice(row.price),
  },
  {
    key: "students",
    header: "수강생",
    render: (row) => `${row.students}명`,
  },
  {
    key: "status",
    header: "상태",
    render: (row) => (
      <Badge variant={statusBadgeVariant[row.status] ?? "secondary"}>
        {COURSE_STATUS_LABELS[row.status]}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    header: "생성일",
  },
  {
    key: "actions",
    header: "",
    render: (row) => (
      <Link href={`/courses/${row.id}/edit`}>
        <Button variant="ghost" size="sm">
          편집
        </Button>
      </Link>
    ),
  },
];

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--fg)]">
            강의 관리
          </h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            전체 강의를 조회하고 관리합니다.
          </p>
        </div>
        <Link href="/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 강의 만들기
          </Button>
        </Link>
      </div>

      {/* 필터/검색 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
          <Input
            placeholder="강의명으로 검색..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            전체
          </Button>
          <Button variant="ghost" size="sm">
            공개
          </Button>
          <Button variant="ghost" size="sm">
            초안
          </Button>
          <Button variant="ghost" size="sm">
            보관
          </Button>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <DataTable<CourseRow> columns={columns} data={courses} keyField="id" />

      {/* 페이지네이션 플레이스홀더 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--muted)]">
          전체 {courses.length}개 강의
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            이전
          </Button>
          <Button variant="outline" size="sm" disabled>
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
