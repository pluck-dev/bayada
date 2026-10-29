import Link from "next/link";
import type { Metadata } from "next";
import { Award, BookOpen, CalendarDays, GraduationCap, Heart, MapPin } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { getMyEnrollments } from "@/lib/queries/learning";
import { getMySessions, getMyWishlist } from "@/lib/queries/engagement";
import { takeRenewalNotices } from "@/lib/queries/credentials";
import { RenewalBanner } from "@/components/credentials/RenewalBanner";
import { formatDate, formatSessionRange } from "@/lib/labels";
import { CourseCard } from "@/components/course/CourseCard";
import { CourseThumb } from "@/components/course/CourseThumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs } from "@/components/ui/Tabs";

export const metadata: Metadata = { title: "마이 러닝" };

type Row = Awaited<ReturnType<typeof getMyEnrollments>>[number];

function EnrollmentRow({ row, locale }: { row: Row; locale: string }) {
  const detail = `/${locale}/courses/${encodeURIComponent(row.course.slug)}`;
  const resume = row.resumeLectureId ? `${detail}/lectures/${row.resumeLectureId}` : detail;
  const done = !!row.completedAt;
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-lift sm:flex-row sm:items-center sm:gap-5">
      <Link href={detail} className="block aspect-[16/9] shrink-0 overflow-hidden rounded-xl bg-line-soft sm:w-44">
        <CourseThumb src={row.course.thumbnail} title={row.course.title} label={row.course.category} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={detail} className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink hover:text-brand">
          {row.course.title}
        </Link>
        <p className="mt-1 text-xs text-muted">
          {[row.course.provider, `${row.doneCount}/${row.lectureCount}강 완료`, done ? `${formatDate(row.completedAt!)} 수료` : `${formatDate(row.enrolledAt)} 신청`]
            .filter(Boolean)
            .join(" · ")}
          {row.course.archived && " · 운영 종료된 프로그램"}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-soft">
            <div
              className={`h-full rounded-full ${done ? "bg-success" : "bg-brand"}`}
              style={{ width: `${row.progressPercent}%` }}
            />
          </div>
          <span className="w-10 text-right text-xs font-bold text-ink">{row.progressPercent}%</span>
        </div>
      </div>
      <Link
        href={resume}
        className={`flex h-11 shrink-0 items-center justify-center rounded-xl px-5 text-sm font-semibold sm:w-28 ${
          done ? "border border-line text-ink hover:border-ink" : "bg-ink text-white hover:bg-ink-soft"
        }`}
      >
        {done ? "다시 보기" : row.progressPercent > 0 ? "이어보기" : "시작하기"}
      </Link>
    </li>
  );
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const viewer = (await getViewer())!;
  const [rows, wishlist, sessions, renewals] = await Promise.all([
    getMyEnrollments(viewer.id),
    getMyWishlist(viewer),
    getMySessions(viewer.id),
    // 바야다 인증 갱신 알림 — 처음 보여 줄 때 renewalNotifiedAt 기록
    takeRenewalNotices(viewer.id),
  ]);
  const now = new Date();
  const upcomingSessions = sessions.filter((s) => s.endsAt >= now);
  const pastSessions = sessions.filter((s) => s.endsAt < now).reverse();
  const active = rows.filter((r) => !r.completedAt);
  const completed = rows.filter((r) => r.completedAt);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink md:text-[28px]">마이 러닝</h1>
      {renewals.length > 0 && (
        <div className="mt-6">
          <RenewalBanner locale={locale} items={renewals} />
        </div>
      )}
      <dl className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "수강 중", value: active.length, icon: BookOpen },
          { label: "수료", value: completed.length, icon: GraduationCap },
          { label: "전체 신청", value: rows.length, icon: Award },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
            <dt className="flex items-center gap-1.5 text-xs text-muted">
              <s.icon className="h-3.5 w-3.5" aria-hidden /> {s.label}
            </dt>
            <dd className="mt-1 text-2xl font-bold tracking-tight text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <Tabs
          ariaLabel="수강 상태"
          items={[
            {
              key: "active",
              label: `수강 중 ${active.length}`,
              content: active.length ? (
                <ul className="space-y-3">
                  {active.map((r) => (
                    <EnrollmentRow key={r.id} row={r} locale={locale} />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={<BookOpen className="h-5 w-5" />}
                  title="수강 중인 프로그램이 없어요"
                  description="관심 있는 프로그램을 찾아 학습을 시작해 보세요."
                  action={{ label: "프로그램 둘러보기", href: `/${locale}/courses` }}
                />
              ),
            },
            {
              key: "completed",
              label: `완료 ${completed.length}`,
              content: completed.length ? (
                <ul className="space-y-3">
                  {completed.map((r) => (
                    <EnrollmentRow key={r.id} row={r} locale={locale} />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={<GraduationCap className="h-5 w-5" />}
                  title="아직 수료한 프로그램이 없어요"
                  description="모든 강의를 마치면 이곳에 표시되고 수료증이 발급돼요."
                />
              ),
            },
            {
              key: "wishlist",
              label: `찜 ${wishlist.length}`,
              content: wishlist.length ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {wishlist.map((c) => (
                    <CourseCard key={c.id} course={c} locale={locale} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Heart className="h-5 w-5" />}
                  title="찜한 프로그램이 없어요"
                  description="관심 있는 프로그램의 하트를 눌러 두면 이곳에서 모아 볼 수 있어요."
                  action={{ label: "프로그램 둘러보기", href: `/${locale}/courses` }}
                />
              ),
            },
            {
              key: "sessions",
              label: `실습 일정${upcomingSessions.length ? ` ${upcomingSessions.length}` : ""}`,
              content: sessions.length ? (
                <div className="space-y-8">
                  {[
                    { title: "다가오는 일정", items: upcomingSessions },
                    { title: "지난 일정", items: pastSessions },
                  ]
                    .filter((g) => g.items.length > 0)
                    .map((g) => (
                      <div key={g.title}>
                        <p className="mb-3 text-sm font-semibold text-ink-soft">{g.title}</p>
                        <ul className="space-y-3">
                          {g.items.map((s) => {
                            const past = s.endsAt < now;
                            return (
                              <li
                                key={s.id}
                                className={`flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:gap-6 ${
                                  past ? "opacity-70" : ""
                                }`}
                              >
                                <span className="flex h-12 min-w-12 shrink-0 items-center justify-center self-start rounded-xl bg-surface px-2.5 text-sm font-bold text-ink ring-1 ring-line sm:self-auto">
                                  {s.region}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[15px] font-semibold text-ink">{s.title}</p>
                                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                                    <span className="inline-flex items-center gap-1">
                                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                                      {formatSessionRange(s.startsAt, s.endsAt)}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                                      {s.location}
                                    </span>
                                  </p>
                                </div>
                                {s.course && (
                                  <Link
                                    href={`/${locale}/courses/${encodeURIComponent(s.course.slug)}#sessions`}
                                    className="shrink-0 text-sm font-semibold text-ink-soft hover:text-ink"
                                  >
                                    {past ? "프로그램 보기" : "일정 관리"} →
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                </div>
              ) : (
                <EmptyState
                  icon={<CalendarDays className="h-5 w-5" />}
                  title="신청한 실습 일정이 없어요"
                  description="실습이 있는 프로그램 상세 페이지의 ‘실습 일정’에서 지역과 날짜를 골라 신청할 수 있어요."
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
