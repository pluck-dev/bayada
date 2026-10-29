"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { Building2, ChevronDown, LogOut, Menu, Search, X } from "lucide-react";
import { JOB_ROLES, JOB_ROLE_LABEL, PRODUCT_TYPES, PRODUCT_TYPE_LABEL } from "@/lib/labels";

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
  const pathname = usePathname();
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
        setMobileOpen(false);
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
  const columns = [
    {
      title: "직군별",
      items: JOB_ROLES.map((r) => ({ label: JOB_ROLE_LABEL[r], href: `${catalog}?audience=${r}` })),
    },
    {
      title: "주제별",
      items: categories.map((c) => ({ label: c.name, href: `${catalog}?category=${encodeURIComponent(c.slug)}` })),
    },
    {
      title: "상품유형별",
      items: PRODUCT_TYPES.map((t) => ({ label: PRODUCT_TYPE_LABEL[t], href: `${catalog}?type=${t}` })),
    },
    {
      title: "제공기관별",
      items: providers.map((p) => ({ label: p.name, href: `${catalog}?provider=${encodeURIComponent(p.slug)}` })),
    },
  ];

  const isCatalog = pathname?.startsWith(catalog);
  // 인증·커리어 메뉴 (바야다 인증 · 인증과정 프로그램 · 커리어 패스웨이)
  const careerLinks = [
    { label: "바야다 인증", desc: "인증 과정 안내와 신청", href: `${base}/certifications` },
    { label: "인증과정 프로그램", desc: "인증 준비 학습 프로그램", href: `${catalog}?type=CERTIFICATION` },
    { label: "커리어 패스웨이", desc: "국가·직군별 커리어 경로", href: `${base}/pathways` },
  ];
  const isCareer = pathname?.startsWith(`${base}/certifications`) || pathname?.startsWith(`${base}/pathways`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md print:hidden">
      {/* 유틸리티 바 */}
      <div className="hidden border-b border-line-soft bg-surface md:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <nav aria-label="이용자 구분" className="flex items-center gap-1">
            <Link href={base} className="rounded-md px-2 py-1 font-semibold text-ink">
              개인
            </Link>
            {showOrg && (
              <Link href={`${base}#org`} className="rounded-md px-2 py-1 text-muted hover:text-ink">
                기관·센터
              </Link>
            )}
          </nav>
          {showFaq && (
            <Link href={`${base}#faq`} className="text-muted hover:text-ink">
              자주 묻는 질문
            </Link>
          )}
        </div>
      </div>

      {/* GNB */}
      <div className="container-page flex h-16 items-center gap-6">
        <Link href={base} className="flex shrink-0 items-baseline gap-1.5" aria-label="BAYADA Academy 홈">
          <span className="text-[19px] font-extrabold tracking-tight text-brand">BAYADA</span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">Academy</span>
        </Link>

        <nav aria-label="주요 메뉴" className="hidden items-center gap-1 lg:flex">
          <div ref={megaRef} className="relative" onMouseLeave={() => setMegaOpen(false)}>
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-haspopup="true"
              onClick={() => setMegaOpen((v) => !v)}
              onMouseEnter={() => setMegaOpen(true)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-[15px] font-semibold transition-colors hover:bg-line-soft ${
                megaOpen || isCatalog ? "text-ink" : "text-ink-soft"
              }`}
            >
              탐색
              <ChevronDown className={`h-4 w-4 transition-transform ${megaOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {megaOpen && (
              <div className="absolute left-0 top-full pt-2">
                <div className="grid w-[760px] grid-cols-4 gap-6 rounded-2xl border border-line bg-white p-6 shadow-lift">
                  {columns.map((col) => (
                    <div key={col.title}>
                      <p className="mb-3 text-xs font-semibold text-muted">{col.title}</p>
                      <ul className="space-y-1">
                        {col.items.map((it) => (
                          <li key={it.href}>
                            <Link
                              href={it.href}
                              className="block rounded-md py-1 text-sm text-ink-soft transition-colors hover:text-brand"
                            >
                              {it.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="col-span-4 flex items-center justify-between border-t border-line-soft pt-4">
                    <span className="text-xs text-muted">원하는 조건으로 바로 찾아보세요</span>
                    <Link href={catalog} className="text-sm font-semibold text-ink hover:text-brand">
                      전체 프로그램 보기 →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link
            href={`${base}#roles`}
            className="rounded-lg px-3 py-2 text-[15px] font-semibold text-ink-soft transition-colors hover:bg-line-soft hover:text-ink"
          >
            직군별 학습
          </Link>
          <div ref={careerRef} className="relative" onMouseLeave={() => setCareerOpen(false)}>
            <button
              type="button"
              aria-expanded={careerOpen}
              aria-haspopup="true"
              onClick={() => setCareerOpen((v) => !v)}
              onMouseEnter={() => setCareerOpen(true)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-[15px] font-semibold transition-colors hover:bg-line-soft ${
                careerOpen || isCareer ? "text-ink" : "text-ink-soft"
              }`}
            >
              인증·커리어
              <ChevronDown className={`h-4 w-4 transition-transform ${careerOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {careerOpen && (
              <div className="absolute left-0 top-full pt-2">
                <ul className="w-64 rounded-2xl border border-line bg-white p-2 shadow-lift">
                  {careerLinks.map((it) => (
                    <li key={it.href}>
                      <Link href={it.href} className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-surface">
                        <span className="block text-sm font-semibold text-ink">{it.label}</span>
                        <span className="mt-0.5 block text-xs text-muted">{it.desc}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {hasPass && (
            <Link
              href={`${base}/pass`}
              aria-current={pathname === `${base}/pass` ? "page" : undefined}
              className="rounded-lg px-3 py-2 text-[15px] font-semibold text-ink-soft transition-colors hover:bg-line-soft hover:text-ink aria-[current=page]:text-ink"
            >
              아카데미 패스
            </Link>
          )}
          {user?.canManageOrg && (
            <Link
              href={`${base}/business`}
              aria-current={pathname?.startsWith(`${base}/business`) ? "page" : undefined}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[15px] font-semibold text-ink-soft transition-colors hover:bg-line-soft hover:text-ink aria-[current=page]:text-ink"
            >
              <Building2 className="h-4 w-4 text-brand" aria-hidden />
              기관 대시보드
            </Link>
          )}
        </nav>

        <form action={catalog} role="search" className="ml-auto hidden flex-1 justify-end md:flex">
          <label className="relative w-full max-w-[300px]">
            <span className="sr-only">프로그램 검색</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
            <input
              name="q"
              type="search"
              placeholder="프로그램·주제 검색"
              className="h-10 w-full rounded-full border border-line bg-surface pl-9 pr-4 text-sm text-ink placeholder:text-subtle transition-colors focus:border-ink focus:bg-white focus:outline-none"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {user ? (
            <div ref={userRef} className="relative hidden md:block">
              <button
                type="button"
                aria-expanded={userOpen}
                onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm font-medium text-ink hover:border-ink-soft"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  {user.name.charAt(0)}
                </span>
                <span className="max-w-[96px] truncate">{user.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden />
              </button>
              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-lift">
                  <div className="border-b border-line-soft px-4 pb-3 pt-1">
                    <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  {[
                    ["마이 러닝", `${base}/dashboard`],
                    ["인증서", `${base}/dashboard/certificates`],
                    ["결제 내역", `${base}/orders`],
                    ["프로필", `${base}/dashboard/profile`],
                    ...(user.canManageOrg ? [["기관 대시보드", `${base}/business`]] : []),
                  ].map(([label, href]) => (
                    <Link key={href} href={href} className="block px-4 py-2 text-sm text-ink-soft hover:bg-surface hover:text-ink">
                      {label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: base })}
                    className="flex w-full items-center gap-2 border-t border-line-soft px-4 py-2 pt-3 text-left text-sm text-muted hover:text-ink"
                  >
                    <LogOut className="h-4 w-4" aria-hidden /> 로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href={`${base}/auth/login`}
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
              >
                로그인
              </Link>
              <Link
                href={`${base}/auth/register`}
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
              >
                무료 가입
              </Link>
            </div>
          )}
          <button
            type="button"
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-line-soft lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileOpen && (
        <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-line bg-white lg:hidden">
          <div className="container-page space-y-6 py-5">
            <form action={catalog} role="search" className="md:hidden">
              <label className="relative block">
                <span className="sr-only">프로그램 검색</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
                <input
                  name="q"
                  type="search"
                  placeholder="프로그램·주제 검색"
                  className="h-11 w-full rounded-full border border-line bg-surface pl-9 pr-4 text-sm focus:border-ink focus:outline-none"
                />
              </label>
            </form>
            <div className="flex flex-col">
              <Link href={catalog} className="py-2 text-base font-semibold text-ink">
                전체 프로그램
              </Link>
              <Link href={`${base}#roles`} className="py-2 text-base font-semibold text-ink">
                직군별 학습
              </Link>
              {careerLinks.map((it) => (
                <Link key={it.href} href={it.href} className="py-2 text-base font-semibold text-ink">
                  {it.label}
                </Link>
              ))}
              {hasPass && (
                <Link href={`${base}/pass`} className="py-2 text-base font-semibold text-ink">
                  아카데미 패스
                </Link>
              )}
              {showOrg && (
                <Link href={`${base}#org`} className="py-2 text-base font-semibold text-ink">
                  기관·센터
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-5 border-t border-line-soft pt-5">
              {columns.slice(0, 2).map((col) => (
                <div key={col.title}>
                  <p className="mb-2 text-xs font-semibold text-muted">{col.title}</p>
                  {col.items.map((it) => (
                    <Link key={it.href} href={it.href} className="block py-1 text-sm text-ink-soft">
                      {it.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <div className="border-t border-line-soft pt-5">
              {user ? (
                <div className="flex flex-col gap-1">
                  <Link href={`${base}/dashboard`} className="py-2 text-sm font-medium text-ink">
                    마이 러닝
                  </Link>
                  <Link href={`${base}/dashboard/certificates`} className="py-2 text-sm font-medium text-ink">
                    인증서
                  </Link>
                  <Link href={`${base}/orders`} className="py-2 text-sm font-medium text-ink">
                    결제 내역
                  </Link>
                  <Link href={`${base}/dashboard/profile`} className="py-2 text-sm font-medium text-ink">
                    프로필
                  </Link>
                  {user.canManageOrg && (
                    <Link href={`${base}/business`} className="py-2 text-sm font-medium text-ink">
                      기관 대시보드
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: base })}
                    className="py-2 text-left text-sm text-muted"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`${base}/auth/login`}
                    className="rounded-full border border-line py-2.5 text-center text-sm font-semibold text-ink"
                  >
                    로그인
                  </Link>
                  <Link
                    href={`${base}/auth/register`}
                    className="rounded-full bg-ink py-2.5 text-center text-sm font-semibold text-white"
                  >
                    무료 가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
