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
import { Accordion, EmptyState, SectionHeader, Tabs, buttonVariants, cn } from "@bayada/ui";
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

/** 섹션 오른쪽 '전체 보기' — 텍스트 링크 하나 */
function MoreLink({ href, children = "전체 보기" }: { href: string; children?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hidden items-center gap-1 text-body-sm font-semibold text-ink-soft underline-offset-4 hover:text-ink hover:underline sm:inline-flex"
    >
      {children} <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

function CourseRow({ items, locale }: { items: CourseCardData[]; locale: string }) {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4 lg:gap-6">
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

  // 홈 섹션 — 표시 여부·순서는 어드민 사이트 설정(home.sections). 섹션별 데이터 노출 규칙(빈 데이터면 숨김)은 그대로.
  // 섹션 리듬: 모두 section-y(56/88px), 배경 띠는 '인기 프로그램' 한 곳만 surface — 띠가 번갈아 나오면 어수선해진다.
  const sections: Record<HomeSectionKey, React.ReactNode> = {
    // ③ 직군 선택 (공개 프로그램이 없으면 안내 화면)
    roles: (
      <section id="roles" className="section-y scroll-mt-20">
        <div className="container-page">
          <SectionHeader
            size="lg"
            title="어떤 일을 하시나요?"
            description={hasCourses ? "직군을 고르면 꼭 맞는 프로그램을 추천해 드려요." : undefined}
          />
          {hasCourses ? (
            <Tabs
              variant="pill"
              ariaLabel="직군 선택"
              items={JOB_ROLES.map((role) => ({
                key: role,
                label: JOB_ROLE_LABEL[role],
                content: (
                  <div>
                    {home.byRole[role].fallback && (
                      <p className="mb-4 text-body-sm text-muted">
                        {JOB_ROLE_LABEL[role]} 대상 프로그램을 준비하고 있어요. 대신 많이 듣는 프로그램을 보여 드릴게요.
                      </p>
                    )}
                    <CourseRow items={home.byRole[role].items} locale={locale} />
                    {!home.byRole[role].fallback && (
                      <Link
                        href={`${catalog}?audience=${role}`}
                        className="mt-6 inline-flex items-center gap-1 text-body-sm font-semibold text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                      >
                        {JOB_ROLE_LABEL[role]} 프로그램 모두 보기 <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    )}
                  </div>
                ),
              }))}
            />
          ) : (
            <EmptyState
              framed
              icon={<Lock />}
              title={viewer ? "아직 공개된 프로그램이 없어요" : "지금은 임직원 전용 프로그램을 운영하고 있어요"}
              description={
                viewer
                  ? "새 프로그램이 공개되면 이곳에 바로 보여 드릴게요."
                  : "바야다홈헬스케어 임직원이라면 로그인 후 사내 교육 프로그램을 수강할 수 있어요. 일반 공개 프로그램도 곧 이곳에 소개됩니다."
              }
              action={
                viewer ? undefined : (
                  <Link href={`${base}/auth/login`} className={buttonVariants({ variant: "secondary" })}>
                    로그인
                  </Link>
                )
              }
            />
          )}
        </div>
      </section>
    ),
    // ④ 신규·인기
    popular: hasCourses ? (
      <section className="section-y bg-surface">
        <div className="container-page">
          <SectionHeader size="lg" title="지금 많이 듣는 프로그램" action={<MoreLink href={catalog} />} />
          <Tabs
            ariaLabel="프로그램 정렬"
            items={[
              { key: "popular", label: "인기", content: <CourseRow items={home.popular.slice(0, 4)} locale={locale} /> },
              { key: "newest", label: "신규", content: <CourseRow items={home.newest.slice(0, 4)} locale={locale} /> },
              {
                key: "cert",
                label: "인증 과정",
                content: home.certification.length ? (
                  <CourseRow items={home.certification.slice(0, 4)} locale={locale} />
                ) : (
                  <EmptyState
                    icon={<ShieldCheck />}
                    title="열려 있는 인증 과정이 아직 없어요"
                    description="바야다 인증과정이 개설되면 이곳에서 가장 먼저 소개해 드릴게요."
                    action={
                      <Link href={catalog} className={buttonVariants({ variant: "secondary" })}>
                        전체 프로그램 보기
                      </Link>
                    }
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
        <section className="section-y">
          <div className="container-page">
            <SectionHeader
              size="lg"
              title="해외 진출 · 국내 커리어"
              description="국가·직군별 커리어 경로를 단계별로 안내해 드려요."
              action={<MoreLink href={`${base}/pathways`} />}
            />
            <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4 lg:gap-6">
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
        <section aria-labelledby="partners-title" className="py-12">
          <div className="container-page">
            <p id="partners-title" className="text-center text-body-sm font-semibold text-muted">
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
        <section className="section-y">
          <div className="container-page">
            <SectionHeader size="lg" title="주제별로 찾아보기" action={<MoreLink href={catalog}>전체 프로그램</MoreLink>} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
              {taxonomy.categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`${catalog}?category=${encodeURIComponent(c.slug)}`}
                  className="lift group flex items-center gap-3 rounded-xl border border-line bg-canvas p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-soft [&_svg]:h-5 [&_svg]:w-5">
                    {categoryIcon(c.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-body-sm font-semibold text-ink">{c.name}</span>
                    {c.count > 0 && <span className="block text-caption text-muted">{c.count}개 프로그램</span>}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null,
    // ⑧ 업셀 — 아카데미 패스(판매 중인 요금제가 있을 때만) + 기관 도입. 어두운 블록·블러 장식 대신 옅은 면 두 장
    upsell: (
      <section id="org" className="scroll-mt-20 py-8 md:py-10">
        <div className={cn("container-page", passPromo && "grid gap-4 lg:grid-cols-2 lg:gap-6")}>
          {passPromo && (
            <div className="flex flex-col justify-between gap-8 rounded-xl bg-surface px-7 py-9 md:px-10 md:py-11">
              <div className="max-w-xl">
                <p className="inline-flex items-center gap-2 text-body-sm font-semibold text-muted">
                  <InfinityIcon className="h-4 w-4" aria-hidden /> 아카데미 패스
                </p>
                <h2 className="mt-3 text-h2 text-ink">패스 하나로 마음껏 배우세요</h2>
                <p className="mt-2 text-body text-muted">
                  {passPromo.includes} 무제한 수강 · {passPromo.minPrice.toLocaleString("ko-KR")}원부터
                </p>
              </div>
              <Link href={`${base}/pass`} className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "self-start")}>
                패스 알아보기 <ArrowRight aria-hidden />
              </Link>
            </div>
          )}
          <div
            className={cn(
              "flex flex-col gap-8 rounded-xl bg-surface px-7 py-9 md:px-10 md:py-11",
              !passPromo && "md:flex-row md:items-center md:justify-between",
            )}
          >
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 text-body-sm font-semibold text-muted">
                <Building2 className="h-4 w-4" aria-hidden /> 기관·센터
              </p>
              <h2 className="mt-3 text-h2 text-ink">우리 센터 직원 교육, 바야다 아카데미로</h2>
              <p className="mt-2 text-body text-muted">
                직원 단체 수강과 교육 운영이 필요하신가요? 담당자가 기관 상황에 맞는 도입 방법을 안내해 드려요.
              </p>
            </div>
            <a href={inquiry} className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "self-start md:self-auto")}>
              기관 도입 문의 <ArrowRight aria-hidden />
            </a>
          </div>
        </div>
      </section>
    ),
    // ⑨ 성과 지표 — 테두리 없이 큰 숫자
    stats:
      stats.length > 0 ? (
        <section className="section-y">
          <div className="container-page">
            <SectionHeader size="lg" title="숫자로 보는 바야다 아카데미" description="지금까지 함께 배우고 수료한 기록이에요." />
            <dl
              className={cn(
                "grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8",
                stats.length >= 4 ? "lg:grid-cols-4" : stats.length === 3 ? "lg:grid-cols-3" : "",
              )}
            >
              {stats.map((st) => (
                <div key={st.label}>
                  <dt className="text-body-sm font-medium text-muted">{st.label}</dt>
                  <dd className="mt-2 flex items-baseline gap-1 text-ink">
                    <span className="tabular text-[36px] font-bold leading-none tracking-[-0.03em] md:text-[44px]">
                      <CountUp value={st.value} />
                    </span>
                    <span className="text-body font-semibold text-ink-soft">{st.unit}</span>
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
        <section className="section-y">
          <div className="container-page">
            <SectionHeader size="lg" title="수강생 후기" description="진도 80% 이상 학습한 수강생이 직접 남긴 이야기예요." />
            <ReviewCarousel count={reviews.length}>
              {reviews.map((r) => (
                <div key={r.id} className="w-[84%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-2.5rem)/3)]">
                  <ReviewCard
                    review={r}
                    clamp
                    heading={
                      <Link
                        href={`${catalog}/${encodeURIComponent(r.course.slug)}#reviews`}
                        className="mb-3 line-clamp-1 text-caption font-semibold text-muted hover:text-ink"
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
      <section id="faq" className="section-y scroll-mt-20">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <SectionHeader size="lg" title={faq.title} description={faq.subtitle || undefined} className="items-start" />
          <Accordion
            items={faq.items.map((it) => ({
              title: it.q,
              content: <p className="whitespace-pre-line leading-relaxed">{it.a}</p>,
            }))}
          />
        </div>
      </section>
    ) : null,
  };
  const { order, hidden } = settings["home.sections"];

  return (
    <>
      {/* ② 히어로 — 문장 2줄 + 주요 버튼 1개 + 보조 버튼 1개. 배경 장식 없음 */}
      <section className="border-b border-line">
        <div className="container-page grid items-center gap-10 py-12 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            {hero.eyebrow && <p className="text-body-sm font-semibold text-brand-700">{hero.eyebrow}</p>}
            <h1 className="mt-4 text-[34px] font-bold leading-[1.2] tracking-[-0.03em] text-ink md:text-display">
              {hero.title.split(/\r?\n/).map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </h1>
            <p className="mt-5 max-w-md text-body-lg text-muted">{hero.subtitle}</p>
            {heroCtas.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {heroCtas.map((c) => (
                  <Link
                    key={c.primary ? "primary" : "secondary"}
                    href={resolveHref(c.href, locale)}
                    className={buttonVariants({ variant: c.primary ? "primary" : "secondary", size: "lg" })}
                  >
                    {c.label}
                    {c.primary && <ArrowRight aria-hidden />}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="lg:h-[400px]">
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
              <div className="flex h-full flex-col rounded-xl border border-line bg-canvas p-3">
                <p className="flex items-center justify-between px-3 pb-2 pt-2 text-body-sm font-semibold text-ink">
                  지금 많이 듣는 프로그램
                  <Link href={`${catalog}?sort=popular`} className="text-caption font-semibold text-muted hover:text-ink">
                    더 보기
                  </Link>
                </p>
                <ol className="flex flex-1 flex-col">
                  {heroCourses.map((c, i) => (
                    <li key={c.id} className="flex-1">
                      <Link
                        href={`${catalog}/${encodeURIComponent(c.slug)}`}
                        className="group flex h-full items-center gap-4 rounded-xl p-3 transition-colors hover:bg-surface"
                      >
                        <span className="tabular w-4 shrink-0 text-center text-title font-bold text-ink-soft">{i + 1}</span>
                        <span className="block aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-surface-sunken sm:w-36">
                          <CourseThumb src={c.thumbnail} title={c.title} label={c.category?.name} />
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-body font-semibold leading-snug text-ink underline-offset-4 group-hover:underline">
                            {c.title}
                          </span>
                          <span className="mt-1 block text-caption text-muted">
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
              <div className="grid h-full grid-cols-2 gap-3">
                {taxonomy.categories.slice(0, 4).map((c) => (
                  <Link
                    key={c.slug}
                    href={`${catalog}?category=${encodeURIComponent(c.slug)}`}
                    className="lift flex min-h-[140px] flex-col justify-between rounded-xl border border-line bg-canvas p-6 text-ink"
                  >
                    <span className="text-ink-soft">{categoryIcon(c.name)}</span>
                    <span className="text-title font-bold">{c.name}</span>
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
