"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Video,
  FileText,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
  Skeleton,
} from "@bayada/ui";
import { COURSE_STATUS_LABELS } from "@bayada/shared";

const statusOptions = [
  { value: "DRAFT", label: "초안" },
  { value: "PUBLISHED", label: "공개" },
  { value: "ARCHIVED", label: "보관" },
];

interface CategoryOption {
  value: string;
  label: string;
}

interface Lecture {
  id: string;
  title: string;
  type: "VIDEO" | "TEXT";
  duration: number | null;
  isFree: boolean;
}

interface Section {
  id: string;
  title: string;
  order: number;
  expanded: boolean;
  lectures: Lecture[];
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  status: string;
  thumbnail: string | null;
  categoryId: string | null;
  sections: Array<{
    id: string;
    title: string;
    order: number;
    lectures: Lecture[];
  }>;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/courses/${id}`).then((r) => r.json()),
      fetch("/api/v1/categories").then((r) => r.json()),
    ])
      .then(([courseData, cats]) => {
        setCourse(courseData);
        setSections(
          (courseData.sections ?? []).map(
            (s: CourseData["sections"][number], i: number) => ({
              ...s,
              expanded: i === 0,
            })
          )
        );
        setCategories(
          (cats ?? []).map((c: { id: string; name: string }) => ({
            value: c.id,
            label: c.name,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, expanded: !s.expanded } : s
      )
    );
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title") as string,
      slug: form.get("slug") as string,
      description: form.get("description") as string,
      price: Number(form.get("price")) || 0,
      categoryId: (form.get("category") as string) || null,
      status: (form.get("status") as string) || "DRAFT",
      thumbnail: (form.get("thumbnail") as string) || null,
    };

    try {
      const res = await fetch(`/api/v1/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "저장에 실패했습니다");
        return;
      }
      const updated = await res.json();
      setCourse(updated);
      alert("변경사항이 저장되었습니다");
    } catch {
      alert("네트워크 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-16 text-center text-[color:var(--muted)]">
        강의를 찾을 수 없습니다
      </div>
    );
  }

  const statusVariant =
    course.status === "PUBLISHED"
      ? "success"
      : course.status === "ARCHIVED"
        ? "default"
        : "secondary";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* 뒤로가기 */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm text-[color:var(--muted)] hover:text-[color:var(--fg)]"
      >
        <ArrowLeft className="h-4 w-4" />
        강의 목록으로
      </Link>

      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--fg)]">
            강의 편집
          </h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            강의 정보와 커리큘럼을 수정합니다.
          </p>
        </div>
        <Badge variant={statusVariant as "success" | "default" | "secondary"}>
          {COURSE_STATUS_LABELS[course.status as keyof typeof COURSE_STATUS_LABELS] ?? course.status}
        </Badge>
      </div>

      {/* 기본 정보 */}
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              id="title"
              name="title"
              label="강의 제목"
              defaultValue={course.title}
            />

            <Input
              id="slug"
              name="slug"
              label="URL 슬러그"
              defaultValue={course.slug}
            />

            <Textarea
              id="description"
              name="description"
              label="강의 설명"
              defaultValue={course.description ?? ""}
              rows={3}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Input
                id="price"
                name="price"
                label="가격 (원)"
                type="number"
                defaultValue={course.price}
              />
              <Select
                id="category"
                name="category"
                label="카테고리"
                options={categories}
                defaultValue={course.categoryId ?? undefined}
              />
              <Select
                id="status"
                name="status"
                label="상태"
                options={statusOptions}
                defaultValue={course.status}
              />
            </div>

            <Input
              id="thumbnail"
              name="thumbnail"
              label="썸네일 URL"
              defaultValue={course.thumbnail ?? ""}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "저장 중..." : "변경사항 저장"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* 커리큘럼 관리 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>커리큘럼</CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              섹션 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-lg border border-[color:var(--border)] bg-white"
            >
              {/* 섹션 헤더 */}
              <div
                className="flex cursor-pointer items-center gap-3 px-4 py-3"
                onClick={() => toggleSection(section.id)}
              >
                <GripVertical className="h-4 w-4 shrink-0 text-[color:var(--muted)]" />
                {section.expanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-[color:var(--muted)]" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--muted)]" />
                )}
                <span className="flex-1 text-sm font-medium text-[color:var(--fg)]">
                  {section.title}
                </span>
                <span className="text-xs text-[color:var(--muted)]">
                  {section.lectures.length}개 강의
                </span>
                <button className="rounded p-1 text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]">
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button className="rounded p-1 text-[color:var(--muted)] hover:bg-[color:var(--error-bg)] hover:text-[color:var(--error)]">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* 강의 목록 */}
              {section.expanded && (
                <div className="border-t border-[color:var(--border)]">
                  {section.lectures.map((lecture) => (
                    <div
                      key={lecture.id}
                      className="flex items-center gap-3 border-b border-[color:var(--border)] px-4 py-2.5 pl-14 last:border-0"
                    >
                      <GripVertical className="h-3.5 w-3.5 shrink-0 text-[color:var(--muted)]" />
                      {lecture.type === "VIDEO" ? (
                        <Video className="h-4 w-4 shrink-0 text-[color:var(--info)]" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-[color:var(--warning)]" />
                      )}
                      <span className="flex-1 text-sm text-[color:var(--fg)]">
                        {lecture.title}
                      </span>
                      {lecture.isFree && (
                        <Badge variant="info">무료</Badge>
                      )}
                      <span className="text-xs text-[color:var(--muted)]">
                        {formatDuration(lecture.duration)}
                      </span>
                      <button className="rounded p-1 text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded p-1 text-[color:var(--muted)] hover:bg-[color:var(--error-bg)] hover:text-[color:var(--error)]">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {/* 강의 추가 버튼 */}
                  <div className="px-4 py-2.5 pl-14">
                    <button className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ce0e2d] hover:underline">
                      <Plus className="h-3.5 w-3.5" />
                      강의 추가
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {sections.length === 0 && (
            <p className="py-8 text-center text-sm text-[color:var(--muted)]">
              아직 커리큘럼이 없습니다. 섹션을 추가해 주세요.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
