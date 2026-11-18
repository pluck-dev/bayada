import { getWebPageContent } from "@/lib/web-pages";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { Container } from "@/components/layout/Container";

export const metadata = createMetadata({
  title: "이용약관",
  description: "바야다홈헬스케어 서비스 이용약관",
  path: "/ko/terms",
  noIndex: true,
});

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { sections } = await getWebPageContent("terms");
  await getDictionary(locale as Locale);

  return (
    <>
      {/* Hero */}
      <section className="bg-[color:var(--surface)] py-16 lg:py-20">
        <Container>
          <h1 className="text-display-lg font-bold text-[color:var(--fg)]">
            이용약관
          </h1>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            최종 수정일: 2026년 1월 1일
          </p>
        </Container>
      </section>

      {/* Body */}
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="flex gap-12">
            {/* Sidebar TOC */}
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-8">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                  목차
                </p>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-[color:var(--muted)] transition-colors hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]"
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <main className="min-w-0 flex-1">
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--muted)]">
                본 약관은 바야다홈헬스케어가 제공하는 서비스의 이용과 관련하여 회사와
                이용자 간의 권리, 의무 및 책임 사항, 기타 필요한 사항을 규정합니다.
                서비스를 이용하시기 전에 본 약관을 주의 깊게 읽어주시기 바랍니다.
              </div>

              <div className="mt-10 space-y-12">
                {sections.map((s) => (
                  <article key={s.id} id={s.id} className="scroll-mt-8">
                    <h2 className="text-lg font-bold text-[color:var(--fg)]">
                      <span className="mr-2 inline-block h-1 w-1 rounded-full bg-[#ce0e2d] align-middle" />
                      {s.title}
                    </h2>
                    <div className="mt-4 space-y-2">
                      {s.content.map((line, i) => (
                        <p
                          key={i}
                          className={`text-sm leading-relaxed text-[color:var(--muted)] ${
                            line.startsWith("   ") ? "pl-6" : ""
                          }`}
                        >
                          {line.trimStart()}
                        </p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              {/* Footer note */}
              <div className="mt-16 rounded-xl border border-[color:var(--border)] p-6">
                <p className="text-sm font-semibold text-[color:var(--fg)]">
                  문의처
                </p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  이용약관에 관한 문의사항은 아래 연락처로 문의주시기 바랍니다.
                </p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  전화: <span className="font-medium text-[color:var(--fg)]">1670-1379</span>
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
            </main>
          </div>
        </Container>
      </section>
    </>
  );
}
