import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { getPrivacyContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata = createMetadata({
  title: "개인정보처리방침",
  description: "바야다홈헬스케어 개인정보처리방침",
  path: "/ko/privacy",
  noIndex: true,
});

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const privacy = getPrivacyContent();

  return (
    <>
      <PageHero title={dict.web.privacy.title} />
      <section className="py-[var(--section-gap)]">
        <Container narrow>
          <div className="space-y-8">
            <div className="rounded-xl bg-[color:var(--surface)] p-6">
              <p className="text-sm text-[color:var(--muted)]">
                시행일: {privacy.effectiveDate}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[color:var(--fg)]">
                개인정보 수집 및 이용 목적
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                {privacy.purposes}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[color:var(--fg)]">수집하는 개인정보</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-[color:var(--border)] p-5">
                  <h3 className="text-sm font-semibold text-[color:var(--fg)]">채용</h3>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{privacy.collectedInfo.recruitment}</p>
                </div>
                <div className="rounded-xl border border-[color:var(--border)] p-5">
                  <h3 className="text-sm font-semibold text-[color:var(--fg)]">상담</h3>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{privacy.collectedInfo.consultation}</p>
                </div>
                <div className="rounded-xl border border-[color:var(--border)] p-5">
                  <h3 className="text-sm font-semibold text-[color:var(--fg)]">인사</h3>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{privacy.collectedInfo.hr}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[color:var(--fg)]">개인정보 보호책임자</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-[color:var(--surface)] p-5">
                  <p className="text-sm font-semibold text-[color:var(--fg)]">
                    개인정보 보호 관리자
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {privacy.privacyOfficer.name}
                  </p>
                  <p className="text-sm text-[color:var(--muted)]">
                    {privacy.privacyOfficer.phone}
                  </p>
                  <p className="text-sm text-[color:var(--muted)]">
                    {privacy.privacyOfficer.email}
                  </p>
                </div>
                <div className="rounded-xl bg-[color:var(--surface)] p-5">
                  <p className="text-sm font-semibold text-[color:var(--fg)]">
                    개인정보 보호 담당자
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {privacy.privacyManager.name}
                  </p>
                  <p className="text-sm text-[color:var(--muted)]">
                    {privacy.privacyManager.phone}
                  </p>
                  <p className="text-sm text-[color:var(--muted)]">
                    {privacy.privacyManager.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
