"use client";

import { useState, useEffect } from "react";
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
  Badge,
  Button,
  ProgressBar,
  Skeleton,
} from "@bayada/ui";
import { formatDuration } from "@bayada/shared";
import { useDictionary } from "@/components/DictionaryProvider";
import { useParams } from "next/navigation";

interface EnrolledCourse {
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    category: { name: string } | null;
  };
  enrolledAt: string;
  totalLectures: number;
  completedLectures: number;
  progressPercent: number;
}

interface DashboardData {
  enrolledCourses: EnrolledCourse[];
  recentActivity: Array<{
    lecture: {
      title: string;
      section: { course: { title: string; slug: string } };
    };
    updatedAt: string;
    watchedSec: number;
  }>;
  stats: {
    totalEnrollments: number;
    inProgress: number;
    completed: number;
    totalWatchedSec: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const dict = useDictionary();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    fetch("/api/v1/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const stats = data?.stats ?? { totalEnrollments: 0, inProgress: 0, completed: 0, totalWatchedSec: 0 };
  const enrolledCourses = data?.enrolledCourses ?? [];
  const recentActivity = data?.recentActivity ?? [];

  const watchedHours = (stats.totalWatchedSec / 3600).toFixed(1);

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
                {stats.totalEnrollments}
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
                {stats.inProgress}
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
                {stats.completed}
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
                {watchedHours}h
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
            {enrolledCourses.map((item) => (
              <Card key={item.course.id}>
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-[color:var(--surface-3)] sm:w-40">
                      <div className="flex h-full items-center justify-center text-[color:var(--muted)]">
                        <PlayCircle className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="mb-1 flex items-center gap-2">
                        {item.course.category && (
                          <Badge variant="secondary">{item.course.category.name}</Badge>
                        )}
                        {item.progressPercent === 100 && (
                          <Badge variant="success">{dict.academy.completed}</Badge>
                        )}
                      </div>
                      <h3 className="mb-3 font-semibold text-[color:var(--fg)]">
                        {item.course.title}
                      </h3>
                      <div className="mb-3">
                        <ProgressBar
                          value={item.progressPercent}
                          label={`${item.completedLectures}/${item.totalLectures}강`}
                        />
                      </div>
                      {item.progressPercent < 100 && (
                        <div className="mt-auto">
                          <Link href={`/${locale}/courses/${item.course.slug}`}>
                            <Button size="sm">
                              <PlayCircle className="mr-1.5 h-4 w-4" />
                              {dict.academy.continueLearning}
                            </Button>
                          </Link>
                        </div>
                      )}
                      {item.progressPercent === 100 && (
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
            {enrolledCourses.length === 0 && (
              <p className="py-8 text-center text-[color:var(--muted)]">
                아직 수강 중인 강의가 없습니다
              </p>
            )}
          </div>

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
                {recentActivity.map((activity, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 border-b border-[color:var(--border)] pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)]">
                      <PlayCircle className="h-4 w-4 text-[color:var(--muted)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[color:var(--fg)]">
                        {activity.lecture.title}
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        {activity.lecture.section.course.title}
                      </p>
                      <div className="mt-1 text-xs text-[color:var(--muted)]">
                        {formatDuration(activity.watchedSec)}
                      </div>
                    </div>
                  </li>
                ))}
                {recentActivity.length === 0 && (
                  <li className="py-4 text-center text-sm text-[color:var(--muted)]">
                    최근 활동이 없습니다
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
