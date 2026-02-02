import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getBayadaWayContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "The BAYADA Way | BAYADA 홈헬스케어",
  description: "바야다웨이 - 사명, 비전, 핵심 가치: Compassion, Excellence, Reliability",
};

export default async function BayadaWayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const bw = getBayadaWayContent();
  const t = dict.web.bayadaWay;

  const coreValues = [
    {
      title: "Compassion",
      label: dict.web.home.compassionLabel,
      goal: bw.compassion.goal,
      activities: bw.compassion.activities,
      color: "#ce0e2d",
      bg: "#fae6ea",
    },
    {
      title: "Excellence",
      label: dict.web.home.excellenceLabel,
      goal: bw.excellence.goal,
      activities: bw.excellence.activities,
      color: "#2563eb",
      bg: "#dbeafe",
    },
    {
      title: "Reliability",
      label: dict.web.home.reliabilityLabel,
      goal: bw.reliability.goal,
      activities: bw.reliability.activities,
      color: "#16a34a",
      bg: "#dcfce7",
    },
  ];

  return (
    <>
      <PageHero title={t.title} subtitle={bw.intro} />

      <section className="py-[var(--section-gap)]">
        <Container>
          {/* 바야다웨이 이미지 */}
          <div className="mb-16 overflow-hidden rounded-2xl">
            <Image
              src="/images/bayada-way/bayada-way-01.png"
              alt="The BAYADA Way"
              width={1200}
              height={600}
              className="h-auto w-full object-cover"
            />
          </div>

          {/* 사명, 비전 */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-2xl bg-[color:var(--surface)] p-8">
              <h2 className="text-xl font-bold text-[color:var(--fg)]">{t.mission}</h2>
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--muted)]">
                {bw.mission}
              </p>
            </div>
            <div className="rounded-2xl bg-[color:var(--surface)] p-8">
              <h2 className="text-xl font-bold text-[color:var(--fg)]">{t.vision}</h2>
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--muted)]">
                {bw.vision}
              </p>
            </div>
          </div>

          {/* 신념 */}
          <div className="mt-12 rounded-2xl border border-[color:var(--border)] p-8">
            <h2 className="text-xl font-bold text-[color:var(--fg)]">{t.beliefs}</h2>
            <ul className="mt-6 space-y-3">
              {bw.beliefs.map((belief: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[color:var(--muted)]">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fae6ea] text-xs font-bold text-[#ce0e2d]">
                    {i + 1}
                  </span>
                  {belief}
                </li>
              ))}
            </ul>
          </div>

          {/* 핵심 가치 */}
          <h2 className="mt-16 text-center text-display-sm font-bold text-[color:var(--fg)]">
            {t.coreValues}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {coreValues.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-[color:var(--border)] p-8"
              >
                <div
                  className="inline-flex rounded-xl px-4 py-2 text-sm font-bold"
                  style={{ backgroundColor: value.bg, color: value.color }}
                >
                  {value.title} ({value.label})
                </div>
                <p className="mt-4 text-sm font-medium text-[color:var(--fg)]">
                  {value.goal}
                </p>
                <ul className="mt-4 space-y-2">
                  {value.activities.map((activity: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[color:var(--muted)]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: value.color }} />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
