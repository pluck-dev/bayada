import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  FileText,
  CheckCircle,
  List,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { Button, Badge, Card, CardContent, ProgressBar } from "@bayada/ui";
import { formatDuration } from "@bayada/shared";

// 플레이스홀더 강의 데이터
const lectureData = {
  id: "l1",
  title: "재가 돌봄이란?",
  type: "VIDEO" as const,
  duration: 900,
  courseSlug: "home-care-basics",
  courseTitle: "재가 돌봄 서비스 기초 과정",
  sectionTitle: "1. 재가 돌봄 서비스 개요",
  prevLecture: null as { id: string; title: string } | null,
  nextLecture: {
    id: "l2",
    title: "BAYADA 돌봄 철학과 원칙",
  },
};

const curriculumSections = [
  {
    id: "s1",
    title: "1. 재가 돌봄 서비스 개요",
    lectures: [
      { id: "l1", title: "재가 돌봄이란?", duration: 900, completed: true, current: true },
      { id: "l2", title: "BAYADA 돌봄 철학과 원칙", duration: 720, completed: false, current: false },
      { id: "l3", title: "돌봄 서비스의 법적 기반", duration: 1080, completed: false, current: false },
    ],
  },
  {
    id: "s2",
    title: "2. 환자 평가와 계획 수립",
    lectures: [
      { id: "l4", title: "초기 환자 평가 방법", duration: 1200, completed: false, current: false },
      { id: "l5", title: "돌봄 계획 수립하기", duration: 900, completed: false, current: false },
      { id: "l6", title: "환자 평가 실습 자료", duration: 600, completed: false, current: false },
    ],
  },
  {
    id: "s3",
    title: "3. 기본 간호 기술",
    lectures: [
      { id: "l7", title: "활력징후 측정", duration: 1500, completed: false, current: false },
      { id: "l8", title: "투약 관리 기초", duration: 1200, completed: false, current: false },
      { id: "l9", title: "상처 관리", duration: 1080, completed: false, current: false },
      { id: "l10", title: "기본 간호 기술 퀴즈", duration: 300, completed: false, current: false },
    ],
  },
];

export default async function LecturePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; lectureId: string }>;
}) {
  const { locale } = await params;

  const totalLectures = curriculumSections.reduce(
    (sum, s) => sum + s.lectures.length,
    0
  );
  const completedCount = curriculumSections.reduce(
    (sum, s) => sum + s.lectures.filter((l) => l.completed).length,
    0
  );
  const progressPercent = Math.round((completedCount / totalLectures) * 100);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:flex-row">
      {/* 사이드바 - 커리큘럼 */}
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-r border-[color:var(--border)] bg-white lg:block">
        {/* 강의 정보 헤더 */}
        <div className="border-b border-[color:var(--border)] p-4">
          <Link
            href={`/${locale}/courses/${lectureData.courseSlug}`}
            className="mb-2 flex items-center gap-1 text-xs text-[color:var(--brand)] hover:underline"
          >
            <ChevronLeft className="h-3 w-3" />
            강의 페이지로
          </Link>
          <h2 className="text-sm font-semibold text-[color:var(--fg)]">
            {lectureData.courseTitle}
          </h2>
          <div className="mt-3">
            <ProgressBar value={progressPercent} label="전체 진도율" />
          </div>
        </div>

        {/* 커리큘럼 목록 */}
        <div className="p-2">
          {curriculumSections.map((section) => (
            <div key={section.id} className="mb-2">
              <div className="px-3 py-2 text-xs font-semibold text-[color:var(--muted)]">
                {section.title}
              </div>
              <ul>
                {section.lectures.map((lecture) => (
                  <li key={lecture.id}>
                    <Link
                      href={`/${locale}/courses/${lectureData.courseSlug}/lectures/${lecture.id}`}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        lecture.current
                          ? "bg-[color:var(--brand-bg)] text-[color:var(--brand)]"
                          : "text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
                      }`}
                    >
                      {lecture.completed ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-[color:var(--success)]" />
                      ) : (
                        <PlayCircle className="h-4 w-4 shrink-0 text-[color:var(--muted)]" />
                      )}
                      <span className="flex-1 truncate">{lecture.title}</span>
                      <span className="text-xs text-[color:var(--muted)]">
                        {formatDuration(lecture.duration)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* 비디오 플레이어 영역 */}
        <div className="relative aspect-video w-full bg-black">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <PlayCircle className="mb-4 h-20 w-20 opacity-80" />
            <p className="text-lg font-medium">비디오 플레이어</p>
            <p className="mt-1 text-sm text-gray-400">
              이 영역에 동영상이 재생됩니다
            </p>
          </div>
        </div>

        {/* 강의 정보 */}
        <div className="flex-1 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
            {/* 제목 및 네비게이션 */}
            <div className="mb-6">
              <p className="mb-1 text-xs text-[color:var(--muted)]">
                {lectureData.sectionTitle}
              </p>
              <h1 className="text-xl font-bold text-[color:var(--fg)]">
                {lectureData.title}
              </h1>
              <div className="mt-2 flex items-center gap-3 text-sm text-[color:var(--muted)]">
                <span className="flex items-center gap-1">
                  <PlayCircle className="h-4 w-4" />
                  {formatDuration(lectureData.duration)}
                </span>
              </div>
            </div>

            {/* 이전/다음 강의 네비게이션 */}
            <div className="flex items-center justify-between border-t border-[color:var(--border)] pt-4">
              {lectureData.prevLecture ? (
                <Link
                  href={`/${locale}/courses/${lectureData.courseSlug}/lectures/${lectureData.prevLecture.id}`}
                >
                  <Button variant="ghost" size="sm">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    이전 강의
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              <Button variant="brand" size="sm">
                <CheckCircle className="mr-1 h-4 w-4" />
                수강 완료
              </Button>

              {lectureData.nextLecture ? (
                <Link
                  href={`/${locale}/courses/${lectureData.courseSlug}/lectures/${lectureData.nextLecture.id}`}
                >
                  <Button variant="ghost" size="sm">
                    다음 강의
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* 탭 영역 (강의 노트, Q&A 등) */}
            <div className="mt-8 border-t border-[color:var(--border)] pt-6">
              <div className="mb-4 flex gap-4 border-b border-[color:var(--border)]">
                <button className="border-b-2 border-[color:var(--brand)] px-3 pb-3 text-sm font-medium text-[color:var(--brand)]">
                  <BookOpen className="mr-1.5 inline h-4 w-4" />
                  강의 노트
                </button>
                <button className="px-3 pb-3 text-sm font-medium text-[color:var(--muted)] hover:text-[color:var(--fg)]">
                  <MessageSquare className="mr-1.5 inline h-4 w-4" />
                  Q&A
                </button>
              </div>

              {/* 강의 노트 플레이스홀더 */}
              <div className="rounded-lg bg-[color:var(--surface)] p-6">
                <p className="text-sm text-[color:var(--muted)]">
                  이 강의에서는 재가 돌봄 서비스의 정의와 필요성에 대해
                  알아봅니다.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--brand)]" />
                    재가 돌봄 서비스란 환자가 자신의 집에서 전문적인 돌봄을 받을
                    수 있도록 하는 서비스입니다.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--brand)]" />
                    고령화 사회에서 재가 돌봄의 중요성이 지속적으로 증가하고
                    있습니다.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--brand)]" />
                    BAYADA는 환자 중심의 돌봄 철학을 바탕으로 최고 수준의
                    재가 돌봄을 제공합니다.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
