import { prisma } from "../src/index";
import { services } from "../../../apps/web/src/data/services";
import { servicePageDetails } from "../../../apps/web/src/data/service-page-details";
import { parseWebServiceDocument, WEB_SERVICE_PREFIX } from "../../shared/src/web-services";

// One-time import marker prevents future reruns from resurrecting deleted services.
async function main() {
  const imported = await prisma.$transaction(async (tx) => {
    const key = "web.services.imported.v1";
    if (await tx.siteSetting.findUnique({ where: { key } })) return 0;
    const data = services.map((service, order) => {
      const detail = servicePageDetails[service.slug];
      if (!detail) throw new Error(`Missing service detail: ${service.slug}`);
      const doc = parseWebServiceDocument({ service, detail, published: true, order });
      return { slug: WEB_SERVICE_PREFIX + service.slug, title: service.nameKo, content: JSON.stringify(doc) };
    });
    const result = await tx.page.createMany({ data, skipDuplicates: true });
    await tx.siteSetting.create({ data: { key, value: { importedAt: new Date().toISOString(), count: result.count } } });
    return result.count;
  });
  console.log(`Imported ${imported} website service documents.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
