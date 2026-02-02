"use client";

import { Phone, Home, ClipboardList, HeartHandshake, Activity, Stethoscope } from "lucide-react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { Container } from "@/components/layout/Container";
import { FadeIn } from "@/components/animations/FadeIn";
import type { Dictionary } from "@bayada/shared/i18n";

interface UsageStep {
  step: number;
  title: string;
  description: string;
}

interface UsageStepsProps {
  dict: Dictionary;
  steps: UsageStep[];
}

const stepIcons = [Phone, Home, ClipboardList, HeartHandshake, Activity, Stethoscope];

export function UsageSteps({ dict, steps }: UsageStepsProps) {
  const t = dict.web.home;

  return (
    <SectionWrapper className="bg-[color:var(--surface)]">
      <Container>
        <div className="text-center">
          <h2 className="text-display-lg font-bold text-[color:var(--fg)]">
            {t.usageTitle}
          </h2>
          <p className="mt-4 text-body-lg text-[color:var(--muted)]">
            {t.usageSubtitle}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = stepIcons[i] || Phone;
            return (
              <FadeIn key={step.step} delay={i * 0.1}>
                <div className="relative rounded-2xl bg-white p-6 shadow-[var(--shadow-subtle)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fae6ea]">
                      <Icon className="h-6 w-6 text-[#ce0e2d]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#ce0e2d]">
                        STEP {step.step}
                      </span>
                      <h3 className="mt-1 text-lg font-semibold text-[color:var(--fg)]">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </SectionWrapper>
  );
}
