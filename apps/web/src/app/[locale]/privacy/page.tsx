import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata } from "@/lib/seo";
import { getPrivacyContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { NeedsReview } from "@/components/shared/NeedsReview";

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

            {/* Notice of Privacy Event */}
            <NeedsReview
              label="수정필요"
              note="엑셀 시트: Notice of Privacy Event 개인정보보호. 실제 문서 파일(PDF) 경로 및 링크 확인 필요. bayada.com 참고."
            >
              <div>
                <h2 className="text-lg font-bold text-[color:var(--fg)]">
                  Notice of Privacy Event
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                  바야다홈헬스케어 개인정보 보호 이벤트 관련 공지입니다. 아래 문서를 확인하세요.
                </p>
                <div className="mt-4 space-y-3">
                  <a
                    href="/documents/BAYADA_Website_Notice_FINAL.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] p-4 hover:border-[#ce0e2d]/40 hover:shadow-sm transition"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ce0e2d]/10 text-sm text-[#ce0e2d]">
                      ↓
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--fg)]">
                        BAYADA Website Notice (영문)
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        BAYADA_Website_Notice_FINAL.pdf
                      </p>
                    </div>
                  </a>
                  <a
                    href="/documents/BAYADA_Website_Notice_FINAL_KOR.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] p-4 hover:border-[#ce0e2d]/40 hover:shadow-sm transition"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ce0e2d]/10 text-sm text-[#ce0e2d]">
                      ↓
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--fg)]">
                        BAYADA Website Notice (한국어)
                      </p>
                      <p className="text-xs text-[color:var(--muted)]">
                        BAYADA_Website_Notice_FINAL_KOR.pdf
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </NeedsReview>

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
