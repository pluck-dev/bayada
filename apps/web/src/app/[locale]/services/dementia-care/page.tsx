import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getDementiaCareContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "치매케어 | BAYADA 홈헬스케어",
  description: "전문 간호사, 요양보호사, 사회복지사가 팀을 이루어 치매 환자를 안전하게 돌봅니다.",
};

export default async function DementiaCarePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const data = getDementiaCareContent();

  return (
    <>
      <PageHero
        title={data.title}
        backgroundImage="/images/services/dementia-care.jpg"
      />
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-10">
              <p className="text-body-lg leading-relaxed text-[color:var(--muted)]">
                {data.description}
              </p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                  <h3 className="text-sm font-semibold text-[#ce0e2d]">주요 증상</h3>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{data.symptoms}</p>
                </div>
                <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                  <h3 className="text-sm font-semibold text-[#2563eb]">원인</h3>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{data.causes}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[color:var(--border)] bg-[#f0f9ff] p-6">
                <h3 className="text-sm font-semibold text-[#2563eb]">케어 팁</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{data.careTip}</p>
              </div>

              <div className="rounded-xl border border-[color:var(--border)] bg-[#fffbeb] p-6">
                <h3 className="text-sm font-semibold text-[#d97706]">일몰증후군</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{data.sundowningSyndrome}</p>
              </div>
            </div>

            <aside>
              <div className="sticky top-24 space-y-4">
                <div className="overflow-hidden rounded-2xl">
                  <Image
                    src="/images/services/dementia-care.jpg"
                    alt={data.title}
                    width={400}
                    height={300}
                    className="h-auto w-full object-cover"
                  />
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-[#ce0e2d] to-[#a80b24] p-6 text-white">
                  <p className="text-sm font-medium">상담 전화</p>
                  <a href="tel:1670-1379" className="mt-1 block text-2xl font-bold">
                    1670-1379
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
