"use client";

import Link from "next/link";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  PlayCircle,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  ProgressBar,
} from "@bayada/ui";
import { formatDuration, formatPrice } from "@bayada/shared";
import { useDictionary } from "@/components/DictionaryProvider";
import { useParams } from "next/navigation";

// 플레이스홀더 데이터 - 수강 중인 강의
const enrolledCourses = [
  {
    slug: "home-care-basics",
    title: "재가 돌봄 서비스 기초 과정",
    thumbnail: null,
    category: "간호 교육",
    instructor: "김영희 강사",
    totalLectures: 24,
    completedLectures: 8,
    progressPercent: 33,
    lastLectureId: "l9",
    lastLectureName: "상처 관리",
    totalDuration: 18000,
  },
  {
    slug: "infection-control",
    title: "감염 관리 및 예방 교육",
    thumbnail: null,
    category: "법정 필수 교육",
    instructor: "이정은 강사",
    totalLectures: 16,
    completedLectures: 16,
    progressPercent: 100,
    lastLectureId: "l16",
    lastLectureName: "최종 평가",
    totalDuration: 10800,
  },
  {
    slug: "patient-safety-essentials",
    title: "환자 안전 관리 필수 과정",
    thumbnail: null,
    category: "안전 교육",
    instructor: "박민수 강사",
    totalLectures: 20,
    completedLectures: 3,
    progressPercent: 15,
    lastLectureId: "l3",
    lastLectureName: "안전사고 유형 분류",
    totalDuration: 14400,
  },
];

// 최근 학습 활동
const recentActivities = [
  {
    courseName: "재가 돌봄 서비스 기초 과정",
    lectureName: "상처 관리",
    date: "2024.12.28",
    duration: "25분",
  },
  {
    courseName: "환자 안전 관리 필수 과정",
    lectureName: "안전사고 유형 분류",
    date: "2024.12.27",
    duration: "18분",
  },
  {
    courseName: "재가 돌봄 서비스 기초 과정",
    lectureName: "투약 관리 기초",
    date: "2024.12.26",
    duration: "32분",
  },
  {
    courseName: "감염 관리 및 예방 교육",
    lectureName: "최종 평가",
    date: "2024.12.25",
    duration: "45분",
  },
];

export default function DashboardPage() {
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();

  const inProgressCount = enrolledCourses.filter(
    (c) => c.progressPercent > 0 && c.progressPercent < 100
  ).length;
  const completedCount = enrolledCourses.filter(
    (c) => c.progressPercent === 100
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[color:var(--fg)] sm:text-3xl">
          {dict.common.myCourses}
        </h1>
        <p className="mt-2 text-[color:var(--muted)]">
          학습 현황을 확인하고 이어서 수강하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--brand-bg)]">
              <BookOpen className="h-5 w-5 text-[color:var(--brand)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[color:var(--fg)]">
                {enrolledCourses.length}
              </p>
              <p className="text-xs text-[color:var(--muted)]">전체 수강</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--info-bg)]">
              <TrendingUp className="h-5 w-5 text-[color:var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[color:var(--fg)]">
                {inProgressCount}
              </p>
              <p className="text-xs text-[color:var(--muted)]">{dict.academy.inProgressCourses}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--success-bg)]">
              <Award className="h-5 w-5 text-[color:var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[color:var(--fg)]">
                {completedCount}
              </p>
              <p className="text-xs text-[color:var(--muted)]">{dict.academy.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--warning-bg)]">
              <Clock className="h-5 w-5 text-[color:var(--warning)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[color:var(--fg)]">
                12.5h
              </p>
              <p className="text-xs text-[color:var(--muted)]">{dict.academy.duration}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* 수강 중인 강의 */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-[color:var(--fg)]">
            {dict.academy.inProgressCourses}
          </h2>
          <div className="space-y-4">
            {enrolledCourses.map((course) => (
              <Card key={course.slug}>
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* 썸네일 */}
                    <div className="aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-[color:var(--surface-3)] sm:w-40">
                      <div className="flex h-full items-center justify-center text-[color:var(--muted)]">
                        <PlayCircle className="h-8 w-8" />
                      </div>
                    </div>

                    {/* 정보 */}
                    <div className="flex flex-1 flex-col">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant="secondary">{course.category}</Badge>
                        {course.progressPercent === 100 && (
                          <Badge variant="success">{dict.academy.completed}</Badge>
                        )}
                      </div>
                      <h3 className="mb-1 font-semibold text-[color:var(--fg)]">
                        {course.title}
                      </h3>
                      <p className="mb-3 text-xs text-[color:var(--muted)]">
                        {course.instructor}
                      </p>

                      {/* 진도율 */}
                      <div className="mb-3">
                        <ProgressBar
                          value={course.progressPercent}
                          label={`${course.completedLectures}/${course.totalLectures}강`}
                        />
                      </div>

                      {/* 이어 듣기 */}
                      {course.progressPercent < 100 && (
                        <div className="mt-auto">
                          <Link
                            href={`/${locale}/courses/${course.slug}/lectures/${course.lastLectureId}`}
                          >
                            <Button size="sm">
                              <PlayCircle className="mr-1.5 h-4 w-4" />
                              {dict.academy.continueLearning}: {course.lastLectureName}
                            </Button>
                          </Link>
                        </div>
                      )}
                      {course.progressPercent === 100 && (
                        <div className="mt-auto">
                          <Button variant="outline" size="sm">
                            <Award className="mr-1.5 h-4 w-4" />
                            수료증 확인
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 더 많은 강의 수강 안내 */}
          <div className="mt-6 text-center">
            <Link href={`/${locale}/courses`}>
              <Button variant="outline">
                {dict.common.courses}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 사이드바 - 최근 활동 */}
        <div className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-bold text-[color:var(--fg)]">
            최근 학습 활동
          </h2>
          <Card>
            <CardContent>
              <ul className="space-y-4">
                {recentActivities.map((activity, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 border-b border-[color:var(--border)] pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)]">
                      <PlayCircle className="h-4 w-4 text-[color:var(--muted)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[color:var(--fg)]">
                        {activity.lectureName}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {activity.courseName}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[color:var(--muted)]">
                        <span>{activity.date}</span>
                        <span>|</span>
                        <span>{activity.duration}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
