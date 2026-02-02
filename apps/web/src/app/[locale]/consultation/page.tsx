import type { Metadata } from "next";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getConsultationContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { ConsultationForm } from "@/components/ConsultationForm";
import { Phone, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "서비스상담 | BAYADA 홈헬스케어",
  description: "바야다홈헬스케어 서비스 상담 신청 - 24시간 내 연락드립니다.",
};

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const data = getConsultationContent();

  return (
    <>
      <PageHero
        title={dict.web.consultation.title}
        subtitle={data.description}
      />
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-[color:var(--border)] bg-white p-8">
                <ConsultationForm
                  dict={dict}
                  serviceOptions={data.serviceOptions}
                />
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-[#ce0e2d] to-[#a80b24] p-6 text-white">
                <p className="text-sm font-medium">전화 상담</p>
                <a href="tel:1670-1379" className="mt-1 block text-2xl font-bold">
                  1670-1379
                </a>
              </div>

              <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                <h3 className="text-sm font-semibold text-[color:var(--fg)]">연락처</h3>
                <div className="mt-4 space-y-3">
                  <a href="tel:1670-1379" className="flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-[#ce0e2d]">
                    <Phone className="h-4 w-4" />
                    1670-1379
                  </a>
                  <a href="mailto:K-hhc@bayadakorea.com" className="flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-[#ce0e2d]">
                    <Mail className="h-4 w-4" />
                    K-hhc@bayadakorea.com
                  </a>
                  <span className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                    <MapPin className="h-4 w-4 shrink-0" />
                    서울시 강남구 테헤란로 431, 7층
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-[color:var(--border)] bg-[#fffbeb] p-6">
                <p className="text-sm text-[color:var(--muted)]">
                  {dict.web.consultation.responseTime}
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
