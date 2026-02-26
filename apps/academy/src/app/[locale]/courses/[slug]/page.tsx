import { courseService } from "@/lib/services";
import { CurriculumAccordion } from "@/components/CurriculumAccordion";
import { formatDuration, formatPrice } from "@bayada/shared";
import { Badge, Button } from "@bayada/ui";
import {
    Award,
    Clock,
    FileText,
    Globe,
    MessageSquare,
    PlayCircle,
    TrendingUp,
    Users
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const course = await courseService.getBySlug(slug);
    const description =
      course.description ?? `${course.title} - BAYADA Academy에서 수강하세요`;
    const totalLectures = course.sections.reduce(
      (sum: number, s: { lectures: unknown[] }) => sum + s.lectures.length,
      0,
    );

    return {
      title: course.title,
      description,
      openGraph: {
        title: course.title,
        description,
        type: "article",
        ...(course.thumbnail
          ? {
              images: [
                {
                  url: course.thumbnail,
                  width: 1200,
                  height: 630,
                  alt: course.title,
                },
              ],
            }
          : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: course.title,
        description,
        ...(course.thumbnail ? { images: [course.thumbnail] } : {}),
      },
      other: {
        "course:lectures": String(totalLectures),
        "course:students": String(course._count.enrollments),
        "course:price": course.price === 0 ? "무료" : formatPrice(course.price),
      },
    };
  } catch {
    return {};
  }
}

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
    <div className="bg-[#f5f5f7] min-h-screen pb-20">
      {/* Immersive Header Background */}
      <div className="relative h-[500px] w-full bg-slate-900 overflow-hidden">
        {course.thumbnail ? (
           <div className="absolute inset-0">
             <img src={course.thumbnail} alt="" className="w-full h-full object-cover opacity-40 blur-3xl scale-110" />
             <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-[#f5f5f7]" />
           </div>
        ) : (
           <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-32">
          <div className="max-w-3xl">
              {course.category && (
                <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-md">
                  {course.category.name}
                </Badge>
              )}
              <h1 className="typo-display text-white mb-6 leading-tight">
                {course.title}
              </h1>
              <p className="text-lg text-gray-200 leading-relaxed mb-8 max-w-2xl">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-white/80">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>수강생 {course._count.enrollments.toLocaleString()}명</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{totalLectures}개 강의 · {formatDuration(totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                   <Globe className="h-5 w-5" />
                   <span>한국어</span>
                </div>
              </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Curriculum — 아코디언 토글 */}
            <div className="apple-card p-8 border border-gray-200/50">
               <div className="flex items-end justify-between mb-6">
                 <h2 className="text-2xl font-bold text-gray-900">커리큘럼</h2>
                 <span className="text-sm text-gray-500 font-medium">
                   {course.sections.length}개 섹션 · {totalLectures}개 강의 · {formatDuration(totalDuration)}
                 </span>
               </div>

               <CurriculumAccordion sections={course.sections} />
            </div>

            {/* Description */}
             <div className="apple-card p-8 border border-gray-200/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">강의 소개</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{course.description}</p>
                </div>
             </div>

            {/* 리뷰 섹션 placeholder */}
            <div className="apple-card p-8 border border-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">수강 후기</h2>
                <span className="text-sm text-gray-500">곧 제공됩니다</span>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <MessageSquare className="h-7 w-7 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">
                  아직 등록된 수강 후기가 없습니다.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  이 강의를 수강한 후 첫번째 후기를 남겨주세요!
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar (Purchase Card) */}
          <div className="lg:col-span-1">
             <div className="sticky top-24 space-y-6">
                <div className="glass-card p-6 rounded-[24px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white/50 backdrop-blur-xl bg-white/80">
                   <div className="relative aspect-video rounded-xl overflow-hidden mb-6 bg-gray-100 shadow-inner group cursor-pointer">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <PlayCircle className="h-12 w-12 text-gray-400" />
                        </div>
                      )}

                      {/* Play Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                            <PlayCircle className="h-8 w-8 text-white fill-white/20" />
                         </div>
                      </div>
                   </div>

                   {/* 인기 배지 + 수강생 수 */}
                   {course._count.enrollments > 0 && (
                     <div className="mb-4 flex items-center gap-2">
                       <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                         <TrendingUp className="h-3.5 w-3.5" />
                         인기 강의
                       </span>
                       <span className="text-xs text-gray-500">
                         {course._count.enrollments.toLocaleString()}명 수강중
                       </span>
                     </div>
                   )}

                   <div className="mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        {course.price === 0 ? (
                          <span className="inline-flex items-center rounded-full bg-[var(--color-success-light)] px-4 py-1 text-lg font-bold text-[var(--color-success)]">
                            무료
                          </span>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900">
                            {formatPrice(course.price)}
                          </span>
                        )}
                      </div>
                   </div>

                   <div className="space-y-3 mb-6">
                      <Button size="lg" className="w-full rounded-xl bg-gray-900 hover:bg-black text-white h-12 font-semibold shadow-lg shadow-gray-900/10">
                         {course.price === 0 ? "수강 신청" : "장바구니 담기"}
                      </Button>
                      <Button variant="brand" size="lg" className="w-full rounded-xl h-12 font-semibold">
                         바로 구매
                      </Button>
                   </div>

                   <p className="text-center text-xs text-gray-500 mb-6">30일 환불 보장</p>

                   <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-900">이 강의에 포함된 내용:</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                         <li className="flex gap-3 items-center">
                            <PlayCircle className="h-4 w-4" />
                            <span>{formatDuration(totalDuration)} 동영상 강의</span>
                         </li>
                         <li className="flex gap-3 items-center">
                            <FileText className="h-4 w-4" />
                            <span>학습 자료 다운로드</span>
                         </li>
                         <li className="flex gap-3 items-center">
                            <Globe className="h-4 w-4" />
                            <span>평생 무제한 수강</span>
                         </li>
                         <li className="flex gap-3 items-center">
                            <Award className="h-4 w-4" />
                            <span>수료증 발급</span>
                         </li>
                      </ul>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
