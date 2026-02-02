import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getCEOContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "대표인사말 | BAYADA 홈헬스케어",
  description: "바야다홈헬스케어 김영민 대표의 인사말",
};

export default async function CEOPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const ceo = getCEOContent();

  return (
    <>
      <PageHero title={dict.web.ceo.title} />
      <section className="py-[var(--section-gap)]">
        <Container narrow>
          <div className="mx-auto max-w-3xl">
            <div className="space-y-6 text-base leading-[1.8] text-[color:var(--muted)]">
              {ceo.content.split("\n\n").map((paragraph: string, i: number) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-12 flex items-end justify-end gap-4">
              <div className="text-right">
                <p className="text-sm text-[color:var(--muted)]">
                  (주)바야다홈헬스케어 대표
                </p>
                <p className="mt-1 text-lg font-bold text-[color:var(--fg)]">
                  {ceo.ceoName}
                </p>
              </div>
              <Image
                src="/images/about/kim_sign.jpg"
                alt={`${ceo.ceoName} 서명`}
                width={120}
                height={60}
                className="h-auto w-24"
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
