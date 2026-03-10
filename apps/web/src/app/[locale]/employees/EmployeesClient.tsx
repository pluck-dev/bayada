"use client";

import Link from "next/link";
import { NeedsReview } from "@/components/shared/NeedsReview";

interface EmployeesClientProps {
  locale: string;
}

export function EmployeesClient({ locale }: EmployeesClientProps) {
  return (
    <>
      {/* 1. Employee Login */}
      <NeedsReview
        label="링크 확인필요"
        note="Office/Field Employee 로그인 URL 확인 후 적용 필요"
      >
        <div>
          <h2 className="text-xl font-bold text-[color:var(--fg)]">
            Employee Login
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            바야다 임직원 계정으로 로그인하여 업무 시스템에 접근하세요. 소속 유형에 맞는 경로를 선택해 주세요.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Office Employee 로그인 */}
            <a
              href="https://www.bayada.com/employees"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-[color:var(--border)] p-6 hover:border-[#ce0e2d] hover:bg-[color:var(--surface)] transition-colors"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]/10">
                <svg className="h-6 w-6 text-[#ce0e2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[color:var(--fg)]">Office Employee</p>
                <p className="mt-0.5 text-sm text-[color:var(--muted)]">BAYADA 이메일 계정으로 로그인</p>
                <p className="mt-0.5 text-xs text-[color:var(--muted)]">사무직 임직원 (BAYADA 이메일 보유자)</p>
              </div>
              <svg className="ml-auto h-5 w-5 text-[color:var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Field Employee 로그인 */}
            <a
              href="https://www.bayada.com/employees"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-[color:var(--border)] p-6 hover:border-[#ce0e2d] hover:bg-[color:var(--surface)] transition-colors"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]/10">
                <svg className="h-6 w-6 text-[#ce0e2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[color:var(--fg)]">Field Employee</p>
                <p className="mt-0.5 text-sm text-[color:var(--muted)]">개인 이메일 계정으로 로그인</p>
                <p className="mt-0.5 text-xs text-[color:var(--muted)]">현장 근무자 (개인 이메일 사용자)</p>
              </div>
              <svg className="ml-auto h-5 w-5 text-[color:var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Okta Help */}
          <div className="mt-4">
            <a
              href="https://www.okta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-5 py-2.5 text-sm font-medium text-[color:var(--fg)] hover:border-[#ce0e2d] hover:bg-[color:var(--surface)] transition-colors"
            >
              <svg className="h-4 w-4 text-[#ce0e2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Okta 로그인 도움말
              <svg className="h-4 w-4 text-[color:var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </NeedsReview>

      {/* 1-1. Support Contacts (지원 연락처) */}
      <NeedsReview
        label="연락처 확인필요"
        note="한국 지사 실제 연락처(이메일/전화번호) 확인 후 적용 필요"
      >
        <div className="mt-12">
          <h2 className="text-xl font-bold text-[color:var(--fg)]">
            지원 연락처
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            업무 관련 문의 사항은 해당 부서로 직접 연락해 주세요.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                title: "복리후생 (Benefits)",
                desc: "4대보험, 복리후생 제도, 휴가 관련 문의",
                email: "benefits@bayada.co.kr",
                phone: "02-0000-0001",
                iconPath: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
              },
              {
                title: "급여 (Payroll)",
                desc: "급여 명세, 원천징수, 급여일 관련 문의",
                email: "payroll@bayada.co.kr",
                phone: "02-0000-0002",
                iconPath: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "IT 지원 (IT Help)",
                desc: "계정, 시스템 접근, 기술 문제 해결 지원",
                email: "it-help@bayada.co.kr",
                phone: "02-0000-0003",
                iconPath: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[color:var(--border)] p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]/10">
                    <svg className="h-5 w-5 text-[#ce0e2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[color:var(--fg)]">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm text-[color:var(--muted)]">{item.desc}</p>
                <div className="mt-4 space-y-1.5">
                  <a href={`mailto:${item.email}`} className="flex items-center gap-2 text-sm text-[#ce0e2d] hover:underline">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {item.email}
                  </a>
                  <a href={`tel:${item.phone}`} className="flex items-center gap-2 text-sm text-[#ce0e2d] hover:underline">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {item.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </NeedsReview>

      {/* 2. Employee Referral */}
      <div className="mt-20">
        <h2 className="text-xl font-bold text-[color:var(--fg)]">Employee Referral</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          바야다를 주변에 알려주세요. 구성원 여러분이 직접 홍보하고, 간편하게 공유할 수 있습니다.
        </p>

        <div className="mt-8 rounded-2xl bg-[color:var(--surface)] p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* 카카오톡 공유 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE500]">
                  <svg className="h-5 w-5 text-[#3A1D1D]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.477 3 2 6.694 2 11.25c0 2.9 1.696 5.45 4.267 7.007L5.2 21.5a.375.375 0 00.544.415l4.03-2.676A11.86 11.86 0 0012 19.5c5.523 0 10-3.694 10-8.25S17.523 3 12 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[color:var(--fg)]">카카오톡으로 공유하기</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                카카오톡 친구에게 바야다홈헬스케어를 소개해보세요.
                한 번의 클릭으로 채용 정보와 서비스 안내를 간편하게 전달할 수 있습니다.
              </p>
              <div className="mt-auto pt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && (window as any).Kakao) {
                      (window as any).Kakao.Share.sendDefault({
                        objectType: "feed",
                        content: {
                          title: "바야다홈헬스케어 채용 추천",
                          description: "믿을 수 있는 홈헬스케어 전문가를 찾고 있습니다. 함께 일해요!",
                          imageUrl: "https://bayada.co.kr/images/og-image.jpg",
                          link: {
                            mobileWebUrl: `https://bayada.co.kr/${locale}/careers`,
                            webUrl: `https://bayada.co.kr/${locale}/careers`,
                          },
                        },
                        buttons: [{ title: "채용 정보 보기", link: { mobileWebUrl: `https://bayada.co.kr/${locale}/careers`, webUrl: `https://bayada.co.kr/${locale}/careers` } }],
                      });
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FEE500] px-6 py-3 text-sm font-semibold text-[#3A1D1D] hover:bg-[#f5db00] transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.477 3 2 6.694 2 11.25c0 2.9 1.696 5.45 4.267 7.007L5.2 21.5a.375.375 0 00.544.415l4.03-2.676A11.86 11.86 0 0012 19.5c5.523 0 10-3.694 10-8.25S17.523 3 12 3z" />
                  </svg>
                  채용 정보 공유
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && (window as any).Kakao) {
                      (window as any).Kakao.Share.sendDefault({
                        objectType: "feed",
                        content: {
                          title: "바야다홈헬스케어 서비스 소개",
                          description: "50년 글로벌 경험의 홈헬스케어 서비스를 소개합니다.",
                          imageUrl: "https://bayada.co.kr/images/og-image.jpg",
                          link: {
                            mobileWebUrl: `https://bayada.co.kr/${locale}`,
                            webUrl: `https://bayada.co.kr/${locale}`,
                          },
                        },
                        buttons: [{ title: "서비스 알아보기", link: { mobileWebUrl: `https://bayada.co.kr/${locale}`, webUrl: `https://bayada.co.kr/${locale}` } }],
                      });
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#FEE500] bg-white px-6 py-3 text-sm font-semibold text-[#3A1D1D] hover:bg-[#FEE500]/10 transition-colors"
                >
                  <svg className="h-4 w-4 text-[#3A1D1D]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.477 3 2 6.694 2 11.25c0 2.9 1.696 5.45 4.267 7.007L5.2 21.5a.375.375 0 00.544.415l4.03-2.676A11.86 11.86 0 0012 19.5c5.523 0 10-3.694 10-8.25S17.523 3 12 3z" />
                  </svg>
                  서비스 소개 공유
                </button>
              </div>
            </div>

            {/* 추천서 다운로드 */}
            <NeedsReview label="파일 확인필요" note="실제 추천서 PDF 파일 경로 확인 및 업로드 필요">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]/10">
                    <svg className="h-5 w-5 text-[#ce0e2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[color:var(--fg)]">추천서 다운로드</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                  지인에게 바야다를 추천할 때 사용할 수 있는 공식 추천서를 다운로드하세요.
                </p>
                <div className="mt-6 space-y-3">
                  <a href="/files/bayada-referral-letter.pdf" download className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-white p-4 hover:border-[#ce0e2d] hover:bg-[#ce0e2d]/5 transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[color:var(--fg)] truncate">바야다 추천서 (채용 추천용)</p>
                      <p className="text-xs text-[color:var(--muted)]">PDF · 한국어</p>
                    </div>
                    <svg className="h-5 w-5 shrink-0 text-[color:var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                  <a href="/files/bayada-service-brochure.pdf" download className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-white p-4 hover:border-[#ce0e2d] hover:bg-[#ce0e2d]/5 transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[color:var(--fg)] truncate">바야다 서비스 안내 브로슈어</p>
                      <p className="text-xs text-[color:var(--muted)]">PDF · 한국어</p>
                    </div>
                    <svg className="h-5 w-5 shrink-0 text-[color:var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                </div>
              </div>
            </NeedsReview>
          </div>
        </div>

        {/* 추천 절차 안내 */}
        <div className="mt-8 rounded-2xl border border-[color:var(--border)] p-8">
          <h3 className="text-base font-semibold text-[color:var(--fg)]">추천 절차 안내</h3>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { step: "01", title: "추천 자료 준비", desc: "카카오톡 공유 버튼 또는 추천서를 다운로드하여 준비합니다." },
              { step: "02", title: "지인에게 전달", desc: "지인에게 바야다 채용 정보 및 서비스를 소개합니다." },
              { step: "03", title: "추천인 등록", desc: "지인이 지원 시 추천인 이름을 기입하도록 안내합니다." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d] text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-[color:var(--fg)]">{item.title}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BAYADA Education */}
      <NeedsReview label="링크 확인필요" note="실제 BAYADA Education URL 및 콘텐츠 확인 필요">
        <div className="mt-20">
          <h2 className="text-xl font-bold text-[color:var(--fg)]">BAYADA Education</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            바야다 임직원을 위한 교육 자료와 온라인 학습 플랫폼에 접근하세요.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { title: "온라인 교육 플랫폼", desc: "필수 교육 과정 및 자격증 취득 지원", href: "https://education.bayada.com", iconPath: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
              { title: "교육 자료실", desc: "업무 매뉴얼 및 교육 자료 다운로드", href: "#", iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { title: "세미나 · 워크숍", desc: "정기 교육 일정 및 신청", href: "#", iconPath: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col rounded-2xl border border-[color:var(--border)] p-6 hover:border-[#ce0e2d] hover:bg-[color:var(--surface)] transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ce0e2d]/10">
                  <svg className="h-5 w-5 text-[#ce0e2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold text-[color:var(--fg)]">{item.title}</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">{item.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#ce0e2d]">
                  바로가기
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </NeedsReview>

      {/* 4. Help Center / FAQ */}
      <div className="mt-20">
        <h2 className="text-xl font-bold text-[color:var(--fg)]">도움말 · FAQ</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          자주 묻는 질문과 임직원 지원 채널을 안내합니다.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { q: "추천인 혜택은 어떻게 받나요?", a: "지인이 채용 지원 시 추천인 이름을 기입하면 내부 규정에 따라 추천 포인트 또는 혜택이 제공됩니다. 자세한 내용은 인사팀에 문의해 주세요." },
            { q: "카카오톡 공유 버튼이 작동하지 않아요.", a: "카카오톡 SDK 초기화가 필요합니다. 브라우저 새로고침 후 다시 시도하거나, 직접 링크를 복사하여 공유해 주세요." },
            { q: "추천서 파일을 받을 수 없어요.", a: "PDF 뷰어 또는 브라우저 설정을 확인해 주세요. 문제가 지속되면 인사팀 이메일로 요청 주시면 발송해 드립니다." },
            { q: "Employee Login 비밀번호를 잊었어요.", a: "Okta Help Center를 통해 비밀번호를 재설정하거나, IT 지원팀에 문의해 주세요." },
          ].map((item) => (
            <div key={item.q} className="rounded-2xl border border-[color:var(--border)] p-6">
              <h3 className="font-semibold text-[color:var(--fg)]">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-[color:var(--surface)] p-8 text-center">
          <h3 className="text-lg font-semibold text-[color:var(--fg)]">더 궁금한 점이 있으신가요?</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">인사팀 또는 고객지원팀에 문의해 주세요.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link href={`/${locale}/contact`} className="rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white hover:bg-[#b00c27] transition-colors">
              문의하기
            </Link>
            <Link href={`/${locale}/faq`} className="rounded-full border border-[color:var(--border)] px-8 py-3 text-sm font-medium text-[color:var(--fg)] hover:bg-[color:var(--surface)] transition-colors">
              전체 FAQ 보기
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
