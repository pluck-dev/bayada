"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
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
} from "@bayada/ui";

const statusOptions = [
  { value: "DRAFT", label: "초안" },
  { value: "PUBLISHED", label: "공개" },
];

interface CategoryOption {
  value: string;
  label: string;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    fetch("/api/v1/categories")
      .then((res) => res.json())
      .then((data) =>
        setCategories(
          (data ?? []).map((c: { id: string; name: string }) => ({
            value: c.id,
            label: c.name,
          }))
        )
      )
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title") as string,
      slug: form.get("slug") as string,
      description: form.get("description") as string,
      price: Number(form.get("price")) || 0,
      categoryId: (form.get("category") as string) || undefined,
      status: (form.get("status") as string) || "DRAFT",
      thumbnail: (form.get("thumbnail") as string) || undefined,
    };

    try {
      const res = await fetch("/api/v1/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "강의 생성에 실패했습니다");
        return;
      }
      const created = await res.json();
      router.push(`/courses/${created.id}/edit`);
    } catch {
      alert("네트워크 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* 뒤로가기 */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm text-[color:var(--muted)] hover:text-[color:var(--fg)]"
      >
        <ArrowLeft className="h-4 w-4" />
        강의 목록으로
      </Link>

      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--fg)]">
          새 강의 만들기
        </h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          새로운 강의를 생성합니다. 기본 정보를 입력해 주세요.
        </p>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              id="title"
              name="title"
              label="강의 제목"
              placeholder="예: 간호 실무 기초 과정"
              required
            />

            <Input
              id="slug"
              name="slug"
              label="URL 슬러그"
              placeholder="예: nursing-basics"
              required
            />

            <Textarea
              id="description"
              name="description"
              label="강의 설명"
              placeholder="강의에 대한 상세 설명을 입력하세요..."
              rows={4}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                id="price"
                name="price"
                label="가격 (원)"
                type="number"
                placeholder="150000"
                min={0}
                required
              />

              <Select
                id="category"
                name="category"
                label="카테고리"
                options={categories}
                placeholder="카테고리 선택"
              />
            </div>

            <Select
              id="status"
              name="status"
              label="상태"
              options={statusOptions}
              defaultValue="DRAFT"
            />

            <Input
              id="thumbnail"
              name="thumbnail"
              label="썸네일 URL"
              placeholder="https://example.com/image.jpg"
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Link href="/courses">
              <Button variant="outline" type="button">
                취소
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "생성 중..." : "강의 생성"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
