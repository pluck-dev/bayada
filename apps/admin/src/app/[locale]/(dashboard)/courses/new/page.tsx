"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

const categoryOptions = [
  { value: "nursing", label: "간호" },
  { value: "infection-control", label: "감염관리" },
  { value: "safety", label: "안전" },
  { value: "rehab", label: "재활" },
  { value: "leadership", label: "리더십" },
  { value: "communication", label: "소통" },
];

const statusOptions = [
  { value: "DRAFT", label: "초안" },
  { value: "PUBLISHED", label: "공개" },
];

export default function NewCoursePage() {
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
      <form>
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              id="title"
              label="강의 제목"
              placeholder="예: 간호 실무 기초 과정"
              required
            />

            <Input
              id="slug"
              label="URL 슬러그"
              placeholder="예: nursing-basics"
              required
            />

            <Textarea
              id="description"
              label="강의 설명"
              placeholder="강의에 대한 상세 설명을 입력하세요..."
              rows={4}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                id="price"
                label="가격 (원)"
                type="number"
                placeholder="150000"
                min={0}
                required
              />

              <Select
                id="category"
                label="카테고리"
                options={categoryOptions}
                placeholder="카테고리 선택"
                required
              />
            </div>

            <Select
              id="status"
              label="상태"
              options={statusOptions}
              defaultValue="DRAFT"
            />

            <Input
              id="thumbnail"
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
            <Button type="submit">강의 생성</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
