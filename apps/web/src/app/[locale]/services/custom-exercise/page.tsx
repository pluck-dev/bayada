import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getCustomExerciseContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { ServiceList } from "@/components/services/ServiceList";

export const metadata: Metadata = {
  title: "맞춤운동 | BAYADA 홈헬스케어",
  description: "국가 자격증을 보유한 전문 체력관리 스포츠지도사가 가정을 방문하여 1:1 맞춤형 운동프로그램을 제공합니다.",
};

export default async function CustomExercisePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const data = getCustomExerciseContent();
  const t = dict.web.services;

  return (
    <>
      <PageHero
        title={data.title}
        backgroundImage="/images/services/custom-exercise.jpg"
      />
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-10">
              <p className="text-body-lg leading-relaxed text-[color:var(--muted)]">
                {data.description}
              </p>

              <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                <h3 className="text-sm font-semibold text-[#2563eb]">전문가</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{data.provider}</p>
              </div>

              <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                <h3 className="text-sm font-semibold text-[#ce0e2d]">{t.target}</h3>
                <ul className="mt-3 space-y-2">
                  {data.targetUsers.map((target: string, i: number) => (
                    <li key={i} className="text-sm text-[color:var(--muted)]">• {target}</li>
                  ))}
                </ul>
              </div>

              <ServiceList items={data.programs} title={t.programs} />
            </div>

            <aside>
              <div className="sticky top-24 space-y-4">
                <div className="overflow-hidden rounded-2xl">
                  <Image
                    src="/images/services/custom-exercise.jpg"
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
