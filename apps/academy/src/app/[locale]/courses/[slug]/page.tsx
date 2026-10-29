import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  HelpCircle,
  Lock,
  MonitorPlay,
  PlayCircle,
  ShieldCheck,
  Star,
} from "lucide-react";
import { prisma } from "@bayada/db";
import type { LectureType } from "@bayada/db";
import { getViewer } from "@/lib/viewer";
import { getCourseForDetail, resolveCourseAccess, visibleCourseWhere } from "@/lib/queries/courses";
import { getResumeLectureId } from "@/lib/queries/learning";
import { programsRequiringCourse } from "@/lib/queries/credentials";
import { getActivePlans, getMyPass } from "@/lib/queries/pass";
import { canWriteReview, getCourseReviews, getCourseSessions, REVIEW_MIN_PROGRESS } from "@/lib/queries/engagement";
import {
  JOB_ROLE_LABEL,
  LEARNING_MODE_LABEL,
  LEVEL_LABEL,
  PRODUCT_TYPE_LABEL,
  formatMinutes,
  formatPrice,
  formatSeconds,
  formatSessionRange,
} from "@/lib/labels";
import { decodeParam } from "@/lib/params";
import { CourseThumb } from "@/components/course/CourseThumb";
import { EnrollButton } from "@/components/course/EnrollButton";
import { BuyButton } from "@/components/course/BuyButton";
import { WishlistButton } from "@/components/course/WishlistButton";
import { SessionButton } from "@/components/course/SessionButton";
import { ReviewCard, Stars } from "@/components/course/ReviewCard";
import { ReviewForm } from "@/components/course/ReviewForm";
import { ReportReviewButton } from "@/components/course/ReportReviewButton";
import { Faq } from "@/components/ui/Faq";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const viewer = await getViewer();
  const course = await prisma.course.findFirst({
    where: { slug: decodeParam(slug), ...visibleCourseWhere(viewer) },
    select: { title: true, summary: true, thumbnail: true, visibility: true },
  });
  if (!course) return { title: "프로그램" };
  return {
    title: course.title,
    description: course.summary ?? undefined,
    // 사내 전용 강의는 검색엔진에 노출하지 않는다
    robots: course.visibility === "INTERNAL" ? { index: false, follow: false } : undefined,
    openGraph: course.thumbnail ? { images: [course.thumbnail] } : undefined,
  };
}

const LECTURE_ICON: Record<LectureType, typeof PlayCircle> = {
  VIDEO: PlayCircle,
  TEXT: FileText,
  QUIZ: HelpCircle,
};

const DETAIL_FAQ = [
  {
    q: "수강 기간은 얼마나 되나요?",
    a: "수강 신청한 프로그램은 별도 기간 제한 없이 마이 러닝에서 언제든 이어서 들을 수 있어요.",
  },
  {
    q: "수료 기준은 무엇인가요?",
    a: "커리큘럼의 모든 영상·읽기 강의를 완료하고, 퀴즈가 있다면 합격 점수 이상으로 통과해야 해요. 진도율이 100%가 되면 수료증이 자동 발급됩니다.",
  },
  {
    q: "수료증은 어디에 제출할 수 있나요?",
    a: "수료증은 PDF로 저장해 제출할 수 있고, 수료증에 적힌 검증 링크로 누구나 발급 사실을 확인할 수 있어요.",
  },
];

export default async function CourseDetailPage({ params }: { params: Params }) {
  const { locale, slug: rawSlug } = await params;
  const slug = decodeParam(rawSlug);
  const viewer = await getViewer();
  const course = await getCourseForDetail(slug);
  if (!course) notFound();

  const access = await resolveCourseAccess(course, viewer);
  const detailPath = `/${locale}/courses/${encodeURIComponent(course.slug)}`;

  if (access.kind === "notfound") notFound();
  if (access.kind === "login") {
    return (
      <div className="container-page py-24">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-ink-soft">
            <Lock className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">임직원 전용 프로그램이에요</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            바야다홈헬스케어 임직원 계정으로 로그인하면 이 프로그램을 확인하고 수강할 수 있어요.
          </p>
          <Link
            href={`/${locale}/auth/login?callbackUrl=${encodeURIComponent(detailPath)}`}
            className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink-soft"
          >
            로그인
          </Link>
          <Link href={`/${locale}/courses`} className="mt-3 text-sm font-medium text-muted hover:text-ink">
            다른 프로그램 둘러보기
          </Link>
        </div>
      </div>
    );
  }

  const enrollment = access.enrollment;
  const lectures = course.sections.flatMap((s) => s.lectures);
  const lectureCount = lectures.length;
  const quizCount = lectures.filter((l) => l.type === "QUIZ").length;
  const totalMin = course.durationMin ?? Math.round(lectures.reduce((sum, l) => sum + (l.duration ?? 0), 0) / 60);
  const [resumeLectureId, certificate, providerCourseCount, sessions, reviewData, wish] = await Promise.all([
    enrollment && viewer ? getResumeLectureId(viewer.id, course.id) : Promise.resolve(null),
    enrollment && viewer
      ? prisma.certificate.findUnique({
          where: { userId_courseId: { userId: viewer.id, courseId: course.id } },
          select: { number: true },
        })
      : Promise.resolve(null),
    course.providerId
      ? prisma.course.count({ where: { providerId: course.providerId, ...visibleCourseWhere(viewer) } })
      : Promise.resolve(0),
    getCourseSessions(course.id, viewer?.id ?? null),
    getCourseReviews(course.id, viewer?.id ?? null),
    viewer
      ? prisma.wishlist.findUnique({
          where: { userId_courseId: { userId: viewer.id, courseId: course.id } },
          select: { courseId: true },
        })
      : Promise.resolve(null),
  ]);
  const wished = viewer ? !!wish : null;
  // 이 강의가 선수 과정인 공개 바야다 인증 → 수료 안내에 다음 단계로 연결
  const nextCredentials = await programsRequiringCourse(course.id);
  const reviewSummary = reviewData.summary;
  const reviewable = canWriteReview(enrollment);
  const showReviews = reviewSummary.count > 0 || reviewable;
  // 실습 신청: 수강 중이거나 무료 공개 강의
  const canApplySession = !!enrollment || course.price === 0;
  const progress = enrollment ? (enrollment.completedAt ? 100 : enrollment.progressPercent) : 0;
  const firstFree = lectures.find((l) => l.isFree);
  // 유료 강의: 이용 중인 패스가 유형을 포함하면 "패스로 수강", 아니면 구매 + 패스 업셀
  const [plans, myPass] =
    course.price > 0 && !enrollment
      ? await Promise.all([getActivePlans(), viewer ? getMyPass(viewer.id) : Promise.resolve(null)])
      : [[], null];
  const passCovers = !!myPass?.includes.includes(course.productType);
  const passOffer = !passCovers && plans.some((p) => p.includes.includes(course.productType));
  const passLapsed = access.passLapsed === true;

  const infoItems = [
    { label: "구성", value: `${lectureCount}개 강의`, icon: BookOpen },
    { label: "난이도", value: course.level ? LEVEL_LABEL[course.level] : "전체", icon: BarChart3 },
    { label: "총 학습 시간", value: formatMinutes(totalMin) ?? "-", icon: Clock },
    { label: "학습 방식", value: LEARNING_MODE_LABEL[course.learningMode], icon: MonitorPlay },
    {
      label: "인증 유형",
      value: course.productType === "CERTIFICATION" ? "바야다 인증" : "수료증",
      icon: Award,
    },
  ];
  if (reviewSummary.count > 0) {
    infoItems.splice(1, 0, {
      label: `평점 (${reviewSummary.count})`,
      value: `★ ${reviewSummary.avg.toFixed(1)}`,
      icon: Star,
    });
  }

  const nav = [
    { id: "intro", label: "소개" },
    { id: "curriculum", label: "커리큘럼" },
    ...(sessions.length ? [{ id: "sessions", label: "실습 일정" }] : []),
    { id: "certificate", label: "수료" },
    ...(showReviews ? [{ id: "reviews", label: "후기" }] : []),
    { id: "faq", label: "FAQ" },
  ];

  return (
    <div className="pb-24 lg:pb-0">
      {/* 서브 내비 */}
      <div className="sticky top-16 z-30 border-b border-line bg-white/95 backdrop-blur md:top-[100px]">
        <div className="container-page flex h-12 items-center justify-between gap-4">
          <nav aria-label="프로그램 상세 메뉴" className="no-scrollbar flex gap-6 overflow-x-auto">
            {nav.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="shrink-0 text-sm font-semibold text-ink-soft hover:text-ink">
                {n.label}
              </a>
            ))}
          </nav>
          <nav aria-label="현재 위치" className="hidden truncate text-xs text-muted md:block">
            <Link href={`/${locale}`} className="hover:text-ink">
              홈
            </Link>
            <span className="mx-1.5">/</span>
            <Link href={`/${locale}/courses`} className="hover:text-ink">
              전체 프로그램
            </Link>
            {course.category && (
              <>
                <span className="mx-1.5">/</span>
                <Link
                  href={`/${locale}/courses?category=${encodeURIComponent(course.category.slug)}`}
                  className="hover:text-ink"
                >
                  {course.category.name}
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="container-page">
        <div className="grid gap-10 pt-10 lg:grid-cols-[1fr_360px] lg:gap-14">
          <div className="min-w-0">
            {/* 히어로 */}
            <section id="intro" className="scroll-mt-40">
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">
                  {(course.provider?.name ?? "B").charAt(0)}
                </span>
                {course.provider?.name ?? "바야다홈헬스케어"}
              </div>
              <h1 className="mt-4 text-[30px] font-bold leading-tight tracking-[-0.02em] text-ink md:text-[40px]">
                {course.title}
              </h1>
              {course.summary && <p className="mt-4 text-[17px] leading-relaxed text-muted">{course.summary}</p>}
              <div className="mt-5 flex flex-wrap gap-2">
                {course.audiences.map((a) => (
                  <span key={a} className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-soft">
                    {JOB_ROLE_LABEL[a]}
                  </span>
                ))}
                <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-soft">
                  {PRODUCT_TYPE_LABEL[course.productType]}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                  <Award className="h-3.5 w-3.5" aria-hidden /> 수료증 발급
                </span>
                {course.visibility === "INTERNAL" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">
                    <Lock className="h-3 w-3" aria-hidden /> 사내 전용
                  </span>
                )}
              </div>

              {/* 정보 바 */}
              <dl
                className={`mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line ${
                  infoItems.length > 5 ? "sm:grid-cols-3 xl:grid-cols-6" : "sm:grid-cols-5"
                }`}
              >
                {infoItems.map((it) => (
                  <div key={it.label} className="bg-white p-4 sm:p-5">
                    <dt className="flex items-center gap-1.5 text-xs text-muted">
                      <it.icon className="h-3.5 w-3.5" aria-hidden /> {it.label}
                    </dt>
                    <dd className="mt-1.5 text-[15px] font-bold text-ink">{it.value}</dd>
                  </div>
                ))}
              </dl>

              {course.objectives.length > 0 && (
                <div className="mt-14">
                  <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">배우게 될 내용</h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {course.objectives.map((o) => (
                      <li key={o} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-soft">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.description && (
                <div className="mt-14">
                  <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">프로그램 소개</h2>
                  <div
                    className="legacy-content mt-5"
                    // 옮겨 온 WordPress 본문(관리자 작성, 신뢰 콘텐츠)
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                </div>
              )}
            </section>

            {/* 커리큘럼 */}
            <section id="curriculum" className="mt-16 scroll-mt-40">
              <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">
                커리큘럼 <span className="text-muted">· {lectureCount}개 강의</span>
              </h2>
              {quizCount > 0 && <p className="mt-2 text-sm text-muted">퀴즈 {quizCount}개 포함</p>}
              <div className="mt-6 space-y-3">
                {course.sections.map((s, si) => {
                  const secSec = s.lectures.reduce((sum, l) => sum + (l.duration ?? 0), 0);
                  return (
                    <details
                      key={s.id}
                      open={si === 0}
                      className="overflow-hidden rounded-2xl border border-line bg-white"
                    >
                      <summary className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface">
                        <span className="text-[15px] font-semibold text-ink">
                          {si + 1}. {s.title}
                        </span>
                        <span className="flex shrink-0 items-center gap-3 text-xs text-muted">
                          {s.lectures.length}개
                          {secSec > 0 && ` · ${formatMinutes(Math.round(secSec / 60))}`}
                          <ChevronDown className="accordion-chevron h-4 w-4 transition-transform" aria-hidden />
                        </span>
                      </summary>
                      <ul className="border-t border-line-soft">
                        {s.lectures.map((l) => {
                          const Icon = LECTURE_ICON[l.type];
                          const canOpen = !!enrollment || l.isFree;
                          const row = (
                            <>
                              <Icon className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
                              <span className="flex-1 truncate">{l.title}</span>
                              {l.isFree && !enrollment && (
                                <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                                  미리보기
                                </span>
                              )}
                              <span className="shrink-0 text-xs text-muted">
                                {l.type === "QUIZ"
                                  ? `${l.quiz?._count.questions ?? 0}문항`
                                  : (formatSeconds(l.duration) ?? (l.type === "TEXT" ? "읽기" : ""))}
                              </span>
                            </>
                          );
                          return (
                            <li key={l.id}>
                              {canOpen ? (
                                <Link
                                  href={`${detailPath}/lectures/${l.id}`}
                                  className="flex items-center gap-3 px-5 py-3 text-sm text-ink-soft hover:bg-surface hover:text-ink"
                                >
                                  {row}
                                </Link>
                              ) : (
                                <div className="flex items-center gap-3 px-5 py-3 text-sm text-ink-soft">{row}</div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  );
                })}
              </div>
            </section>

            {/* 실습 일정 */}
            {sessions.length > 0 && (
              <section id="sessions" className="mt-16 scroll-mt-40">
                <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">
                  실습 일정 <span className="text-muted">· {sessions.length}회</span>
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {canApplySession
                    ? "원하는 지역·일정을 골라 신청하세요. 정원이 차면 마감돼요."
                    : "수강 신청한 분만 실습을 신청할 수 있어요."}
                </p>
                <div className="mt-6 overflow-hidden rounded-2xl border border-line">
                  <table className="w-full text-left text-sm">
                    <thead className="hidden bg-surface text-xs font-semibold text-muted sm:table-header-group">
                      <tr>
                        <th scope="col" className="px-5 py-3">지역</th>
                        <th scope="col" className="px-5 py-3">일시</th>
                        <th scope="col" className="px-5 py-3">장소</th>
                        <th scope="col" className="px-5 py-3">남은 자리</th>
                        <th scope="col" className="px-5 py-3">
                          <span className="sr-only">신청</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-soft">
                      {sessions.map((ss) => (
                        <tr key={ss.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-5 py-4 sm:table-row sm:p-0">
                          <td className="font-semibold text-ink sm:px-5 sm:py-4">{ss.region}</td>
                          <td className="col-start-1 text-ink-soft sm:whitespace-nowrap sm:px-5 sm:py-4">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5 text-subtle sm:hidden" aria-hidden />
                              {formatSessionRange(ss.startsAt, ss.endsAt)}
                            </span>
                          </td>
                          <td className="col-start-1 text-ink-soft sm:px-5 sm:py-4">
                            {ss.location}
                            {ss.note && <span className="mt-0.5 block text-xs text-muted">{ss.note}</span>}
                          </td>
                          <td className="col-start-1 sm:whitespace-nowrap sm:px-5 sm:py-4">
                            {ss.remaining > 0 ? (
                              <span className="text-ink-soft">
                                <span className={`font-bold ${ss.remaining <= 3 ? "text-brand" : "text-ink"}`}>
                                  {ss.remaining}
                                </span>
                                <span className="text-muted"> / {ss.capacity}석</span>
                              </span>
                            ) : (
                              <span className="font-semibold text-muted">마감 · {ss.capacity}석</span>
                            )}
                          </td>
                          <td className="col-start-2 row-span-4 row-start-1 self-center text-right sm:px-5 sm:py-4">
                            <SessionButton
                              sessionId={ss.id}
                              registered={ss.registered}
                              full={ss.remaining === 0}
                              loggedIn={!!viewer}
                              canApply={canApplySession}
                              reason="수강 신청 후 실습을 신청할 수 있어요"
                              locale={locale}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* 수료 안내 */}
            <section id="certificate" className="mt-16 scroll-mt-40">
              <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">수료 안내</h2>
              <div className="mt-6 grid gap-6 rounded-2xl border border-line bg-surface p-6 sm:grid-cols-[200px_1fr] sm:p-8">
                <div className="flex aspect-[1.414] flex-col justify-between rounded-xl border border-line bg-white p-4 shadow-card">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[11px] font-extrabold text-brand">BAYADA</span>
                    <span className="text-[10px] font-semibold text-ink">Academy</span>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-muted">CERTIFICATE</p>
                    <p className="mt-1 line-clamp-2 text-xs font-bold leading-snug text-ink">{course.title}</p>
                  </div>
                  <div className="h-px bg-line" />
                </div>
                <div>
                  <p className="text-lg font-bold text-ink">모든 강의를 마치면 수료증이 발급돼요</p>
                  <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-ink-soft">
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                      영상·읽기 강의를 모두 완료하고{quizCount > 0 ? " 퀴즈를 합격 점수 이상으로 통과하면" : "면"} 자동 발급
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                      마이 러닝 &gt; 인증서에서 PDF로 저장
                    </li>
                    <li className="flex gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                      고유 번호와 검증 링크로 누구나 발급 사실 확인
                    </li>
                  </ul>
                  {certificate && (
                    <Link
                      href={`/${locale}/certificates/${certificate.number}/print`}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                    >
                      <Award className="h-4 w-4" aria-hidden /> 내 수료증 보기 ({certificate.number})
                    </Link>
                  )}
                  {nextCredentials.length > 0 && (
                    <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4">
                      {nextCredentials.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/${locale}/certifications/${encodeURIComponent(p.slug)}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-brand"
                        >
                          <ShieldCheck className="h-4 w-4 text-brand" aria-hidden />→ 바야다 인증 {p.title}으로 이어집니다
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 제공기관 */}
            {course.provider && (
              <section className="mt-16">
                <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">제공기관</h2>
                <div className="mt-6 flex items-center gap-5 rounded-2xl border border-line p-6">
                  {course.provider.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.provider.logo} alt="" className="h-14 w-14 rounded-full border border-line object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-lg font-bold text-brand">
                      {course.provider.name.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-ink">{course.provider.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {course.provider.isPartner ? "파트너 교육기관" : "바야다 아카데미 운영 기관"}
                      {providerCourseCount > 0 && ` · 프로그램 ${providerCourseCount}개`}
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/courses?provider=${encodeURIComponent(course.provider.slug)}`}
                    className="hidden shrink-0 text-sm font-semibold text-ink-soft hover:text-ink sm:block"
                  >
                    프로그램 보기 →
                  </Link>
                </div>
              </section>
            )}

            {/* 후기·평점 */}
            {showReviews && (
              <section id="reviews" className="mt-16 scroll-mt-40">
                <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">
                  수강 후기 {reviewSummary.count > 0 && <span className="text-muted">· {reviewSummary.count}개</span>}
                </h2>
                {reviewSummary.count > 0 && (
                  <div className="mt-6 grid gap-6 rounded-2xl border border-line p-6 sm:grid-cols-[180px_1fr] sm:items-center sm:gap-10">
                    <div className="text-center sm:border-r sm:border-line-soft sm:pr-10">
                      <p className="text-[44px] font-bold leading-none tracking-tight text-ink">
                        {reviewSummary.avg.toFixed(1)}
                      </p>
                      <div className="mt-3 flex justify-center">
                        <Stars value={reviewSummary.avg} />
                      </div>
                      <p className="mt-2 text-xs text-muted">후기 {reviewSummary.count}개 평균</p>
                    </div>
                    <ul className="space-y-1.5">
                      {reviewSummary.distribution.map((d) => {
                        const pct = Math.round((d.count / reviewSummary.count) * 100);
                        return (
                          <li key={d.star} className="flex items-center gap-3 text-xs">
                            <span className="w-7 shrink-0 font-semibold text-ink-soft">{d.star}점</span>
                            <span className="h-2 flex-1 overflow-hidden rounded-full bg-line-soft">
                              <span className="block h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                            </span>
                            <span className="w-8 shrink-0 text-right text-muted">{d.count}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {reviewable && (
                  <div className="mt-6">
                    <ReviewForm
                      courseId={course.id}
                      initial={
                        reviewData.mine
                          ? {
                              rating: reviewData.mine.rating,
                              content: reviewData.mine.content,
                              showName: reviewData.mine.showName,
                              hidden: reviewData.mine.status !== "PUBLISHED",
                            }
                          : null
                      }
                    />
                  </div>
                )}
                {reviewSummary.count === 0 ? (
                  <p className="mt-4 text-sm text-muted">아직 후기가 없어요. 첫 후기를 남겨 주세요.</p>
                ) : (
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {reviewData.reviews.map((r) => (
                      <li key={r.id}>
                        <ReviewCard
                          review={r}
                          footer={
                            r.mine ? null : (
                              <ReportReviewButton
                                reviewId={r.id}
                                reported={r.reported}
                                loggedIn={!!viewer}
                                locale={locale}
                              />
                            )
                          }
                        />
                      </li>
                    ))}
                  </ul>
                )}
                {enrollment && !reviewable && (
                  <p className="mt-4 text-xs text-muted">
                    진도율 {REVIEW_MIN_PROGRESS}% 이상이 되면 후기를 남길 수 있어요. (현재 {progress}%)
                  </p>
                )}
              </section>
            )}

            {/* FAQ */}
            <section id="faq" className="mt-16 scroll-mt-40">
              <h2 className="mb-6 text-xl font-bold tracking-tight text-ink md:text-2xl">자주 묻는 질문</h2>
              <Faq items={DETAIL_FAQ} />
            </section>
          </div>

          {/* 수강 패널 */}
          <aside className="lg:row-start-1 lg:col-start-2">
            <div className="lg:sticky lg:top-[172px]">
              <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                <div className="aspect-[16/9] bg-line-soft">
                  <CourseThumb src={course.thumbnail} title={course.title} label={course.category?.name} />
                </div>
                <div className="p-6">
                  {enrollment ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-ink">
                          {enrollment.completedAt ? "수료 완료" : "학습 중"}
                        </span>
                        <span className="font-bold text-ink">{progress}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-line-soft">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
                      </div>
                      {resumeLectureId && (
                        <Link
                          href={`${detailPath}/lectures/${resumeLectureId}`}
                          className="mt-5 flex h-12 items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white hover:bg-brand-strong"
                        >
                          {enrollment.completedAt ? "다시 보기" : progress > 0 ? "이어보기" : "학습 시작하기"}
                        </Link>
                      )}
                      <Link
                        href={`/${locale}/dashboard`}
                        className="mt-2 flex h-11 items-center justify-center rounded-xl border border-line text-sm font-semibold text-ink hover:border-ink"
                      >
                        마이 러닝
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold tracking-tight text-ink">{formatPrice(course.price)}</p>
                      {passCovers && (
                        <p className="mt-1 text-sm font-medium text-brand">아카데미 패스 이용 중 · 추가 결제 없이 수강</p>
                      )}
                      {passLapsed && !passCovers && (
                        <p className="mt-2 rounded-lg bg-surface px-3 py-2 text-[13px] leading-relaxed text-ink-soft">
                          패스 이용 기간이 끝났어요. 패스를 다시 구독하거나 구매하면 학습 기록 그대로 이어서 들을 수 있어요.
                        </p>
                      )}
                      <div className="mt-5">
                        {course.price === 0 ? (
                          <EnrollButton courseId={course.id} locale={locale} slug={course.slug} loggedIn={!!viewer} />
                        ) : passCovers ? (
                          <EnrollButton courseId={course.id} locale={locale} slug={course.slug} loggedIn via="pass" />
                        ) : (
                          <BuyButton locale={locale} slug={course.slug} />
                        )}
                      </div>
                      {passOffer && (
                        <Link
                          href={`/${locale}/pass`}
                          className="mt-2 flex h-11 items-center justify-center gap-1.5 rounded-xl border border-brand/20 bg-brand-soft text-sm font-semibold text-brand hover:border-brand"
                        >
                          아카데미 패스로 무제한 수강
                        </Link>
                      )}
                      {firstFree && (
                        <Link
                          href={`${detailPath}/lectures/${firstFree.id}`}
                          className="mt-2 flex h-11 items-center justify-center rounded-xl border border-line text-sm font-semibold text-ink hover:border-ink"
                        >
                          미리보기
                        </Link>
                      )}
                    </>
                  )}
                  <WishlistButton
                    courseId={course.id}
                    locale={locale}
                    wished={wished}
                    variant="panel"
                    className="mt-2 w-full"
                  />
                  <ul className="mt-6 space-y-2 border-t border-line-soft pt-5 text-sm text-ink-soft">
                    <li className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-subtle" aria-hidden /> {lectureCount}개 강의
                      {quizCount > 0 && ` · 퀴즈 ${quizCount}개`}
                    </li>
                    {formatMinutes(totalMin) && (
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-subtle" aria-hidden /> 총 {formatMinutes(totalMin)}
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-subtle" aria-hidden /> 수료 시 수료증 발급
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 모바일 하단 고정 CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-5 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            {enrollment ? (
              <p className="text-sm font-bold text-ink">진도 {progress}%</p>
            ) : (
              <p className="text-lg font-bold text-ink">{formatPrice(course.price)}</p>
            )}
          </div>
          <div className="flex-1">
            {enrollment ? (
              resumeLectureId && (
                <Link
                  href={`${detailPath}/lectures/${resumeLectureId}`}
                  className="flex h-12 items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white"
                >
                  {enrollment.completedAt ? "다시 보기" : progress > 0 ? "이어보기" : "학습 시작하기"}
                </Link>
              )
            ) : course.price === 0 ? (
              <EnrollButton courseId={course.id} locale={locale} slug={course.slug} loggedIn={!!viewer} />
            ) : passCovers ? (
              <EnrollButton courseId={course.id} locale={locale} slug={course.slug} loggedIn via="pass" />
            ) : (
              <BuyButton locale={locale} slug={course.slug} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
