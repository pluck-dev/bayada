import Link from "next/link";
import { Plus } from "lucide-react";
import { Button, Badge, DataTable, type Column } from "@bayada/ui";
import { COURSE_STATUS_LABELS, formatPrice } from "@bayada/shared";
import type { CourseStatusType } from "@bayada/shared";
import { courseService } from "@/lib/services";
import { SearchFilter } from "@/components/SearchFilter";
import { Pagination } from "@/components/Pagination";

interface CourseRow {
  [key: string]: unknown;
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

const statusFilters = [
  { label: "공개", value: "PUBLISHED" },
  { label: "초안", value: "DRAFT" },
  { label: "보관", value: "ARCHIVED" },
];

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

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search ?? "";
  const status = params.status || undefined;

  const result = await courseService.list({
    page,
    limit: 20,
    search: search || undefined,
    status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined,
  });

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
      <SearchFilter
        searchPlaceholder="강의명으로 검색..."
        filterKey="status"
        filters={statusFilters}
      />

      {/* 데이터 테이블 */}
      <DataTable<CourseRow> columns={columns} data={courses} keyField="id" />

      {/* 페이지네이션 */}
      <Pagination
        total={result.total}
        page={result.page}
        limit={result.pageSize}
        totalPages={result.totalPages}
        unit="개 강의"
      />
    </div>
  );
}
