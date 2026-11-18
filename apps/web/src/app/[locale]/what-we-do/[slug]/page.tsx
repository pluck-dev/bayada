import { notFound } from "next/navigation";
import { createMetadata, SITE_URL } from "@/lib/seo";
import { getServices, getServiceDocument } from "@/lib/web-services";
import { ServiceDetailPage } from "@/components/service-detail/ServiceDetailPage";
import { ServiceJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const service = (await getServiceDocument(slug))?.service;
  if (!service) return {};
  return createMetadata({
    title: `${service.nameKo} (${service.nameEn})`,
    description: service.description,
    path: `/${locale}/what-we-do/${slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const doc = await getServiceDocument(slug);
  const service = doc?.service;
  const detail = doc?.detail;

  if (!service || !detail) {
    notFound();
  }

  // 관련 서비스 + 현재 서비스 제외한 나머지에서 최대 7개
  const services = await getServices();
  const related = services.filter((entry) => service.relatedServices.includes(entry.slug) && entry.slug !== slug).slice(0, 3);
  const otherServices = services
    .filter((s) => s.slug !== slug && !related.find((r) => r.slug === s.slug))
    .slice(0, 4);
  const allRelated = [...related, ...otherServices];

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
      <ServiceDetailPage
        service={service}
        detail={detail}
        relatedServices={allRelated}
        locale={locale}
      />
    </>
  );
}
