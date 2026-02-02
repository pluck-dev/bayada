"use client";

import { useState } from "react";
import Link from "next/link";
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
  { value: "ARCHIVED", label: "보관" },
];

// 플레이스홀더 섹션/강의 데이터
const initialSections = [
  {
    id: "s1",
    title: "1장. 간호의 기본 원칙",
    order: 1,
    expanded: true,
    lectures: [
      {
        id: "l1",
        title: "간호 윤리와 전문직 소양",
        type: "VIDEO" as const,
        duration: 1200,
        isFree: true,
      },
      {
        id: "l2",
        title: "환자 권리와 의무",
        type: "VIDEO" as const,
        duration: 900,
        isFree: false,
      },
      {
        id: "l3",
        title: "1장 핵심 정리",
        type: "TEXT" as const,
        duration: null,
        isFree: false,
      },
    ],
  },
  {
    id: "s2",
    title: "2장. 감염 예방과 관리",
    order: 2,
    expanded: false,
    lectures: [
      {
        id: "l4",
        title: "표준 주의 지침",
        type: "VIDEO" as const,
        duration: 1500,
        isFree: false,
      },
      {
        id: "l5",
        title: "손 위생의 중요성",
        type: "VIDEO" as const,
        duration: 600,
        isFree: false,
      },
    ],
  },
  {
    id: "s3",
    title: "3장. 투약 관리",
    order: 3,
    expanded: false,
    lectures: [
      {
        id: "l6",
        title: "투약의 5 Rights",
        type: "VIDEO" as const,
        duration: 1800,
        isFree: false,
      },
      {
        id: "l7",
        title: "정맥 주사 관리",
        type: "VIDEO" as const,
        duration: 2100,
        isFree: false,
      },
      {
        id: "l8",
        title: "투약 오류 예방",
        type: "TEXT" as const,
        duration: null,
        isFree: false,
      },
    ],
  },
];

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function EditCoursePage() {
  const [sections, setSections] = useState(initialSections);

  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, expanded: !s.expanded } : s
      )
    );
  };

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
        <Badge variant="success">공개</Badge>
      </div>

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Input
            id="title"
            label="강의 제목"
            defaultValue="간호 실무 기초 과정"
          />

          <Input
            id="slug"
            label="URL 슬러그"
            defaultValue="nursing-basics"
          />

          <Textarea
            id="description"
            label="강의 설명"
            defaultValue="간호의 기본 원칙부터 실무에 필요한 핵심 역량까지, 체계적으로 학습할 수 있는 과정입니다."
            rows={3}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Input
              id="price"
              label="가격 (원)"
              type="number"
              defaultValue={150000}
            />
            <Select
              id="category"
              label="카테고리"
              options={categoryOptions}
              defaultValue="nursing"
            />
            <Select
              id="status"
              label="상태"
              options={statusOptions}
              defaultValue="PUBLISHED"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>변경사항 저장</Button>
        </CardFooter>
      </Card>

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
        </CardContent>
      </Card>
    </div>
  );
}
