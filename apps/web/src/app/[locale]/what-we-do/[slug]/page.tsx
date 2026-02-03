import { notFound } from "next/navigation";
import { getDictionary } from "@bayada/shared/i18n";
import type { Locale } from "@bayada/shared/i18n";
import { createMetadata, SITE_URL } from "@/lib/seo";
import { services, getServiceBySlug } from "@/data/services";
import { ServiceDetailTemplate } from "@/components/templates/ServiceDetailTemplate";
import { ServiceJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return createMetadata({
    title: `${service.nameKo} (${service.nameEn})`,
    description: service.description,
    path: `/${locale}/what-we-do/${slug}`,
  });
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

  return (
    <>
      <ServiceJsonLd
        name={`${service.nameKo} - ${service.nameEn}`}
        description={service.description}
        url={`${SITE_URL}/${locale}/what-we-do/${slug}`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "홈", url: `${SITE_URL}/${locale}` },
          { name: "서비스 소개", url: `${SITE_URL}/${locale}/what-we-do` },
          { name: service.nameKo, url: `${SITE_URL}/${locale}/what-we-do/${slug}` },
        ]}
      />
      <ServiceDetailTemplate service={service} dict={dict} locale={locale} />
    </>
  );
}
