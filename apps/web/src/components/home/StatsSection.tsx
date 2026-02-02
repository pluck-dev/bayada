"use client";

import { Globe, Users, Award, Clock } from "lucide-react";
import { CountUp } from "@/components/animations/CountUp";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { Container } from "@/components/layout/Container";
import type { Dictionary } from "@bayada/shared/i18n";

interface StatsSectionProps {
  dict: Dictionary;
}

export function StatsSection({ dict }: StatsSectionProps) {
  const t = dict.web.home;

  const stats = [
    {
      icon: Award,
      value: 50,
      suffix: "+",
      label: t.statsYearsLabel,
      color: "#ce0e2d",
    },
    {
      icon: Globe,
      value: 23,
      suffix: "",
      label: t.statsCountriesLabel,
      color: "#2563eb",
    },
    {
      icon: Users,
      value: 30000,
      suffix: "+",
      label: t.statsEmployeesLabel,
      color: "#16a34a",
    },
    {
      icon: Clock,
      value: 365,
      suffix: "",
      label: t.stats365Label,
      color: "#d97706",
    },
  ];

  return (
    <SectionWrapper className="bg-white py-[var(--section-gap-sm)]">
      <Container>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${stat.color}10` }}
              >
                <stat.icon className="h-7 w-7" style={{ color: stat.color }} />
              </div>
              <p className="text-display-sm font-bold text-[color:var(--fg)]">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}
