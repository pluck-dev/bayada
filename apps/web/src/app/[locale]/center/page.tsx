import type { Metadata } from "next";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getCenterContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { MapPin, Train, Bus, Phone, Printer, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "바야다 재가센터 소개 | BAYADA 홈헬스케어",
  description: "바야다 재가센터 위치, 교통편, 연락처 안내",
};

export default async function CenterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const center = getCenterContent();
  const t = dict.web.center;

  return (
    <>
      <PageHero title={t.title} />
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* 주소 + 교통편 */}
            <div className="space-y-6">
              <div className="rounded-2xl bg-[color:var(--surface)] p-8">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[color:var(--fg)]">
                  <MapPin className="h-5 w-5 text-[#ce0e2d]" />
                  {t.address}
                </h2>
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  {center.address}
                </p>
              </div>

              <div className="rounded-2xl bg-[color:var(--surface)] p-8">
                <h3 className="flex items-center gap-2 text-lg font-bold text-[color:var(--fg)]">
                  <Train className="h-5 w-5 text-[#2563eb]" />
                  {t.subway}
                </h3>
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  {center.access.subway}
                </p>
              </div>

              <div className="rounded-2xl bg-[color:var(--surface)] p-8">
                <h3 className="flex items-center gap-2 text-lg font-bold text-[color:var(--fg)]">
                  <Bus className="h-5 w-5 text-[#16a34a]" />
                  {t.bus}
                </h3>
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  {center.access.bus}
                </p>
              </div>
            </div>

            {/* 연락처 */}
            <div>
              <div className="rounded-2xl border border-[color:var(--border)] p-8">
                <h2 className="text-lg font-bold text-[color:var(--fg)]">{t.contact}</h2>
                <div className="mt-6 space-y-4">
                  <a
                    href={`tel:${center.contact.phone}`}
                    className="flex items-center gap-3 text-sm text-[color:var(--muted)] transition-colors hover:text-[#ce0e2d]"
                  >
                    <Phone className="h-5 w-5 shrink-0" />
                    <span>전화: {center.contact.phone}</span>
                  </a>
                  <div className="flex items-center gap-3 text-sm text-[color:var(--muted)]">
                    <Printer className="h-5 w-5 shrink-0" />
                    <span>팩스: {center.contact.fax}</span>
                  </div>
                  <a
                    href={`mailto:${center.contact.email}`}
                    className="flex items-center gap-3 text-sm text-[color:var(--muted)] transition-colors hover:text-[#ce0e2d]"
                  >
                    <Mail className="h-5 w-5 shrink-0" />
                    <span>이메일: {center.contact.email}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
