import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button, Badge, DataTable, type Column, Input } from "@bayada/ui";
import { COURSE_STATUS_LABELS, formatPrice } from "@bayada/shared";
import type { CourseStatusType } from "@bayada/shared";
import { courseService } from "@/lib/services";

interface CourseRow {
  id: string;
  title: string;
  slug: string;
  status: CourseStatusType;
  price: number;
  category: string;
  students: number;
  createdAt: string;
}

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

export default async function CoursesPage() {
  const result = await courseService.list({});
  const courses: CourseRow[] = result.items.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    status: c.status as CourseStatusType,
    price: c.price,
    category: (c as Record<string, unknown>).category
      ? ((c as Record<string, unknown>).category as { name: string }).name
      : "-",
    students: (c as Record<string, unknown>)._count
      ? ((c as Record<string, unknown>)._count as { enrollments: number }).enrollments
      : 0,
    createdAt: new Date(c.createdAt).toLocaleDateString("ko-KR"),
  }));

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

      {/* 페이지네이션 */}
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
