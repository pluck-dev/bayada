import Link from "next/link";
import { BookOpen, Mail, Phone } from "lucide-react";

export function Footer({ locale }: { locale: string }) {
  return (
    <footer className="border-t border-gray-200/50 bg-white">
      {/* CTA 배너 */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                BAYADA Academy 소식을 받아보세요
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                신규 강의, 무료 교육, 이벤트 소식을 가장 먼저 알려드립니다.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <input
                type="email"
                placeholder="이메일 주소"
                className="h-11 flex-1 sm:w-64 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition-all focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10"
              />
              <button className="h-11 rounded-xl bg-gray-900 px-6 text-sm font-semibold text-white transition-all hover:bg-black whitespace-nowrap">
                구독하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 Footer */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* 브랜드 */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)]">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                BAYADA <span className="text-[var(--brand-primary)]">Academy</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              BAYADA의 온라인 교육 플랫폼입니다.
              <br />
              역량 강화를 위한 다양한 강의를 만나보세요.
            </p>

            {/* 소셜 아이콘 */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-gray-900 hover:text-white"
                aria-label="YouTube"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-gray-900 hover:text-white"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-gray-900 hover:text-white"
                aria-label="Blog"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.199 24C19.199 13.467 10.533 4.8 0 4.8V0c13.165 0 24 10.835 24 24h-4.801zM3.291 17.415a3.3 3.3 0 0 1 3.293 3.295A3.303 3.303 0 0 1 3.283 24C1.47 24 0 22.526 0 20.71s1.475-3.295 3.291-3.295zM15.909 24h-4.665c0-6.169-5.075-11.245-11.244-11.245V8.09c8.727 0 15.909 7.184 15.909 15.91z" />
                </svg>
              </a>
            </div>
          </div>

          {/* 강의 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              강의
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`/${locale}/courses`}
                  className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  전체 강의
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/courses?category=nursing`}
                  className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  간호 교육
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/courses?category=safety`}
                  className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  안전 교육
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/courses?category=compliance`}
                  className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  법정 필수 교육
                </Link>
              </li>
            </ul>
          </div>

          {/* 학습 지원 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              학습 지원
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`/${locale}/dashboard`}
                  className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  내 학습
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/orders`}
                  className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  주문 내역
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/cart`}
                  className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  장바구니
                </Link>
              </li>
            </ul>
          </div>

          {/* 회사 정보 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              BAYADA
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="text-sm text-gray-500">
                BAYADA Home Health Care
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-3.5 w-3.5" />
                1588-0000
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-3.5 w-3.5" />
                support@bayada.co.kr
              </li>
              <li className="text-sm text-gray-500">
                평일 09:00 - 18:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-gray-100 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} BAYADA Home Health Care. All
              rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-xs text-gray-400 transition-colors hover:text-gray-900"
              >
                이용약관
              </Link>
              <Link
                href="#"
                className="text-xs text-gray-400 transition-colors hover:text-gray-900"
              >
                개인정보처리방침
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
