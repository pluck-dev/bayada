import { notFound } from "next/navigation";
import { createMetadata, SITE_URL } from "@/lib/seo";
import { services, getServiceBySlug, getRelatedServices } from "@/data/services";
import { getServicePageDetail } from "@/data/service-page-details";
import { ServiceDetailPage } from "@/components/service-detail/ServiceDetailPage";
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

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const service = getServiceBySlug(slug);
  const detail = getServicePageDetail(slug);

  if (!service || !detail) {
    notFound();
  }

  // 관련 서비스 + 현재 서비스 제외한 나머지에서 최대 7개
  const related = getRelatedServices(slug, 3);
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
