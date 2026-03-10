import { createMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { NeedsReview } from "@/components/shared/NeedsReview";

export const metadata = createMetadata({
  title: "홈헬스케어 쇼핑몰",
  description:
    "바야다홈헬스케어와 연계된 의료기기, 건강관리 용품, 시니어 생활용품, 재활보조기구 등을 만나보세요.",
  path: "/ko/shop",
});

// ── 카테고리 데이터 ──────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    icon: "🩺",
    name: "의료기기",
    description: "혈압계, 혈당계, 산소포화도 측정기 등 가정용 의료기기",
    count: null,
  },
  {
    icon: "💊",
    name: "건강관리 용품",
    description: "복약 관리, 건강보조식품, 위생용품 등",
    count: null,
  },
  {
    icon: "🛋️",
    name: "시니어 생활용품",
  description: "낙상 방지, 욕실 안전, 이동 보조 등 시니어 맞춤 생활용품",
    count: null,
  },
  {
    icon: "🦽",
    name: "재활보조기구",
    description: "휠체어, 워커, 지팡이, 욕창 예방 매트 등 재활 보조기구",
    count: null,
  },
  {
    icon: "🛏️",
    name: "케어 침구·가구",
    description: "전동 침대, 욕창 방지 매트리스, 자세 보조 쿠션 등",
    count: null,
  },
  {
    icon: "📡",
    name: "스마트 헬스케어",
    description: "웨어러블 기기, 낙상 감지 센서, 원격 모니터링 기기 등",
    count: null,
  },
] as const;

// ── 파트너 쇼핑몰 데이터 ────────────────────────────────────────────────────

const PARTNER_SHOPS = [
  {
    name: "파트너 쇼핑몰 A",
    description: "의료기기 전문 온라인 쇼핑몰 (연계 예정)",
    category: "의료기기",
    url: "#",
    badge: "준비중",
  },
  {
    name: "파트너 쇼핑몰 B",
    description: "시니어 생활용품 전문 쇼핑몰 (연계 예정)",
    category: "시니어 용품",
    url: "#",
    badge: "준비중",
  },
  {
    name: "파트너 쇼핑몰 C",
    description: "재활보조기구 전문 쇼핑몰 (연계 예정)",
    category: "재활기구",
    url: "#",
    badge: "준비중",
  },
] as const;

// ── 멤버십 혜택 데이터 ───────────────────────────────────────────────────────

const MEMBERSHIP_BENEFITS = [
  {
    icon: "💰",
    title: "회원 할인",
    description: "바야다 서비스 이용 회원 대상 파트너 쇼핑몰 할인 혜택 제공",
  },
  {
    icon: "🚚",
    title: "무료 배송",
    description: "일정 금액 이상 구매 시 무료 배송 혜택 (파트너사 조건 적용)",
  },
  {
    icon: "🔄",
    title: "케어 매니저 추천",
    description: "담당 케어 매니저가 고객 상태에 맞는 용품을 직접 추천",
  },
  {
    icon: "🎁",
    title: "적립 포인트",
    description: "구매 금액의 일부를 포인트로 적립, 다음 구매 시 사용 가능",
  },
] as const;

// ── 페이지 ────────────────────────────────────────────────────────────────────

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  return (
    <NeedsReview show note="엑셀 기획 미비 / 파트너 쇼핑몰 정보 필요">
      <PageHero
        title="홈헬스케어 쇼핑몰"
        subtitle="건강한 생활을 위한 모든 것"
      />

      {/* ── 카테고리 그리드 ────────────────────────────────────────────── */}
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-[color:var(--fg)]">
              카테고리
            </h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              홈헬스케어와 관련된 모든 물품과 기구, 가구를 카테고리별로
              만나보세요.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                type="button"
                className="group flex flex-col items-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-center transition-all hover:border-[#ce0e2d] hover:shadow-md"
              >
                <span className="text-4xl">{cat.icon}</span>
                <span className="mt-3 text-sm font-semibold text-[color:var(--fg)] group-hover:text-[#ce0e2d]">
                  {cat.name}
                </span>
                <p className="mt-2 hidden text-xs leading-relaxed text-[color:var(--muted)] sm:block">
                  {cat.description}
                </p>
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 파트너 쇼핑몰 연계 카드 ─────────────────────────────────────── */}
      <section className="bg-[color:var(--surface)] py-[var(--section-gap)]">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-[color:var(--fg)]">
              파트너 쇼핑몰
            </h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              바야다와 제휴된 전문 쇼핑몰에서 구매 시 수수료 일부가 서비스
              품질 향상에 사용됩니다.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PARTNER_SHOPS.map((shop) => (
              <a
                key={shop.name}
                href={shop.url}
                className="group relative flex flex-col rounded-2xl border border-[color:var(--border)] bg-white p-6 transition-all hover:border-[#ce0e2d] hover:shadow-lg"
              >
                <span className="absolute right-4 top-4 rounded-full bg-[#ce0e2d]/10 px-2 py-0.5 text-xs font-medium text-[#ce0e2d]">
                  {shop.badge}
                </span>
                <span className="text-xs font-medium text-[color:var(--muted)]">
                  {shop.category}
                </span>
                <h3 className="mt-2 text-lg font-bold text-[color:var(--fg)] group-hover:text-[#ce0e2d]">
                  {shop.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[color:var(--muted)]">
                  {shop.description}
                </p>
                <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-[#ce0e2d]">
                  쇼핑몰 바로가기
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 멤버십 혜택 안내 ─────────────────────────────────────────────── */}
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-[color:var(--fg)]">
              멤버십 혜택
            </h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              바야다홈헬스케어 서비스 이용 고객은 파트너 쇼핑몰에서 다양한
              멤버십 혜택을 받으실 수 있습니다.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MEMBERSHIP_BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-[color:var(--border)] p-6 text-center"
              >
                <span className="text-3xl">{benefit.icon}</span>
                <h3 className="mt-4 font-bold text-[color:var(--fg)]">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-[#ce0e2d] p-8 text-center text-white">
            <h3 className="text-xl font-bold">
              서비스 이용 고객이라면 지금 바로 혜택을 확인하세요
            </h3>
            <p className="mt-2 text-sm text-white/80">
              바야다 케어 매니저에게 파트너 쇼핑몰 할인 코드를 요청하세요.
            </p>
            <button
              type="button"
              className="mt-6 rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#ce0e2d] transition-opacity hover:opacity-90"
            >
              서비스 문의하기
            </button>
          </div>
        </Container>
      </section>
    </NeedsReview>
  );
}
