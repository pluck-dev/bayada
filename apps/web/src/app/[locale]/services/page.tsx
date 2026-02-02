import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { getAllServices } from "@/data/content";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "서비스 | BAYADA 홈헬스케어",
  description: "바야다홈헬스케어의 방문요양, 방문간호, 치매케어, 맞춤운동, 음악요법 등 다양한 서비스를 소개합니다.",
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const services = getAllServices();

  return (
    <>
      <PageHero
        title={dict.web.services.allServices}
        subtitle="전문적인 케어를 가정에서 받으세요"
      />
      <section className="py-[var(--section-gap)]">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.key}
                href={`/${locale}${service.href}`}
                className="group overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white transition-all hover:shadow-[var(--shadow-medium)] hover:border-transparent hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-lg font-bold text-[color:var(--fg)] group-hover:text-[#ce0e2d] transition-colors">
                    {service.title}
                    {service.subtitle && (
                      <span className="ml-2 text-sm font-normal text-[color:var(--muted)]">
                        {service.subtitle}
                      </span>
                    )}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-[color:var(--muted)]">
                    {service.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#ce0e2d]">
                    {dict.web.services.viewDetail}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
