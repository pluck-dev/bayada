import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer({ locale }: { locale: string }) {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* 브랜드 */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--brand)]">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                BAYADA <span className="text-[color:var(--brand)]">Academy</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              BAYADA의 온라인 교육 플랫폼입니다.
              <br />
              역량 강화를 위한 다양한 강의를 만나보세요.
            </p>
          </div>

          {/* 강의 */}
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--fg)]">
              강의
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href={`/${locale}/courses`}
                  className="text-sm text-[color:var(--muted)] hover:text-[color:var(--fg)]"
                >
                  전체 강의
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/courses?category=nursing`}
                  className="text-sm text-[color:var(--muted)] hover:text-[color:var(--fg)]"
                >
                  간호 교육
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/courses?category=safety`}
                  className="text-sm text-[color:var(--muted)] hover:text-[color:var(--fg)]"
                >
                  안전 교육
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/courses?category=compliance`}
                  className="text-sm text-[color:var(--muted)] hover:text-[color:var(--fg)]"
                >
                  법정 필수 교육
                </Link>
              </li>
            </ul>
          </div>

          {/* 학습 지원 */}
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--fg)]">
              학습 지원
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href={`/${locale}/dashboard`}
                  className="text-sm text-[color:var(--muted)] hover:text-[color:var(--fg)]"
                >
                  내 학습
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/orders`}
                  className="text-sm text-[color:var(--muted)] hover:text-[color:var(--fg)]"
                >
                  주문 내역
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/cart`}
                  className="text-sm text-[color:var(--muted)] hover:text-[color:var(--fg)]"
                >
                  장바구니
                </Link>
              </li>
            </ul>
          </div>

          {/* 회사 정보 */}
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--fg)]">
              BAYADA
            </h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-[color:var(--muted)]">
                BAYADA Home Health Care
              </li>
              <li className="text-sm text-[color:var(--muted)]">
                고객센터: 1588-0000
              </li>
              <li className="text-sm text-[color:var(--muted)]">
                이메일: support@bayada.co.kr
              </li>
              <li className="text-sm text-[color:var(--muted)]">
                운영시간: 평일 09:00 - 18:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[color:var(--border)] pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-[color:var(--muted)]">
              &copy; {new Date().getFullYear()} BAYADA Home Health Care. All
              rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-xs text-[color:var(--muted)] hover:text-[color:var(--fg)]"
              >
                이용약관
              </Link>
              <Link
                href="#"
                className="text-xs text-[color:var(--muted)] hover:text-[color:var(--fg)]"
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
