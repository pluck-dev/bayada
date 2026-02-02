import { notFound } from "next/navigation";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { services, getServiceBySlug } from "@/data/services";
import { ServiceDetailTemplate } from "@/components/templates/ServiceDetailTemplate";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.nameEn} - ${service.nameKo} | BAYADA`,
    description: service.description,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return <ServiceDetailTemplate service={service} dict={dict} locale={locale} />;
}
