import { cache } from "react";
import { prisma } from "@bayada/db";
import { parseWebServiceDocument, WEB_SERVICE_PREFIX } from "@bayada/shared/web-services";
import type { WebServiceDocument } from "@bayada/shared/web-services";
import { services } from "@/data/services";
import { servicePageDetails } from "@/data/service-page-details";

export const getServiceDocuments = cache(async (): Promise<WebServiceDocument[]> => {
  if (!process.env.DATABASE_URL) return services.flatMap((service, order) => {
    const detail = servicePageDetails[service.slug];
    return detail ? [{ service, detail, published: true, order }] : [];
  });
  const rows = await prisma.page.findMany({ where: { slug: { startsWith: WEB_SERVICE_PREFIX } } });
  return rows.map((row) => parseWebServiceDocument(JSON.parse(row.content))).filter((doc) => doc.published).sort((a, b) => a.order - b.order || a.service.slug.localeCompare(b.service.slug));
});
export async function getServices() { return (await getServiceDocuments()).map((doc) => doc.service); }
export async function getServiceDocument(slug: string) { return (await getServiceDocuments()).find((doc) => doc.service.slug === slug); }
