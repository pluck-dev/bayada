import type { Metadata } from "next";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { services } from "@/data/services";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = { title: "Vendor Qualification | BAYADA", description: "제공자 기관 자격 검증 양식" };

export default async function VQFormPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <PageHero title="Vendor Qualification" subtitle="제공자(기관) 자격 검증 양식" />
      <section className="py-[var(--section-gap)]">
        <Container narrow>
          <div className="rounded-2xl border border-[color:var(--border)] p-8">
            <div className="space-y-4">
              {["기관명 *", "대표자명 *", "사업자등록번호 *", "담당자명 *", "연락처 *", "이메일 *"].map((label) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-[color:var(--fg)]">{label}</label>
                  <input type="text" className="mt-1 w-full rounded-lg border border-[color:var(--border)] px-4 py-2.5 text-sm focus:border-[#ce0e2d] focus:outline-none" placeholder={label.replace(" *", "")} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-[color:var(--fg)]">기관 유형 *</label>
                <select className="mt-1 w-full rounded-lg border border-[color:var(--border)] px-4 py-2.5 text-sm focus:border-[#ce0e2d] focus:outline-none">
                  <option>선택하세요</option>
                  <option>의료기관 - 병원</option>
                  <option>의료기관 - 클리닉</option>
                  <option>장기요양센터</option>
                  <option>방문간호센터</option>
                  <option>데이케어센터</option>
                  <option>벤더</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--fg)]">서비스 영역 * (복수 선택)</label>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  {services.map((s) => (
                    <label key={s.slug} className="flex items-center gap-1.5"><input type="checkbox" className="accent-[#ce0e2d]" /> {s.nameKo}</label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--fg)]">인력 현황</label>
                <input type="text" className="mt-1 w-full rounded-lg border border-[color:var(--border)] px-4 py-2.5 text-sm focus:border-[#ce0e2d] focus:outline-none" placeholder="전체 인력 수" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--fg)]">보유 인증</label>
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  {["노인장기요양 지정", "의료기관 인증", "ISO 인증", "기타"].map((c) => (
                    <label key={c} className="flex items-center gap-1.5"><input type="checkbox" className="accent-[#ce0e2d]" /> {c}</label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                <input type="checkbox" className="accent-[#ce0e2d]" />
                개인정보 수집 및 이용에 동의합니다 *
              </label>
            </div>
            <div className="mt-8">
              <button className="w-full rounded-full bg-[#ce0e2d] px-8 py-3 text-sm font-semibold text-white hover:bg-[#b00c27]">제출하기</button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
