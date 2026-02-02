"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@bayada/ui";
import {
  Stethoscope,
  HandHeart,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { useDictionary } from "./DictionaryProvider";

export function ServicesSection() {
  const dict = useDictionary();

  const services = [
    {
      icon: Stethoscope,
      title: dict.web.visitingNurse,
      description: dict.web.visitingNurseDesc,
    },
    {
      icon: HandHeart,
      title: dict.web.homeCare,
      description: dict.web.homeCareDesc,
    },
    {
      icon: GraduationCap,
      title: dict.web.education,
      description: dict.web.educationDesc,
    },
  ];

  return (
    <section id="services" className="bg-[color:var(--bg)] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#ce0e2d]">
            Our Services
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[color:var(--fg)] sm:text-4xl">
            {dict.web.services}
          </h2>
        </div>

        {/* 서비스 카드 */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.title}
                className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
              >
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#fae6ea] transition-colors group-hover:bg-[#ce0e2d]">
                    <Icon className="h-7 w-7 text-[#ce0e2d] transition-colors group-hover:text-white" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-[color:var(--muted)]">
                    {service.description}
                  </p>
                  <a
                    href="#contact"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#ce0e2d] transition-colors hover:text-[#980019]"
                  >
                    {dict.web.learnMore}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
