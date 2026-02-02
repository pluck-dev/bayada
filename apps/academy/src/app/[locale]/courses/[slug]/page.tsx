import Link from "next/link";
import {
  Clock,
  Users,
  PlayCircle,
  FileText,
  CheckCircle,
  ShoppingCart,
  ChevronRight,
  Award,
  Globe,
  BookOpen,
} from "lucide-react";
import { Button, Badge, Card, CardContent } from "@bayada/ui";
import { formatPrice, formatDuration } from "@bayada/shared";
import { courseService } from "@/lib/services";
import { notFound } from "next/navigation";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  let course: Awaited<ReturnType<typeof courseService.getBySlug>>;
  try {
    course = await courseService.getBySlug(slug);
  } catch {
    notFound();
  }

  const totalLectures = course.sections.reduce(
    (sum: number, s: { lectures: unknown[] }) => sum + s.lectures.length,
    0
  );
  const totalDuration = course.sections.reduce(
    (sum: number, s: { lectures: Array<{ duration: number | null }> }) =>
      sum + s.lectures.reduce((ls: number, l: { duration: number | null }) => ls + (l.duration ?? 0), 0),
    0
  );

  return (
    <div>
      {/* 강의 헤더 */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* 강의 정보 */}
            <div className="lg:col-span-2">
              {course.category && (
                <Badge className="mb-3 bg-white/10 text-white">
                  {course.category.name}
                </Badge>
              )}
              <h1 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
                {course.title}
              </h1>
              <p className="mb-6 text-base text-gray-300">
                {course.description}
              </p>

              {/* 메타 정보 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course._count.enrollments.toLocaleString()}명 수강
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(totalDuration)}
                </span>
              </div>
            </div>

            {/* 구매 카드 */}
            <div className="lg:col-span-1">
              <Card className="overflow-hidden">
                {/* 썸네일 */}
                <div className="aspect-video bg-[color:var(--surface-3)]">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[color:var(--muted)]">
                      <PlayCircle className="h-16 w-16" />
                    </div>
                  )}
                </div>
                <CardContent className="space-y-4">
                  {/* 가격 */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[color:var(--fg)]">
                      {course.price === 0
                        ? "무료"
                        : formatPrice(course.price)}
                    </span>
                  </div>

                  {/* 버튼 */}
                  <div className="space-y-2">
                    <Button className="w-full" size="lg">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      장바구니 담기
                    </Button>
                    <Button variant="outline" className="w-full" size="lg">
                      바로 수강하기
                    </Button>
                  </div>

                  {/* 강의 포함 내용 */}
                  <div className="space-y-2 border-t border-[color:var(--border)] pt-4 text-sm text-[color:var(--muted)]">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      <span>
                        동영상 {totalLectures}개 (총{" "}
                        {formatDuration(totalDuration)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>학습 자료 포함</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>무제한 수강 기간</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>수료증 발급</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 강의 상세 내용 */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* 상세 설명 */}
            {course.description && (
              <div className="mb-10">
                <h2 className="mb-4 text-xl font-bold text-[color:var(--fg)]">
                  강의 소개
                </h2>
                <div className="whitespace-pre-line text-sm leading-relaxed text-[color:var(--muted)]">
                  {course.description}
                </div>
              </div>
            )}

            {/* 커리큘럼 */}
            <div className="mb-10">
              <h2 className="mb-4 text-xl font-bold text-[color:var(--fg)]">
                커리큘럼
              </h2>
              <p className="mb-4 text-sm text-[color:var(--muted)]">
                {course.sections.length}개 섹션 | {totalLectures}개 강의 |
                총 {formatDuration(totalDuration)}
              </p>
              <div className="space-y-3">
                {course.sections.map((section) => (
                  <Card key={section.id}>
                    <div className="p-4">
                      {/* 섹션 헤더 */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[color:var(--fg)]">
                          {section.title}
                        </h3>
                        <span className="text-xs text-[color:var(--muted)]">
                          {section.lectures.length}강 |{" "}
                          {formatDuration(
                            section.lectures.reduce(
                              (sum: number, l: { duration: number | null }) => sum + (l.duration ?? 0),
                              0
                            )
                          )}
                        </span>
                      </div>

                      {/* 강의 목록 */}
                      <ul className="mt-3 space-y-1">
                        {section.lectures.map((lecture) => (
                          <li
                            key={lecture.id}
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[color:var(--surface)]"
                          >
                            <div className="flex items-center gap-2">
                              {lecture.type === "VIDEO" ? (
                                <PlayCircle className="h-4 w-4 text-[color:var(--muted)]" />
                              ) : (
                                <FileText className="h-4 w-4 text-[color:var(--muted)]" />
                              )}
                              <span className="text-[color:var(--fg)]">
                                {lecture.title}
                              </span>
                              {lecture.isFree && (
                                <Badge variant="success">무료</Badge>
                              )}
                            </div>
                            <span className="text-xs text-[color:var(--muted)]">
                              {formatDuration(lecture.duration ?? 0)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardContent>
                  <h3 className="mb-4 text-lg font-semibold text-[color:var(--fg)]">
                    강의 정보
                  </h3>
                  <div className="space-y-3 text-sm text-[color:var(--muted)]">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{totalLectures}개 레슨</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>총 {formatDuration(totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{course._count.enrollments}명 수강 중</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
