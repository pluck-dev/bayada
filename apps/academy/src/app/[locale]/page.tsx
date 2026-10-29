import { Fragment } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Building2,
  GraduationCap,
  HeartHandshake,
  Lock,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Infinity as InfinityIcon,
} from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { getHomeData, getTaxonomy, type CourseCardData } from "@/lib/queries/courses";
import { getImpactStats, getPartners, getRecentReviews } from "@/lib/queries/engagement";
import { JOB_ROLES, JOB_ROLE_LABEL, PRODUCT_TYPE_LABEL } from "@/lib/labels";
import { getActivePlans } from "@/lib/queries/pass";
import { getSiteSettings } from "@/lib/site-settings";
import { inquiryHref, resolveHref, type HomeSectionKey } from "@bayada/shared/site-settings";
import { CourseCard } from "@/components/course/CourseCard";
import { CourseThumb } from "@/components/course/CourseThumb";
import { BannerCarousel } from "@/components/home/BannerCarousel";
import { CountUp } from "@/components/home/CountUp";
import { ReviewCarousel } from "@/components/home/ReviewCarousel";
import { ReviewCard } from "@/components/course/ReviewCard";
import { Tabs } from "@/components/ui/Tabs";
import { Faq } from "@/components/ui/Faq";
import { EmptyState } from "@/components/ui/EmptyState";
import { listPublishedPathways } from "@/lib/queries/pathways";
import { PathwayCard } from "@/components/pathway/PathwayCard";

function categoryIcon(name: string) {
  const cls = "h-6 w-6";
  if (name.includes("간호")) return <Stethoscope className={cls} aria-hidden />;
  if (name.includes("요양")) return <HeartHandshake className={cls} aria-hidden />;
  if (name.includes("PSP") || name.includes("안전")) return <ShieldCheck className={cls} aria-hidden />;
  if (name.includes("치매")) return <Brain className={cls} aria-hidden />;
  if (name.includes("공통")) return <BookOpen className={cls} aria-hidden />;
  if (name.includes("체험")) return <Sparkles className={cls} aria-hidden />;
  return <GraduationCap className={cls} aria-hidden />;
}

function SectionTitle({ title, desc, href }: { title: string; desc?: string; href?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink md:text-[30px]">{title}</h2>
        {desc && <p className="mt-2 text-[15px] text-muted">{desc}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink sm:flex"
        >
          전체 보기 <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

function CourseRow({ items, locale }: { items: CourseCardData[]; locale: string }) {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4 lg:gap-5">
      {items.map((c) => (
        <div key={c.id} className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto">
          <CourseCard course={c} locale={locale} />
        </div>
      ))}
    </div>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = `/${locale}`;
  const catalog = `${base}/courses`;
  const viewer = await getViewer();
  const [home, taxonomy, partners, stats, reviews, pathways, settings] = await Promise.all([
    getHomeData(viewer),
    getTaxonomy(viewer),
    getPartners(),
    getImpactStats(viewer),
    getRecentReviews(viewer),
    listPublishedPathways(),
    getSiteSettings(),
  ]);
  const hero = settings["home.hero"];
  const faq = settings.faq;
  const inquiry = inquiryHref(settings.inquiry);
  const heroCtas = [
    { ...hero.primaryCta, primary: true },
    { ...hero.secondaryCta, primary: false },
  ].filter((c) => c.label.trim() && c.href);
  const plans = await getActivePlans();
  const passPromo = plans.length
    ? {
        minPrice: Math.min(...plans.map((p) => p.price)),
        includes: [...new Set(plans.flatMap((p) => p.includes))].map((t) => PRODUCT_TYPE_LABEL[t]).join(" · "),
      }
    : null;
  const hasCourses = home.popular.length > 0;
  const heroCourses = home.popular.slice(0, 3);

  // 홈 섹션 — 표시 여부·순서는 어드민 사이트 설정(home.sections). 섹션별 데이터 노출 규칙(빈 데이터면 숨김)은 그대로
  const sections: Record<HomeSectionKey, React.ReactNode> = {
    // ③ 직군 선택 (공개 프로그램이 없으면 안내 화면)
    roles: hasCourses ? (
      <section id="roles" className="scroll-mt-28 py-16 md:py-20">
        <div className="container-page">
          <SectionTitle title="어떤 일을 하시나요?" desc="직군을 고르면 꼭 맞는 프로그램을 추천해 드려요." />
          <Tabs
            variant="pill"
            ariaLabel="직군 선택"
            items={JOB_ROLES.map((role) => ({
              key: role,
              label: JOB_ROLE_LABEL[role],
              content: (
                <div>
                  {home.byRole[role].fallback && (
                    <p className="mb-4 text-sm text-muted">
                      {JOB_ROLE_LABEL[role]} 대상 프로그램을 준비하고 있어요. 대신 많이 듣는 프로그램을 보여 드릴게요.
                    </p>
                  )}
                  <CourseRow items={home.byRole[role].items} locale={locale} />
                  {!home.byRole[role].fallback && (
                    <Link
                      href={`${catalog}?audience=${role}`}
                      className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"
                    >
                      {JOB_ROLE_LABEL[role]} 프로그램 모두 보기 <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                </div>
              ),
            }))}
          />
        </div>
      </section>
    ) : (
      <section id="roles" className="scroll-mt-28 py-16 md:py-20">
        <div className="container-page">
          <SectionTitle title="어떤 일을 하시나요?" />
          <EmptyState
            icon={<Lock className="h-5 w-5" />}
            title={viewer ? "아직 공개된 프로그램이 없어요" : "지금은 임직원 전용 프로그램을 운영하고 있어요"}
            description={
              viewer
                ? "새 프로그램이 공개되면 이곳에 바로 보여 드릴게요."
                : "바야다홈헬스케어 임직원이라면 로그인 후 사내 교육 프로그램을 수강할 수 있어요. 일반 공개 프로그램도 곧 이곳에 소개됩니다."
            }
            action={viewer ? undefined : { label: "로그인", href: `${base}/auth/login` }}
          />
        </div>
      </section>
    ),
    // ④ 신규·인기
    popular: hasCourses ? (
      <section className="border-y border-line-soft bg-surface py-16 md:py-20">
        <div className="container-page">
          <SectionTitle title="지금 많이 듣는 프로그램" href={catalog} />
          <Tabs
            ariaLabel="프로그램 정렬"
            items={[
              {
                key: "popular",
                label: "인기",
                content: <CourseRow items={home.popular.slice(0, 4)} locale={locale} />,
              },
              {
                key: "newest",
                label: "신규",
                content: <CourseRow items={home.newest.slice(0, 4)} locale={locale} />,
              },
              {
                key: "cert",
                label: "인증 과정",
                content: home.certification.length ? (
                  <CourseRow items={home.certification.slice(0, 4)} locale={locale} />
                ) : (
                  <EmptyState
                    icon={<ShieldCheck className="h-5 w-5" />}
                    title="열려 있는 인증 과정이 아직 없어요"
                    description="바야다 인증과정이 개설되면 이곳에서 가장 먼저 소개해 드릴게요."
                    action={{ label: "전체 프로그램 보기", href: catalog }}
                  />
                ),
              },
            ]}
          />
        </div>
      </section>
    ) : null,
    // ⑤ 커리어 패스웨이 — 게시된 패스웨이가 없으면 숨김
    pathways:
      pathways.length > 0 ? (
        <section className="py-16 md:py-20">
          <div className="container-page">
            <SectionTitle
              title="해외 진출 · 국내 커리어"
              desc="국가·직군별 커리어 경로를 단계별로 안내해 드려요."
              href={`${base}/pathways`}
            />
            <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4 lg:gap-5">
              {pathways.slice(0, 8).map((p) => (
                <div key={p.id} className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto">
                  <PathwayCard pathway={p} locale={locale} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null,
    // ⑥ 파트너 기관
    partners:
      partners.length > 0 ? (
        <section aria-labelledby="partners-title" className="border-b border-line-soft py-12 md:py-14">
          <div className="container-page">
            <p id="partners-title" className="text-center text-sm font-semibold text-muted">
              함께하는 교육 기관
            </p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {partners.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`${catalog}?provider=${encodeURIComponent(p.slug)}`}
                    className="flex h-12 items-center opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                    title={`${p.name} 프로그램 보기`}
                  >
                    {/* 파트너 로고 (어드민 업로드 원격 이미지) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.logo!} alt={p.name} className="max-h-12 w-auto max-w-[160px] object-contain" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null,
    // ⑦ 주제별 찾아보기
    topics:
      taxonomy.categories.length > 0 ? (
        <section className="py-16 md:py-20">
          <div className="container-page">
            <SectionTitle title="주제별로 찾아보기" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {taxonomy.categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`${catalog}?category=${encodeURIComponent(c.slug)}`}
                  className="lift group flex flex-col items-start gap-6 rounded-2xl border border-line bg-white p-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-ink-soft transition-colors group-hover:bg-brand-soft group-hover:text-brand">
                    {categoryIcon(c.name)}
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-ink">{c.name}</span>
                    {c.count > 0 && <span className="mt-0.5 block text-xs text-muted">{c.count}개 프로그램</span>}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null,
    // ⑧ 업셀 — 아카데미 패스(판매 중인 요금제가 있을 때만) + 기관 도입
    upsell: (
      <section id="org" className="scroll-mt-28 py-6">
        <div className={`container-page ${passPromo ? "grid gap-5 lg:grid-cols-2" : ""}`}>
          {passPromo && (
            <div className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-3xl border border-brand/15 bg-brand-soft px-8 py-12 md:px-12 md:py-14">
              <div className="max-w-xl">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
                  <InfinityIcon className="h-4 w-4" aria-hidden /> 아카데미 패스
                </p>
                <h2 className="mt-3 text-2xl font-bold leading-snug tracking-tight text-ink md:text-[30px]">
                  패스 하나로 마음껏 배우세요
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                  {passPromo.includes} 무제한 수강 · {passPromo.minPrice.toLocaleString("ko-KR")}원부터
                </p>
              </div>
              <Link
                href={`${base}/pass`}
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-ink px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-ink-soft"
              >
                패스 알아보기 <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          )}
          <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-12 text-white md:px-14 md:py-14">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl"
              aria-hidden
            />
            <div
              className={`relative flex h-full flex-col gap-8 ${passPromo ? "justify-between" : "md:flex-row md:items-center md:justify-between"}`}
            >
              <div className="max-w-xl">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-white/70">
                  <Building2 className="h-4 w-4" aria-hidden /> 기관·센터
                </p>
                <h2 className="mt-3 text-2xl font-bold leading-snug tracking-tight md:text-[30px]">
                  우리 센터 직원 교육, 바야다 아카데미로
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-white/70">
                  직원 단체 수강과 교육 운영이 필요하신가요? 담당자가 기관 상황에 맞는 도입 방법을 안내해 드려요.
                </p>
              </div>
              <a
                href={inquiry}
                className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:bg-line-soft ${passPromo ? "" : "md:self-auto"}`}
              >
                기관 도입 문의 <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </section>
    ),
    // ⑨ 성과 지표
    stats:
      stats.length > 0 ? (
        <section className="pt-16 md:pt-20">
          <div className="container-page">
            <SectionTitle title="숫자로 보는 바야다 아카데미" desc="지금까지 함께 배우고 수료한 기록이에요." />
            <dl
              className={`grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line ${
                stats.length >= 4 ? "lg:grid-cols-4" : stats.length === 3 ? "lg:grid-cols-3" : ""
              }`}
            >
              {stats.map((st) => (
                <div key={st.label} className="bg-white px-6 py-8 md:px-8 md:py-10">
                  <dt className="text-sm font-medium text-muted">{st.label}</dt>
                  <dd className="mt-3 flex items-baseline gap-1 text-ink">
                    <span className="text-[34px] font-bold leading-none tracking-[-0.03em] md:text-[44px]">
                      <CountUp value={st.value} />
                    </span>
                    <span className="text-base font-semibold text-ink-soft">{st.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null,
    // ⑩ 후기
    reviews:
      reviews.length > 0 ? (
        <section className="pt-16 md:pt-20">
          <div className="container-page">
            <SectionTitle title="수강생 후기" desc="진도 80% 이상 학습한 수강생이 직접 남긴 이야기예요." />
            <ReviewCarousel count={reviews.length}>
              {reviews.map((r) => (
                <div key={r.id} className="w-[84%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-2.5rem)/3)]">
                  <ReviewCard
                    review={r}
                    clamp
                    heading={
                      <Link
                        href={`${catalog}/${encodeURIComponent(r.course.slug)}#reviews`}
                        className="mb-3 line-clamp-1 text-xs font-semibold text-muted hover:text-brand"
                      >
                        {r.course.title}
                      </Link>
                    }
                  />
                </div>
              ))}
            </ReviewCarousel>
          </div>
        </section>
      ) : null,
    // ⑪ FAQ — 항목이 하나도 없으면 숨김
    faq: faq.items.length ? (
      <section id="faq" className="scroll-mt-28 py-16 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink md:text-[30px]">{faq.title}</h2>
            {faq.subtitle && <p className="mt-2 text-[15px] text-muted">{faq.subtitle}</p>}
          </div>
          <Faq items={faq.items} />
        </div>
      </section>
    ) : null,
  };
  const { order, hidden } = settings["home.sections"];

  return (
    <>
      {/* ② 히어로 */}
      <section className="border-b border-line-soft bg-gradient-to-b from-surface to-white">
        <div className="container-page grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
              {hero.eyebrow}
            </p>
            <h1 className="mt-6 text-[40px] font-bold leading-[1.15] tracking-[-0.03em] text-ink md:text-[54px]">
              {hero.title.split(/\r?\n/).map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted">{hero.subtitle}</p>
            {heroCtas.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {heroCtas.map((c) =>
                  c.primary ? (
                    <Link
                      key="primary"
                      href={resolveHref(c.href, locale)}
                      className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgb(227_27_52/0.6)] transition-colors hover:bg-brand-strong"
                    >
                      {c.label} <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : (
                    <Link
                      key="secondary"
                      href={resolveHref(c.href, locale)}
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-ink"
                    >
                      {c.label}
                    </Link>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="lg:h-[420px]">
            {home.banners.length > 0 ? (
              <BannerCarousel
                banners={home.banners.map((b) => ({
                  id: b.id,
                  title: b.title,
                  subtitle: b.subtitle,
                  image: b.image,
                  linkUrl: b.linkUrl,
                }))}
              />
            ) : heroCourses.length > 0 ? (
              <div className="flex h-full flex-col rounded-3xl border border-line bg-white p-3 shadow-[0_24px_48px_-24px_rgb(24_24_27/0.18)]">
                <p className="flex items-center justify-between px-3 pb-2 pt-2 text-sm font-bold text-ink">
                  지금 많이 듣는 프로그램
                  <Link href={`${catalog}?sort=popular`} className="text-xs font-semibold text-muted hover:text-ink">
                    더 보기
                  </Link>
                </p>
                <ol className="flex flex-1 flex-col">
                  {heroCourses.map((c, i) => (
                    <li key={c.id} className="flex-1">
                      <Link
                        href={`${catalog}/${encodeURIComponent(c.slug)}`}
                        className="group flex h-full items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-surface"
                      >
                        <span className="w-4 shrink-0 text-center text-lg font-bold text-brand">{i + 1}</span>
                        <span className="block aspect-[16/9] w-32 shrink-0 overflow-hidden rounded-xl border border-line-soft bg-line-soft sm:w-40">
                          <CourseThumb src={c.thumbnail} title={c.title} label={c.category?.name} />
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink group-hover:text-brand">
                            {c.title}
                          </span>
                          <span className="mt-1 block text-xs text-muted">
                            {[
                              c.category?.name,
                              c._count.enrollments > 0 ? `${c._count.enrollments.toLocaleString()}명 수강` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="grid h-full grid-cols-2 gap-4">
                {taxonomy.categories.slice(0, 4).map((c, i) => (
                  <Link
                    key={c.slug}
                    href={`${catalog}?category=${encodeURIComponent(c.slug)}`}
                    className={`flex min-h-[150px] flex-col justify-between rounded-3xl border border-line p-6 transition-colors hover:border-ink ${
                      i === 0 ? "bg-ink text-white" : "bg-white text-ink"
                    }`}
                  >
                    <span className={i === 0 ? "text-white/80" : "text-brand"}>{categoryIcon(c.name)}</span>
                    <span className="text-lg font-bold tracking-tight">{c.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {order
        .filter((k) => !hidden.includes(k))
        .map((k) => (
          <Fragment key={k}>{sections[k]}</Fragment>
        ))}
    </>
  );
}
