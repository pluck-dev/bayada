import Link from "next/link";
import {
  Clock,
  Users,
  Star,
  PlayCircle,
  FileText,
  CheckCircle,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Award,
  BarChart3,
  Globe,
  BookOpen,
} from "lucide-react";
import { Button, Badge, Card, CardContent } from "@bayada/ui";
import { formatPrice, formatDuration } from "@bayada/shared";

// 플레이스홀더 강의 상세 데이터
const courseData = {
  slug: "home-care-basics",
  title: "재가 돌봄 서비스 기초 과정",
  description:
    "재가 돌봄 서비스의 기본 원칙과 실무 기술을 배우는 필수 교육 과정입니다. 이 과정을 통해 재가 돌봄의 핵심 원칙을 이해하고, 실제 현장에서 적용할 수 있는 실무 역량을 갖출 수 있습니다.",
  longDescription: `이 과정은 재가 돌봄 서비스에 필요한 기본적인 지식과 기술을 체계적으로 학습하는 교육 프로그램입니다.

재가 돌봄의 기본 원칙부터 시작하여 환자 평가, 기본 간호 기술, 의사소통 방법, 안전 관리까지 포괄적으로 다룹니다. 실제 사례 기반의 학습을 통해 현장 적용 능력을 극대화합니다.

본 과정을 수료하면 BAYADA 재가 돌봄 서비스 기초 자격을 취득할 수 있으며, 이는 실무 배치의 필수 요건입니다.`,
  thumbnail: null,
  price: 89000,
  originalPrice: 120000,
  category: "간호 교육",
  instructor: {
    name: "김영희 강사",
    title: "간호학 박사 / BAYADA 수석 강사",
    bio: "20년 이상의 임상 경험을 보유한 간호학 박사로, 재가 돌봄 분야의 전문가입니다.",
  },
  totalDuration: 18000,
  totalLectures: 24,
  studentCount: 1247,
  rating: 4.8,
  reviewCount: 312,
  level: "입문",
  updatedAt: "2024.12.15",
  sections: [
    {
      id: "s1",
      title: "1. 재가 돌봄 서비스 개요",
      lectures: [
        {
          id: "l1",
          title: "재가 돌봄이란?",
          type: "VIDEO" as const,
          duration: 900,
          isFree: true,
        },
        {
          id: "l2",
          title: "BAYADA 돌봄 철학과 원칙",
          type: "VIDEO" as const,
          duration: 720,
          isFree: true,
        },
        {
          id: "l3",
          title: "돌봄 서비스의 법적 기반",
          type: "VIDEO" as const,
          duration: 1080,
          isFree: false,
        },
      ],
    },
    {
      id: "s2",
      title: "2. 환자 평가와 계획 수립",
      lectures: [
        {
          id: "l4",
          title: "초기 환자 평가 방법",
          type: "VIDEO" as const,
          duration: 1200,
          isFree: false,
        },
        {
          id: "l5",
          title: "돌봄 계획 수립하기",
          type: "VIDEO" as const,
          duration: 900,
          isFree: false,
        },
        {
          id: "l6",
          title: "환자 평가 실습 자료",
          type: "TEXT" as const,
          duration: 600,
          isFree: false,
        },
      ],
    },
    {
      id: "s3",
      title: "3. 기본 간호 기술",
      lectures: [
        {
          id: "l7",
          title: "활력징후 측정",
          type: "VIDEO" as const,
          duration: 1500,
          isFree: false,
        },
        {
          id: "l8",
          title: "투약 관리 기초",
          type: "VIDEO" as const,
          duration: 1200,
          isFree: false,
        },
        {
          id: "l9",
          title: "상처 관리",
          type: "VIDEO" as const,
          duration: 1080,
          isFree: false,
        },
        {
          id: "l10",
          title: "기본 간호 기술 퀴즈",
          type: "TEXT" as const,
          duration: 300,
          isFree: false,
        },
      ],
    },
    {
      id: "s4",
      title: "4. 의사소통과 정서 지원",
      lectures: [
        {
          id: "l11",
          title: "환자와의 효과적인 의사소통",
          type: "VIDEO" as const,
          duration: 900,
          isFree: false,
        },
        {
          id: "l12",
          title: "보호자 상담 기법",
          type: "VIDEO" as const,
          duration: 720,
          isFree: false,
        },
        {
          id: "l13",
          title: "정서적 지원과 공감",
          type: "VIDEO" as const,
          duration: 840,
          isFree: false,
        },
      ],
    },
    {
      id: "s5",
      title: "5. 안전 관리 및 응급 대응",
      lectures: [
        {
          id: "l14",
          title: "낙상 예방과 환경 안전",
          type: "VIDEO" as const,
          duration: 1080,
          isFree: false,
        },
        {
          id: "l15",
          title: "응급 상황 대응 절차",
          type: "VIDEO" as const,
          duration: 1200,
          isFree: false,
        },
        {
          id: "l16",
          title: "감염 예방 및 관리",
          type: "VIDEO" as const,
          duration: 900,
          isFree: false,
        },
        {
          id: "l17",
          title: "최종 평가",
          type: "TEXT" as const,
          duration: 1800,
          isFree: false,
        },
      ],
    },
  ],
  learningPoints: [
    "재가 돌봄 서비스의 기본 원칙과 철학 이해",
    "환자 평가 및 돌봄 계획 수립 능력",
    "활력징후 측정, 투약 관리 등 기본 간호 기술",
    "환자 및 보호자와의 효과적인 의사소통 기법",
    "안전 관리 및 응급 상황 대응 능력",
    "BAYADA 재가 돌봄 서비스 기초 자격 취득",
  ],
  requirements: [
    "간호 관련 학과 졸업 또는 재학 중",
    "기본적인 의학 용어 이해",
    "PC 또는 모바일 기기 사용 가능",
  ],
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale } = await params;
  const totalLectures = courseData.sections.reduce(
    (sum, s) => sum + s.lectures.length,
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
              <Badge className="mb-3 bg-white/10 text-white">
                {courseData.category}
              </Badge>
              <h1 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
                {courseData.title}
              </h1>
              <p className="mb-6 text-base text-gray-300">
                {courseData.description}
              </p>

              {/* 메타 정보 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-white">
                    {courseData.rating}
                  </span>
                  <span>({courseData.reviewCount}개 리뷰)</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {courseData.studentCount.toLocaleString()}명 수강
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(courseData.totalDuration)}
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  {courseData.level}
                </span>
              </div>

              <div className="mt-4 text-sm text-gray-400">
                <span>{courseData.instructor.name}</span>
                <span className="mx-2">|</span>
                <span>마지막 업데이트: {courseData.updatedAt}</span>
              </div>
            </div>

            {/* 구매 카드 */}
            <div className="lg:col-span-1">
              <Card className="overflow-hidden">
                {/* 썸네일 */}
                <div className="aspect-video bg-[color:var(--surface-3)]">
                  <div className="flex h-full items-center justify-center text-[color:var(--muted)]">
                    <PlayCircle className="h-16 w-16" />
                  </div>
                </div>
                <CardContent className="space-y-4">
                  {/* 가격 */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[color:var(--fg)]">
                      {courseData.price === 0
                        ? "무료"
                        : formatPrice(courseData.price)}
                    </span>
                    {courseData.originalPrice > courseData.price && (
                      <span className="text-sm text-[color:var(--muted)] line-through">
                        {formatPrice(courseData.originalPrice)}
                      </span>
                    )}
                    {courseData.originalPrice > courseData.price && (
                      <Badge variant="error">
                        {Math.round(
                          (1 - courseData.price / courseData.originalPrice) * 100
                        )}
                        % 할인
                      </Badge>
                    )}
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
                        {formatDuration(courseData.totalDuration)})
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
            {/* 학습 내용 */}
            <div className="mb-10">
              <h2 className="mb-4 text-xl font-bold text-[color:var(--fg)]">
                이런 걸 배워요
              </h2>
              <Card>
                <CardContent>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {courseData.learningPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--success)]" />
                        <span className="text-sm text-[color:var(--fg)]">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* 수강 전 필요 사항 */}
            <div className="mb-10">
              <h2 className="mb-4 text-xl font-bold text-[color:var(--fg)]">
                수강 전 필요 사항
              </h2>
              <ul className="space-y-2">
                {courseData.requirements.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-[color:var(--muted)]"
                  >
                    <ChevronRight className="h-4 w-4" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* 상세 설명 */}
            <div className="mb-10">
              <h2 className="mb-4 text-xl font-bold text-[color:var(--fg)]">
                강의 소개
              </h2>
              <div className="whitespace-pre-line text-sm leading-relaxed text-[color:var(--muted)]">
                {courseData.longDescription}
              </div>
            </div>

            {/* 커리큘럼 */}
            <div className="mb-10">
              <h2 className="mb-4 text-xl font-bold text-[color:var(--fg)]">
                커리큘럼
              </h2>
              <p className="mb-4 text-sm text-[color:var(--muted)]">
                {courseData.sections.length}개 섹션 | {totalLectures}개 강의 |
                총 {formatDuration(courseData.totalDuration)}
              </p>
              <div className="space-y-3">
                {courseData.sections.map((section) => (
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
                              (sum, l) => sum + (l.duration ?? 0),
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

          {/* 사이드바 - 강사 정보 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardContent>
                  <h3 className="mb-4 text-lg font-semibold text-[color:var(--fg)]">
                    강사 소개
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand-bg)] text-[color:var(--brand)]">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium text-[color:var(--fg)]">
                        {courseData.instructor.name}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {courseData.instructor.title}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[color:var(--muted)]">
                    {courseData.instructor.bio}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
