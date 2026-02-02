import type { Metadata } from "next";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getUsageGuideContent } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { Phone, Home, ClipboardList, HeartHandshake, Activity, Stethoscope } from "lucide-react";

export const metadata: Metadata = {
  title: "이용안내 | BAYADA 홈헬스케어",
  description: "바야다홈헬스케어 서비스 이용 안내 - 6단계로 간편하게 시작하세요.",
};

const stepIcons = [Phone, Home, ClipboardList, HeartHandshake, Activity, Stethoscope];
const stepColors = ["#ce0e2d", "#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2"];

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const guide = getUsageGuideContent();

  return (
    <>
      <PageHero title={dict.web.guide.title} />
      <section className="py-[var(--section-gap)]">
        <Container narrow>
          <div className="space-y-0">
            {guide.steps.map((step: { step: number; title: string; description: string }, i: number) => {
              const Icon = stepIcons[i] || Phone;
              const color = stepColors[i];
              return (
                <div key={step.step} className="relative flex gap-6 pb-12 last:pb-0">
                  {/* 타임라인 라인 */}
                  {i < guide.steps.length - 1 && (
                    <div className="absolute left-7 top-14 h-[calc(100%-3.5rem)] w-0.5 bg-[color:var(--border)]" />
                  )}

                  {/* 아이콘 */}
                  <div
                    className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="h-7 w-7" style={{ color }} />
                  </div>

                  {/* 내용 */}
                  <div className="pt-1">
                    <span className="text-xs font-bold" style={{ color }}>
                      STEP {step.step}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-[color:var(--fg)]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
