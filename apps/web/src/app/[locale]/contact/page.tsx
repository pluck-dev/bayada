import type { Metadata } from "next";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getCompanyInfo } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Contact Us | BAYADA 홈헬스케어",
  description: "바야다홈헬스케어에 문의하세요",
};

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const company = getCompanyInfo();

  const channels = [
    { icon: "📞", title: "전화 문의", value: company.serviceHotline, sub: "평일 09:00 - 18:00" },
    { icon: "📧", title: "이메일 문의", value: company.email, sub: "영업일 기준 24시간 내 답변" },
    { icon: "🤖", title: "AI 상담", value: "DeiBud", sub: "24시간 이용 가능" },
  ];

  return (
    <>
      <PageHero title="Contact Us" subtitle="바야다홈헬스케어에 문의하세요" />
      <section className="py-[var(--section-gap)]">
        <Container>
          {/* 연락 채널 */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-12">
            {channels.map((ch) => (
              <div key={ch.title} className="rounded-2xl border border-[color:var(--border)] p-6 text-center">
                <span className="text-3xl">{ch.icon}</span>
                <h3 className="mt-3 font-bold text-[color:var(--fg)]">{ch.title}</h3>
                <p className="mt-2 text-sm font-medium text-[#ce0e2d]">{ch.value}</p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{ch.sub}</p>
              </div>
            ))}
          </div>

          {/* 문의 폼 안내 */}
          <div className="rounded-2xl bg-[color:var(--surface)] p-8">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">일반 문의</h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">아래 정보를 입력해 주시면 담당자가 빠르게 연락드리겠습니다.</p>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[color:var(--fg)]">문의 유형 *</label>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
                    {["서비스 이용", "파트너십", "채용", "기타"].map((t) => (
                      <label key={t} className="flex items-center gap-1.5"><input type="radio" name="type" className="accent-[#ce0e2d]" /> {t}</label>
                    ))}
                  </div>
                </div>
              </div>
              {["이름 *", "연락처 *", "이메일 *", "제목 *"].map((label) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-[color:var(--fg)]">{label}</label>
                  <input type="text" className="mt-1 w-full rounded-lg border border-[color:var(--border)] px-4 py-2.5 text-sm focus:border-[#ce0e2d] focus:outline-none" placeholder={label.replace(" *", "")} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-[color:var(--fg)]">내용 *</label>
                <textarea rows={4} className="mt-1 w-full rounded-lg border border-[color:var(--border)] px-4 py-2.5 text-sm focus:border-[#ce0e2d] focus:outline-none" placeholder="문의 내용을 입력하세요" />
              </div>
              <label className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                <input type="checkbox" className="accent-[#ce0e2d]" />
                개인정보 수집 및 이용에 동의합니다
              </label>
              <button className="rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00c27]">문의하기</button>
            </div>
          </div>

          {/* 오시는 길 */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">오시는 길</h2>
            <div className="mt-4 rounded-2xl border border-[color:var(--border)] p-6">
              <p className="text-sm text-[color:var(--fg)] font-medium">{company.legalName}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{company.headquarters}</p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
