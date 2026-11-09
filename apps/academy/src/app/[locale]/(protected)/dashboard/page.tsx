import { EmptyState, PageHeader, ProgressBar, StatCard, Tabs, buttonVariants, cn } from "@bayada/ui";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, CalendarDays, GraduationCap, Heart, MapPin } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { getMyEnrollments } from "@/lib/queries/learning";
import { getMySessions, getMyWishlist } from "@/lib/queries/engagement";
import { takeRenewalNotices } from "@/lib/queries/credentials";
import { EmailVerifyBanner } from "@/components/account/EmailVerifyBanner";
import { RenewalBanner } from "@/components/credentials/RenewalBanner";
import { formatDate, formatSessionRange } from "@/lib/labels";
import { CourseCard } from "@/components/course/CourseCard";
import { CourseMedia } from "@/components/course/CourseMedia";
import { PassCard } from "@/components/dashboard/PassCard";

export const metadata: Metadata = { title: "마이 러닝" };

type Row = Awaited<ReturnType<typeof getMyEnrollments>>[number];

function EnrollmentRow({ row, locale }: { row: Row; locale: string }) {
  const detail = `/${locale}/courses/${encodeURIComponent(row.course.slug)}`;
  const resume = row.resumeLectureId ? `${detail}/lectures/${row.resumeLectureId}` : detail;
  const done = !!row.completedAt;
  return (
    <li className="flex gap-4 rounded-[22px] border border-line-soft bg-canvas p-3 transition-colors hover:border-line sm:items-center sm:gap-5 sm:p-4">
      <Link href={detail} tabIndex={-1} aria-hidden className="block aspect-video w-28 shrink-0 self-start overflow-hidden rounded-2xl bg-surface-sunken sm:w-44 sm:self-auto">
        <CourseMedia course={row.course} size="thumb" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={detail} className="line-clamp-2 text-body font-bold text-ink underline-offset-4 hover:underline sm:text-title">
          {row.course.title}
        </Link>
        <p className="mt-1 text-caption text-muted">
          {[row.course.provider, `${row.doneCount}/${row.lectureCount}강 완료`, done ? `${formatDate(row.completedAt!)} 수료` : `${formatDate(row.enrolledAt)} 신청`]
            .filter(Boolean)
            .join(" · ")}
          {row.course.archived && " · 운영 종료된 프로그램"}
        </p>
        <ProgressBar value={row.progressPercent} showValue size="sm" className="mt-3" />
        <Link href={resume} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-3 sm:hidden")}>
          {done ? "다시 보기" : row.progressPercent > 0 ? "이어보기" : "시작하기"}
        </Link>
      </div>
      <Link href={resume} className={cn(buttonVariants({ variant: done ? "secondary" : "outline" }), "hidden sm:inline-flex sm:w-28")}>
        {done ? "다시 보기" : row.progressPercent > 0 ? "이어보기" : "시작하기"}
      </Link>
    </li>
  );
}

/** 이어서 학습하기 — 가장 먼저 눈에 띄는 큰 카드 (주요 행동 1개) */
function ResumeCard({ row, locale }: { row: Row; locale: string }) {
  const detail = `/${locale}/courses/${encodeURIComponent(row.course.slug)}`;
  const resume = row.resumeLectureId ? `${detail}/lectures/${row.resumeLectureId}` : detail;
  return (
    <section aria-label="이어서 학습하기" className="grid overflow-hidden rounded-[28px] bg-ink text-white md:grid-cols-[minmax(0,340px)_1fr]">
      <Link href={detail} tabIndex={-1} aria-hidden className="block aspect-video md:aspect-auto md:h-full">
        <CourseMedia course={row.course} />
      </Link>
      <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
        <div>
          <p className="text-caption font-bold text-brand-300">{row.progressPercent > 0 ? "이어서 학습하기" : "학습을 시작해 보세요"}</p>
          <p className="mt-1.5 line-clamp-2 text-[20px] font-extrabold leading-snug tracking-tight md:text-[22px]">{row.course.title}</p>
          <p className="mt-1.5 text-caption text-white/60">
            {row.doneCount}/{row.lectureCount}강 완료 · {formatDate(row.enrolledAt)} 신청
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15" aria-hidden>
            <div className="h-full rounded-full bg-brand" style={{ width: `${row.progressPercent}%` }} />
          </div>
          <span className="tabular text-body-sm font-bold">{row.progressPercent}%</span>
        </div>
        <Link href={resume} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "self-start")}>
          {row.progressPercent > 0 ? "이어보기" : "학습 시작하기"} <ArrowRight aria-hidden />
        </Link>
      </div>
    </section>
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
  // 이어서 학습: 진도가 있는 수강 중 프로그램 중 최근 신청, 없으면 최근 신청한 수강 중 프로그램
  const resumeRow = active.find((r) => r.progressPercent > 0 && !r.course.archived) ?? active.find((r) => !r.course.archived) ?? null;
  const completed = rows.filter((r) => r.completedAt);

  return (
    <div>
      <PageHeader title="마이 러닝" description="이어서 듣고, 수료하고, 인증서를 모아 보세요." className="mb-6 md:mb-8" />
      <div className="mb-6 empty:hidden">
        <EmailVerifyBanner userId={viewer.id} locale={locale} />
      </div>
      {renewals.length > 0 && (
        <div className="mb-6">
          <RenewalBanner locale={locale} items={renewals} />
        </div>
      )}
      {resumeRow && <ResumeCard row={resumeRow} locale={locale} />}
      <div className="mt-4 grid grid-cols-3 gap-2.5 md:gap-3">
        <StatCard label="수강 중" value={active.length} />
        <StatCard label="수료" value={completed.length} />
        <StatCard label="전체 신청" value={rows.length} />
      </div>
      <PassCard userId={viewer.id} locale={locale} />

      <div className="mt-10">
        <Tabs
          ariaLabel="수강 상태"
          defaultValue={active.length === 0 && completed.length > 0 ? "completed" : "active"}
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
                  icon={<BookOpen />}
                  title="수강 중인 프로그램이 없어요"
                  description="관심 있는 프로그램을 찾아 학습을 시작해 보세요."
                  action={
<Link href={`/${locale}/courses`} className={buttonVariants({ variant: "secondary" })}>
프로그램 둘러보기
</Link>
}
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
                  icon={<GraduationCap />}
                  title="아직 수료한 프로그램이 없어요"
                  description="모든 강의를 마치면 이곳에 표시되고 수료증이 발급돼요."
                />
              ),
            },
            {
              key: "wishlist",
              label: `찜 ${wishlist.length}`,
              content: wishlist.length ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {wishlist.map((c) => (
                    <CourseCard key={c.id} course={c} locale={locale} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Heart />}
                  title="찜한 프로그램이 없어요"
                  description="관심 있는 프로그램의 하트를 눌러 두면 이곳에서 모아 볼 수 있어요."
                  action={
<Link href={`/${locale}/courses`} className={buttonVariants({ variant: "secondary" })}>
프로그램 둘러보기
</Link>
}
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
                        <p className="mb-3 text-body-sm font-semibold text-ink-soft">{g.title}</p>
                        <ul className="space-y-3">
                          {g.items.map((s) => {
                            const past = s.endsAt < now;
                            return (
                              <li
                                key={s.id}
                                className={cn(
                                  "flex flex-col gap-3 rounded-xl border border-line bg-canvas p-5 sm:flex-row sm:items-center sm:gap-6",
                                  past && "opacity-70",
                                )}
                              >
                                <span className="flex h-12 min-w-12 shrink-0 items-center justify-center self-start rounded-lg bg-surface-sunken px-2.5 text-body-sm font-bold text-ink sm:self-auto">
                                  {s.region}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-body font-semibold text-ink">{s.title}</p>
                                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted">
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
                                    className="shrink-0 text-body-sm font-semibold text-ink-soft hover:text-ink"
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
                  icon={<CalendarDays />}
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
