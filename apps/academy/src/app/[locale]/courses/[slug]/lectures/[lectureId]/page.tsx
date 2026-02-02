import { courseService, lectureService } from "@/lib/services";
import { auth } from "@/lib/auth";
import { prisma } from "@bayada/db";
import { Badge } from "@bayada/ui";
import { BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LectureSidebar } from "@/components/LectureSidebar";
import { LectureActions } from "@/components/LectureActions";

export default async function LecturePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; lectureId: string }>;
}) {
  const { locale, slug, lectureId } = await params;

  // 강의(레슨) 조회
  let lecture: Awaited<ReturnType<typeof lectureService.getById>>;
  try {
    lecture = await lectureService.getById(lectureId);
  } catch {
    notFound();
  }

  // 코스 전체 데이터 (사이드바 커리큘럼용)
  let course: Awaited<ReturnType<typeof courseService.getBySlug>>;
  try {
    course = await courseService.getBySlug(slug);
  } catch {
    notFound();
  }

  // 전체 레슨 목록을 flat하게 만들어 이전/다음 탐색
  const allLectures = course.sections.flatMap((s) =>
    s.lectures.map((l) => ({
      id: l.id,
      title: l.title,
      sectionId: s.id,
    }))
  );
  const currentIndex = allLectures.findIndex((l) => l.id === lectureId);
  const prevLecture = currentIndex > 0 ? allLectures[currentIndex - 1] : null;
  const nextLecture =
    currentIndex < allLectures.length - 1
      ? allLectures[currentIndex + 1]
      : null;

  // 현재 레슨이 속한 섹션
  const currentSection = course.sections.find((s) =>
    s.lectures.some((l) => l.id === lectureId)
  );

  // 로그인 사용자의 진행도 조회
  const session = await auth();
  let completedLectureIds = new Set<string>();
  let isCurrentCompleted = false;

  if (session?.user) {
    const userId = (session.user as { id: string }).id;
    const allLectureIds = allLectures.map((l) => l.id);
    const progresses = await prisma.progress.findMany({
      where: {
        userId,
        lectureId: { in: allLectureIds },
        completed: true,
      },
      select: { lectureId: true },
    });
    completedLectureIds = new Set(progresses.map((p) => p.lectureId));
    isCurrentCompleted = completedLectureIds.has(lectureId);
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:flex-row bg-[#f5f5f7]">
      {/* Sidebar - 커리큘럼 */}
      <LectureSidebar
        locale={locale}
        slug={slug}
        courseTitle={course.title}
        currentLectureId={lectureId}
        sections={course.sections.map((s) => ({
          id: s.id,
          title: s.title,
          lectures: s.lectures.map((l) => ({
            id: l.id,
            title: l.title,
            type: l.type,
            duration: l.duration,
          })),
        }))}
        completedLectureIds={completedLectureIds}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-y-auto w-full">
        {/* 영상 플레이어 */}
        <VideoPlayer
          videoUrl={lecture.videoUrl}
          title={lecture.title}
        />

        {/* 강의 정보 */}
        <div className="flex-1 bg-white relative">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 relative z-10">
            <div className="mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-500 hover:bg-gray-200">
                  {lecture.type === "VIDEO" ? "영상 강의" : "텍스트 강의"}
                </Badge>
                {currentSection && (
                  <span className="text-xs font-medium text-gray-400">{currentSection.title}</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {lecture.title}
              </h1>

              {/* 완료 버튼 + 네비게이션 */}
              <LectureActions
                locale={locale}
                slug={slug}
                lectureId={lectureId}
                isCompleted={isCurrentCompleted}
                prevLecture={prevLecture}
                nextLecture={nextLecture}
              />
            </div>

            {/* 탭 & 내용 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex gap-6 border-b border-gray-200 mb-6">
                  <button className="border-b-2 border-black px-1 pb-4 text-sm font-bold text-black">
                    설명
                  </button>
                  <button className="px-1 pb-4 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    강의 노트
                  </button>
                </div>

                <div className="prose prose-sm max-w-none text-gray-600">
                  <p>{course.description || "강의 설명이 준비 중입니다."}</p>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-[#f5f5f7] rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> 학습 자료
                  </h3>
                  <p className="text-sm text-gray-500">아직 등록된 학습 자료가 없습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
