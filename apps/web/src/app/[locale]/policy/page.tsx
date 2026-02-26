import Link from "next/link";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";

export const metadata = createMetadata({
  title: "Policy & Procedure",
  description: "BAYADA 홈헬스케어의 정책과 절차를 안내합니다.",
  path: "/ko/policy",
  noIndex: true,
});

const policyCategories = [
  {
    title: "서비스 품질 정책",
    icon: "★",
    items: [
      "케어 품질 기준: BAYADA 글로벌 표준에 부합하는 방문간호·돌봄 서비스 품질 기준을 수립하고 준수합니다.",
      "서비스 모니터링: 정기적인 서비스 점검 및 이용자 만족도 조사를 통해 서비스 품질을 지속적으로 개선합니다.",
      "피드백 체계: 이용자·보호자의 의견을 적극 수렴하여 서비스 개선에 반영하는 체계를 운영합니다.",
      "품질 인증: 국내·외 관련 인증 기준에 따라 정기적인 품질 감사 및 인증 갱신을 실시합니다.",
    ],
  },
  {
    title: "안전 관리 정책",
    icon: "◉",
    items: [
      "감염 관리: 표준주의 지침 및 감염병 예방 수칙을 준수하여 이용자와 직원 모두를 보호합니다.",
      "응급 상황 대응: 응급 상황 발생 시 신속한 초기 대응 및 전문 의료기관 연계 절차를 운영합니다.",
      "사고 보고 체계: 모든 사고·near-miss 사례를 보고·분석하여 재발 방지 대책을 마련합니다.",
      "안전 교육: 전 직원을 대상으로 정기적인 안전 교육 및 훈련을 실시합니다.",
    ],
  },
  {
    title: "인력 관리 정책",
    icon: "▲",
    items: [
      "채용 기준: 자격증 보유, 경력, 신원조회 등 엄격한 채용 기준을 적용하여 우수 인력을 선발합니다.",
      "교육 요건: 신규 직원 오리엔테이션 및 직무별 정기 교육을 통해 전문성을 강화합니다.",
      "역량 평가: 연 1회 이상 역량 평가를 실시하고 결과에 따라 맞춤형 개발 계획을 수립합니다.",
      "처우 보장: 공정한 보상 체계와 복리후생 제도를 운영하여 직원 만족도를 높입니다.",
    ],
  },
  {
    title: "윤리 및 규정 준수",
    icon: "◆",
    items: [
      "윤리 강령: 이용자 존중, 공정성, 투명성을 핵심 가치로 하는 윤리 강령을 제정하고 준수합니다.",
      "법규 준수: 노인장기요양보험법, 의료법 등 관련 법규를 철저히 준수합니다.",
      "내부 신고 제도: 비위 행위 및 법규 위반을 익명으로 신고할 수 있는 내부 채널을 운영합니다.",
      "이해충돌 방지: 직원의 이해충돌 가능성을 사전에 예방하고 관리하는 절차를 운영합니다.",
    ],
  },
  {
    title: "정보 보안 정책",
    icon: "■",
    items: [
      "개인정보 처리: 「개인정보 보호법」에 따라 이용자 개인정보를 안전하게 수집·처리·보관합니다.",
      "의료정보 관리: 민감한 건강·의료 정보는 별도의 강화된 보안 체계를 적용하여 관리합니다.",
      "시스템 보안: 정기적인 취약점 점검 및 보안 패치를 통해 IT 시스템을 안전하게 유지합니다.",
      "데이터 파기: 보존 기간이 만료된 개인정보는 복구 불가능한 방법으로 안전하게 파기합니다.",
    ],
  },
  {
    title: "고객 권리 보장",
    icon: "●",
    items: [
      "고객 권리 헌장: 이용자의 알 권리, 선택권, 비밀보장, 안전한 서비스를 받을 권리 등을 명문화합니다.",
      "불만 처리 절차: 이용자 불만 접수 후 3일 이내 초기 응대, 7일 이내 처리 결과를 안내합니다.",
      "서비스 보증: 서비스 품질 기준에 미달하는 경우 재서비스 제공 또는 합리적인 보상을 실시합니다.",
      "옹호 지원: 이용자가 권리를 주장하기 어려운 경우 옹호자 연계 서비스를 지원합니다.",
    ],
  },
];

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await getDictionary(locale as Locale);

  return (
    <>
      <PageHero
        title="Policy & Procedure"
        subtitle="BAYADA의 정책과 절차를 안내합니다"
      />

      {/* Policy grid */}
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="mb-10">
            <p className="max-w-3xl text-body-lg leading-relaxed text-[color:var(--muted)]">
              바야다홈헬스케어는 최고 수준의 홈헬스케어 서비스를 제공하기 위해
              체계적인 정책과 절차를 수립하고 엄격하게 준수합니다. 아래의 각 정책은
              BAYADA 글로벌 표준과 대한민국 관련 법규를 기반으로 작성되었습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {policyCategories.map((category) => (
              <div
                key={category.title}
                className="rounded-2xl border border-[color:var(--border)] p-6 transition-shadow hover:shadow-md"
              >
                {/* Card header */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d]/10 text-sm font-bold text-[#ce0e2d]">
                    {category.icon}
                  </span>
                  <h2 className="text-base font-bold text-[color:var(--fg)]">
                    {category.title}
                  </h2>
                </div>

                {/* Policy items */}
                <ul className="space-y-3">
                  {category.items.map((item, i) => {
                    const [label, ...rest] = item.split(": ");
                    const description = rest.join(": ");
                    return (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ce0e2d]" />
                        <span className="text-sm leading-relaxed text-[color:var(--muted)]">
                          <span className="font-medium text-[color:var(--fg)]">
                            {label}
                          </span>
                          {description ? `: ${description}` : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact section */}
      <section className="border-t border-[color:var(--border)] bg-[color:var(--surface)] py-16">
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-[color:var(--fg)]">
                정책 관련 문의
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                정책 및 절차에 관한 궁금한 사항은 언제든지 문의해 주세요.
              </p>
              <div className="mt-4 space-y-1">
                <p className="text-sm text-[color:var(--muted)]">
                  전화:{" "}
                  <a
                    href="tel:16701379"
                    className="font-semibold text-[color:var(--fg)] hover:text-[#ce0e2d]"
                  >
                    1670-1379
                  </a>
                </p>
                <p className="text-sm text-[color:var(--muted)]">
                  이메일:{" "}
                  <a
                    href="mailto:info@bayada.co.kr"
                    className="font-medium text-[#ce0e2d] hover:underline"
                  >
                    info@bayada.co.kr
                  </a>
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/contact`}
              className="shrink-0 rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00c27]"
            >
              상담 문의하기
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
