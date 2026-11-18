import { getWebPageContent } from "@/lib/web-pages";
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

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { categories: policyCategories } = await getWebPageContent("policy");
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
