import { courseService } from "@/lib/services";
import { formatDuration, formatPrice } from "@bayada/shared";
import { Badge, Button } from "@bayada/ui";
import {
    Award,
    Clock,
    FileText,
    Globe,
    PlayCircle,
    Users
} from "lucide-react";
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
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
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

            {/* Curriculum */}
            <div className="apple-card p-8 border border-gray-200/50">
               <div className="flex items-end justify-between mb-6">
                 <h2 className="text-2xl font-bold text-gray-900">커리큘럼</h2>
                 <span className="text-sm text-gray-500 font-medium">
                   {course.sections.length}개 섹션 · {totalLectures}개 강의 · {formatDuration(totalDuration)}
                 </span>
               </div>

               <div className="space-y-4">
                 {course.sections.map((section, idx) => (
                   <div key={section.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                      <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                         <h3 className="font-semibold text-gray-900 flex items-center gap-3">
                           <span className="text-gray-400 font-normal">Section {idx + 1}</span>
                           {section.title}
                         </h3>
                         <span className="text-xs text-gray-500">{section.lectures.length}개 강의</span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {section.lectures.map((lecture) => (
                          <div key={lecture.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/30 transition-colors group">
                             <div className="flex items-center gap-3">
                                {lecture.type === "VIDEO" ? (
                                  <PlayCircle className="h-4 w-4 text-gray-400 group-hover:text-[var(--brand-primary)] transition-colors" />
                                ) : (
                                  <FileText className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{lecture.title}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                {lecture.isFree && <span className="text-xs font-semibold text-[var(--brand-secondary)] bg-red-50 px-2 py-0.5 rounded-full">미리보기</span>}
                                <span className="text-xs text-gray-400">{formatDuration(lecture.duration ?? 0)}</span>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Description */}
             <div className="apple-card p-8 border border-gray-200/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">강의 소개</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{course.description}</p>
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

                   <div className="mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-900">
                           {course.price === 0 ? "무료" : formatPrice(course.price)}
                        </span>
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
