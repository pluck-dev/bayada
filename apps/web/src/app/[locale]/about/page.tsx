import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getAboutContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "회사소개 | BAYADA 홈헬스케어",
  description: "바야다홈헬스케어는 미국 최대 홈헬스케어 기업과 손잡고 최고의 방문 간호·돌봄 서비스를 제공합니다.",
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const about = getAboutContent();

  return (
    <>
      <PageHero
        title={dict.web.about.title}
        subtitle={about.heading}
        backgroundImage="/images/about/banner.jpg"
      />
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-display-sm font-bold text-[color:var(--fg)]">
                {about.heading}
              </h2>
              <div className="mt-6 space-y-4 text-body-lg leading-relaxed text-[color:var(--muted)]">
                {about.content.split("\n\n").map((paragraph: string, i: number) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src="/images/about/bayada001.png"
                  alt="BAYADA"
                  width={600}
                  height={400}
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="rounded-2xl bg-[color:var(--surface)] p-8">
                <h3 className="text-lg font-semibold text-[color:var(--fg)]">
                  홈헬스케어란?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                  {about.whatIsHomeHealthCare}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
