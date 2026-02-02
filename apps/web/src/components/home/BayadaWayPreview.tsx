"use client";

import { Heart, Star, Shield } from "lucide-react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { Container } from "@/components/layout/Container";
import { FadeIn } from "@/components/animations/FadeIn";
import type { Dictionary } from "@bayada/shared/i18n";

interface BayadaWayPreviewProps {
  dict: Dictionary;
  bayadaWay: {
    compassion: { goal: string };
    excellence: { goal: string };
    reliability: { goal: string };
  };
}

export function BayadaWayPreview({ dict, bayadaWay }: BayadaWayPreviewProps) {
  const t = dict.web.home;

  const values = [
    {
      icon: Heart,
      title: t.compassion,
      label: t.compassionLabel,
      description: bayadaWay.compassion.goal,
      color: "#ce0e2d",
      bg: "#fae6ea",
    },
    {
      icon: Star,
      title: t.excellence,
      label: t.excellenceLabel,
      description: bayadaWay.excellence.goal,
      color: "#2563eb",
      bg: "#dbeafe",
    },
    {
      icon: Shield,
      title: t.reliability,
      label: t.reliabilityLabel,
      description: bayadaWay.reliability.goal,
      color: "#16a34a",
      bg: "#dcfce7",
    },
  ];

  return (
    <SectionWrapper className="bg-white">
      <Container>
        <div className="text-center">
          <h2 className="text-display-lg font-bold text-[color:var(--fg)]">
            {t.bayadaWayTitle}
          </h2>
          <p className="mt-4 text-body-lg text-[color:var(--muted)]">
            {t.bayadaWaySubtitle}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {values.map((value, i) => (
            <FadeIn key={value.title} delay={i * 0.15}>
              <div className="group rounded-2xl border border-[color:var(--border)] p-8 transition-all hover:shadow-[var(--shadow-medium)] hover:border-transparent">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: value.bg }}
                >
                  <value.icon className="h-7 w-7" style={{ color: value.color }} />
                </div>
                <h3 className="mt-6 text-xl font-bold text-[color:var(--fg)]">
                  {value.title}
                </h3>
                <p className="text-sm font-medium text-[color:var(--muted)]">
                  {value.label}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--muted)]">
                  {value.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}
