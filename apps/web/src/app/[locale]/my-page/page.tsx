import { createMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { NeedsReview } from "@/components/shared/NeedsReview";

export const metadata = createMetadata({
  title: "마이페이지",
  description:
    "바야다홈헬스케어 마이페이지 — 로그인, 서비스 이용 현황, 건강 기록, 결제 내역, 알림 설정, 프로필 관리",
  path: "/ko/my-page",
});

export default async function MyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  return (
    <NeedsReview show note="로그인 기반 페이지 — 백엔드 연동 필요">
      <PageHero title="마이페이지" subtitle="나의 바야다 서비스를 관리하세요" />

      {/* ── 1. 로그인 섹션 ──────────────────────────────────────────────── */}
      <section className="py-[var(--section-gap)]">
        <Container narrow>
          <NeedsReview show note="소셜 로그인 OAuth 연동 필요 (카카오/네이버/이메일)">
            <div className="mx-auto max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 text-center">
              <h2 className="text-xl font-bold text-[color:var(--fg)]">
                로그인
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                서비스를 이용하려면 로그인이 필요합니다
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  className="rounded-full bg-[#FEE500] px-6 py-3 text-sm font-semibold text-[#191919] transition-opacity hover:opacity-90"
                >
                  카카오로 시작하기
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#03C75A] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  네이버로 시작하기
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[color:var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--fg)] transition-colors hover:bg-[color:var(--surface)]"
                >
                  이메일로 로그인
                </button>
              </div>
            </div>
          </NeedsReview>
        </Container>
      </section>

      {/* ── 2. 서비스 이용 현황 ─────────────────────────────────────────── */}
      <section className="bg-[color:var(--surface)] py-[var(--section-gap)]">
        <Container>
          <NeedsReview show note="서비스 예약 API 연동 필요">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-[color:var(--fg)]">
                서비스 이용 현황
              </h2>
              <p className="mt-3 text-sm text-[color:var(--muted)]">
                현재 이용 중인 서비스와 예약 내역을 확인하세요
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6">
                <h3 className="font-bold text-[color:var(--fg)]">
                  이용 중인 서비스
                </h3>
                <p className="mt-4 text-sm text-[color:var(--muted)]">
                  현재 이용 중인 서비스가 없습니다.
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6">
                <h3 className="font-bold text-[color:var(--fg)]">예약 내역</h3>
                <p className="mt-4 text-sm text-[color:var(--muted)]">
                  예약 내역이 없습니다.
                </p>
              </div>
            </div>
          </NeedsReview>
        </Container>
      </section>

      {/* ── 3. 건강 기록 ────────────────────────────────────────────────── */}
      <section className="py-[var(--section-gap)]">
        <Container>
          <NeedsReview show note="건강 데이터 API 및 대시보드 차트 연동 필요">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-[color:var(--fg)]">
                건강 기록
              </h2>
              <p className="mt-3 text-sm text-[color:var(--muted)]">
                나의 건강 데이터를 한눈에 확인하세요
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "혈압", value: "-- / --", unit: "mmHg" },
                { label: "혈당", value: "--", unit: "mg/dL" },
                { label: "체중", value: "--", unit: "kg" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-center"
                >
                  <span className="text-xs font-medium text-[color:var(--muted)]">
                    {item.label}
                  </span>
                  <p className="mt-2 text-2xl font-bold text-[color:var(--fg)]">
                    {item.value}
                  </p>
                  <span className="text-xs text-[color:var(--muted)]">
                    {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </NeedsReview>
        </Container>
      </section>

      {/* ── 4. 결제/청구 내역 ───────────────────────────────────────────── */}
      <section className="bg-[color:var(--surface)] py-[var(--section-gap)]">
        <Container>
          <NeedsReview show note="결제 시스템(토스페이먼츠) 연동 필요">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-[color:var(--fg)]">
                결제 / 청구 내역
              </h2>
              <p className="mt-3 text-sm text-[color:var(--muted)]">
                서비스 결제 및 청구 내역을 확인하세요
              </p>
            </div>
            <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6">
              <p className="text-center text-sm text-[color:var(--muted)]">
                결제 내역이 없습니다.
              </p>
            </div>
          </NeedsReview>
        </Container>
      </section>

      {/* ── 5. 알림 설정 ────────────────────────────────────────────────── */}
      <section className="py-[var(--section-gap)]">
        <Container narrow>
          <NeedsReview show note="FCM 푸시 / 알리고 SMS / SES 이메일 알림 연동 필요">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-[color:var(--fg)]">
                알림 설정
              </h2>
              <p className="mt-3 text-sm text-[color:var(--muted)]">
                알림 수신 방법을 설정하세요
              </p>
            </div>
            <div className="space-y-4">
              {[
                { label: "푸시 알림", description: "앱 푸시 알림 수신" },
                { label: "SMS 알림", description: "문자 메시지 알림 수신" },
                {
                  label: "이메일 알림",
                  description: "이메일 알림 수신",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--fg)]">
                      {item.label}
                    </p>
                    <p className="text-xs text-[color:var(--muted)]">
                      {item.description}
                    </p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-[color:var(--border)]" />
                </div>
              ))}
            </div>
          </NeedsReview>
        </Container>
      </section>

      {/* ── 6. 프로필 관리 ──────────────────────────────────────────────── */}
      <section className="bg-[color:var(--surface)] py-[var(--section-gap)]">
        <Container narrow>
          <NeedsReview show note="사용자 프로필 CRUD API 연동 필요">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-[color:var(--fg)]">
                프로필 관리
              </h2>
              <p className="mt-3 text-sm text-[color:var(--muted)]">
                개인 정보를 확인하고 수정하세요
              </p>
            </div>
            <div className="space-y-4">
              {[
                { label: "이름", value: "--" },
                { label: "이메일", value: "--" },
                { label: "전화번호", value: "--" },
                { label: "주소", value: "--" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-white p-4"
                >
                  <div>
                    <span className="text-xs text-[color:var(--muted)]">
                      {item.label}
                    </span>
                    <p className="text-sm font-semibold text-[color:var(--fg)]">
                      {item.value}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-medium text-[#ce0e2d] hover:underline"
                  >
                    수정
                  </button>
                </div>
              ))}
            </div>
          </NeedsReview>
        </Container>
      </section>
    </NeedsReview>
  );
}
