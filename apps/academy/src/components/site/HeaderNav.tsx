"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Award,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  Compass,
  LogOut,
  Menu,
  Receipt,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { COVER_PALETTES, categoryTone } from "@bayada/ui/cover";
import { JOB_ROLES, JOB_ROLE_LABEL, PRODUCT_TYPES, PRODUCT_TYPE_LABEL } from "@/lib/labels";
import { Avatar, Sheet, buttonVariants, cn } from "@bayada/ui";

interface TaxItem {
  name: string;
  slug: string;
  count: number;
}

interface Props {
  locale: string;
  user: { name: string; email: string; canManageOrg: boolean } | null;
  /** 판매 중인 아카데미 패스 요금제가 있을 때만 메뉴 노출 */
  hasPass?: boolean;
  /** 홈 업셀(#org)·FAQ(#faq) 섹션이 사이트 설정에서 보일 때만 바로가기 링크를 보인다 */
  showOrg?: boolean;
  showFaq?: boolean;
  categories: TaxItem[];
  providers: TaxItem[];
}

export function HeaderNav({ locale, user, categories, providers, hasPass = false, showOrg = true, showFaq = true }: Props) {
  const pathname = usePathname() ?? "";
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [careerOpen, setCareerOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const careerRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const base = `/${locale}`;

  // 페이지 이동 시 열린 메뉴 닫기
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
    setUserOpen(false);
    setCareerOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
      if (careerRef.current && !careerRef.current.contains(e.target as Node)) setCareerOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setCareerOpen(false);
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const catalog = `${base}/courses`;
  const visibleCategories = categories.filter((c) => c.count > 0);
  const visibleProviders = providers.filter((p) => p.count > 0);
  const columns = [
    {
      title: "직군별",
      items: JOB_ROLES.map((r) => ({ label: JOB_ROLE_LABEL[r], href: `${catalog}?audience=${r}`, dot: null as string | null })),
    },
    {
      title: "분야별",
      items: visibleCategories.map((c) => ({
        label: c.name,
        href: `${catalog}?category=${encodeURIComponent(c.slug)}`,
        dot: COVER_PALETTES[categoryTone(c.slug)].bg,
      })),
    },
    {
      title: "유형별",
      items: PRODUCT_TYPES.map((t) => ({ label: PRODUCT_TYPE_LABEL[t], href: `${catalog}?type=${t}`, dot: null })),
    },
    {
      title: "제공기관별",
      items: visibleProviders.map((p) => ({ label: p.name, href: `${catalog}?provider=${encodeURIComponent(p.slug)}`, dot: null })),
    },
  ].filter((col) => col.items.length > 0);

  const isCatalog = pathname.startsWith(catalog);
  // 인증·커리어 메뉴 (바야다 인증 · 인증과정 프로그램 · 커리어 패스웨이)
  const careerLinks = [
    { label: "바야다 인증", desc: "인증 과정 안내와 신청", href: `${base}/certifications`, icon: ShieldCheck },
    { label: "인증과정 프로그램", desc: "인증 준비 학습 프로그램", href: `${catalog}?type=CERTIFICATION`, icon: Award },
    { label: "커리어 패스웨이", desc: "국가·직군별 커리어 경로", href: `${base}/pathways`, icon: Compass },
  ];
  const isCareer = pathname.startsWith(`${base}/certifications`) || pathname.startsWith(`${base}/pathways`);
  const isMyLearning = pathname.startsWith(`${base}/dashboard`) || pathname.startsWith(`${base}/orders`);
  const accountLinks = user
    ? [
        { label: "마이 러닝", href: `${base}/dashboard`, icon: BookOpen },
        { label: "인증서", href: `${base}/dashboard/certificates`, icon: Award },
        { label: "결제 내역", href: `${base}/orders`, icon: Receipt },
        { label: "프로필", href: `${base}/dashboard/profile`, icon: UserRound },
        ...(user.canManageOrg ? [{ label: "기관 대시보드", href: `${base}/business`, icon: Building2 }] : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-header border-b border-line-soft bg-canvas/90 backdrop-blur-md print:hidden">
      <div className="container-page flex h-16 items-center gap-3 lg:h-[72px] lg:gap-6">
        <Link href={base} className="flex shrink-0 items-baseline gap-1.5 rounded-lg" aria-label="BAYADA Academy 홈">
          <span className="text-[20px] font-black tracking-[-0.02em] text-brand">BAYADA</span>
          <span className="text-body font-bold tracking-tight text-ink">Academy</span>
        </Link>

        <nav aria-label="주요 메뉴" className="hidden items-center gap-1 lg:flex">
          <div ref={megaRef} className="relative" onMouseLeave={() => setMegaOpen(false)}>
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-haspopup="true"
              onClick={() => setMegaOpen((v) => !v)}
              onMouseEnter={() => setMegaOpen(true)}
              className={navPill(megaOpen || isCatalog)}
            >
              프로그램
              <ChevronDown className={cn("h-4 w-4 transition-transform", megaOpen && "rotate-180")} aria-hidden />
            </button>
            {megaOpen && (
              <div className="absolute left-0 top-full z-dropdown pt-3">
                <div className="animate-pop-in w-[780px] rounded-[22px] border border-line bg-canvas p-6 shadow-lg">
                  <div className="grid grid-cols-4 gap-6">
                    {columns.map((col) => (
                      <div key={col.title}>
                        <p className="mb-2 px-2 text-caption font-bold text-subtle">{col.title}</p>
                        <ul>
                          {col.items.map((it) => (
                            <li key={it.href}>
                              <Link
                                href={it.href}
                                className="flex items-center gap-2 rounded-xl px-2 py-2 text-body-sm font-medium text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink"
                              >
                                {it.dot && <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: it.dot }} />}
                                {it.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={catalog}
                    className="mt-5 flex items-center justify-between rounded-2xl bg-surface-sunken px-5 py-4 transition-colors hover:bg-neutral-200"
                  >
                    <span>
                      <span className="block text-body-sm font-bold text-ink">전체 프로그램 보기</span>
                      <span className="block text-caption text-muted">직군·분야·난이도로 원하는 교육을 찾아보세요</span>
                    </span>
                    <ChevronRight className="h-5 w-5 text-ink" aria-hidden />
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link href={`${base}#roles`} className={navPill(false)}>
            직군별 학습
          </Link>
          <div ref={careerRef} className="relative" onMouseLeave={() => setCareerOpen(false)}>
            <button
              type="button"
              aria-expanded={careerOpen}
              aria-haspopup="true"
              onClick={() => setCareerOpen((v) => !v)}
              onMouseEnter={() => setCareerOpen(true)}
              className={navPill(careerOpen || isCareer)}
            >
              인증·커리어
              <ChevronDown className={cn("h-4 w-4 transition-transform", careerOpen && "rotate-180")} aria-hidden />
            </button>
            {careerOpen && (
              <div className="absolute left-0 top-full z-dropdown pt-3">
                <ul className="animate-pop-in w-72 rounded-[22px] border border-line bg-canvas p-2 shadow-lg">
                  {careerLinks.map((it) => (
                    <li key={it.href}>
                      <Link href={it.href} className="flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-surface-sunken">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                          <it.icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span>
                          <span className="block text-body-sm font-bold text-ink">{it.label}</span>
                          <span className="mt-0.5 block text-caption text-muted">{it.desc}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {hasPass && (
            <Link href={`${base}/pass`} aria-current={pathname === `${base}/pass` ? "page" : undefined} className={navPill(pathname === `${base}/pass`)}>
              아카데미 패스
            </Link>
          )}
          {user?.canManageOrg ? (
            <Link
              href={`${base}/business`}
              aria-current={pathname.startsWith(`${base}/business`) ? "page" : undefined}
              className={navPill(pathname.startsWith(`${base}/business`))}
            >
              <Building2 className="h-4 w-4" aria-hidden />
              기관 대시보드
            </Link>
          ) : (
            showOrg && (
              <Link href={`${base}#org`} className={navPill(false)}>
                기관·센터
              </Link>
            )
          )}
        </nav>

        <form action={catalog} role="search" className="ml-auto hidden flex-1 justify-end md:flex">
          <label className="relative w-full max-w-[260px]">
            <span className="sr-only">프로그램 검색</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              name="q"
              type="search"
              placeholder="프로그램 검색"
              className="h-10 w-full rounded-full border border-transparent bg-surface-sunken pl-10 pr-4 text-body-sm text-ink outline-none transition-colors placeholder:text-subtle hover:bg-neutral-200 focus:border-ink focus:bg-canvas"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          {user ? (
            <>
              <Link
                href={`${base}/dashboard`}
                aria-current={isMyLearning ? "page" : undefined}
                className={cn(navPill(isMyLearning), "hidden md:inline-flex")}
              >
                마이 러닝
              </Link>
              <div ref={userRef} className="relative hidden md:block">
                <button
                  type="button"
                  aria-expanded={userOpen}
                  aria-haspopup="true"
                  aria-label={`${user.name} 계정 메뉴`}
                  onClick={() => setUserOpen((v) => !v)}
                  className="flex h-10 items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-body-sm font-semibold text-ink transition-colors hover:bg-surface-sunken"
                >
                  <Avatar name={user.name} size="sm" />
                  <ChevronDown className={cn("h-3.5 w-3.5 text-muted transition-transform", userOpen && "rotate-180")} aria-hidden />
                </button>
                {userOpen && (
                  <div className="animate-pop-in absolute right-0 top-full z-dropdown mt-2 w-64 overflow-hidden rounded-[22px] border border-line bg-canvas p-2 shadow-lg">
                    <div className="flex items-center gap-3 px-3 pb-3 pt-2">
                      <Avatar name={user.name} />
                      <div className="min-w-0">
                        <p className="truncate text-body-sm font-bold text-ink">{user.name}</p>
                        <p className="truncate text-caption text-muted">{user.email}</p>
                      </div>
                    </div>
                    <div className="border-t border-line-soft pt-1.5">
                      {accountLinks.map((it) => (
                        <Link
                          key={it.href}
                          href={it.href}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-body-sm font-medium text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink"
                        >
                          <it.icon className="h-4 w-4 text-subtle" aria-hidden />
                          {it.label}
                        </Link>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: base })}
                      className="mt-1.5 flex w-full items-center gap-2.5 rounded-xl border-t border-line-soft px-3 py-2.5 text-left text-body-sm font-medium text-muted transition-colors hover:bg-surface-sunken hover:text-ink"
                    >
                      <LogOut className="h-4 w-4" aria-hidden /> 로그아웃
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-1.5 md:flex">
              <Link href={`${base}/auth/login`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                로그인
              </Link>
              <Link href={`${base}/auth/register`} className={buttonVariants({ variant: "primary", size: "sm" })}>
                무료 가입
              </Link>
            </div>
          )}
          {/* 모바일: 검색 아이콘 + 메뉴 서랍 */}
          <Link
            href={catalog}
            aria-label="프로그램 검색"
            className="flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-sunken md:hidden"
          >
            <Search className="h-5 w-5" aria-hidden />
          </Link>
          <button
            type="button"
            aria-label="메뉴 열기"
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            onClick={() => setMobileOpen(true)}
            className="flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-sunken lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 서랍 */}
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} side="right" aria-label="전체 메뉴">
        <div className="flex flex-col gap-6 pb-4">
          {user ? (
            <div className="flex items-center gap-3 rounded-2xl bg-surface-sunken p-4">
              <Avatar name={user.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-bold text-ink">{user.name}</p>
                <p className="truncate text-caption text-muted">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-brand-50 p-4">
              <p className="text-body-sm font-bold text-ink">로그인하고 학습을 이어가세요</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link href={`${base}/auth/login`} className={buttonVariants({ variant: "outline", fullWidth: true })}>
                  로그인
                </Link>
                <Link href={`${base}/auth/register`} className={buttonVariants({ variant: "primary", fullWidth: true })}>
                  무료 가입
                </Link>
              </div>
            </div>
          )}

          <form action={catalog} role="search">
            <label className="relative block">
              <span className="sr-only">프로그램 검색</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                name="q"
                type="search"
                placeholder="프로그램·분야 검색"
                className="h-12 w-full rounded-full border border-transparent bg-surface-sunken pl-11 pr-4 text-body text-ink outline-none placeholder:text-subtle focus:border-ink focus:bg-canvas"
              />
            </label>
          </form>

          <nav aria-label="모바일 메뉴" className="flex flex-col">
            {[
              { label: "전체 프로그램", href: catalog, active: isCatalog },
              ...(user ? [{ label: "마이 러닝", href: `${base}/dashboard`, active: isMyLearning }] : []),
              { label: "직군별 학습", href: `${base}#roles`, active: false },
              ...careerLinks.map((it) => ({ label: it.label, href: it.href, active: pathname.startsWith(it.href) })),
              ...(hasPass ? [{ label: "아카데미 패스", href: `${base}/pass`, active: pathname === `${base}/pass` }] : []),
              ...(showOrg && !user?.canManageOrg ? [{ label: "기관·센터", href: `${base}#org`, active: false }] : []),
              ...(showFaq ? [{ label: "자주 묻는 질문", href: `${base}#faq`, active: false }] : []),
            ].map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setMobileOpen(false)}
                aria-current={it.active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-3 text-body font-bold transition-colors",
                  it.active ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-surface-sunken",
                )}
              >
                {it.label}
                <ChevronRight className="h-4 w-4 text-subtle" aria-hidden />
              </Link>
            ))}
          </nav>

          {columns.slice(0, 2).map((col) => (
            <div key={col.title}>
              <p className="mb-2 px-3 text-caption font-bold text-subtle">{col.title}</p>
              <div className="flex flex-wrap gap-1.5 px-1">
                {col.items.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface-sunken px-3.5 text-body-sm font-medium text-ink-soft"
                  >
                    {it.dot && <span aria-hidden className="size-2 rounded-full" style={{ background: it.dot }} />}
                    {it.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {user && (
            <div className="border-t border-line-soft pt-4">
              {accountLinks.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-body-sm font-medium text-ink-soft hover:bg-surface-sunken"
                >
                  <it.icon className="h-4 w-4 text-subtle" aria-hidden />
                  {it.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: base })}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-body-sm font-medium text-muted hover:bg-surface-sunken"
              >
                <LogOut className="h-4 w-4" aria-hidden /> 로그아웃
              </button>
            </div>
          )}
        </div>
      </Sheet>
    </header>
  );
}

/** GNB 항목: 알약. 현재 위치면 브랜드 옅은 면 + 진한 레드 글자 (레드 = 현재 위치) */
function navPill(active: boolean) {
  return cn(
    "inline-flex h-10 items-center gap-1 rounded-full px-4 text-body-sm font-bold transition-colors",
    active ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-surface-sunken hover:text-ink",
  );
}
