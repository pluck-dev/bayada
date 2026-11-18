import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma } from "@bayada/db";
import { parseWebServiceDocument } from "@bayada/shared/web-services";
import { services } from "../src/data/services";
import { servicePageDetails } from "../src/data/service-page-details";
import { navigationForServices } from "../src/data/navigation";
import { getServiceDocuments, getServiceDocument } from "../src/lib/web-services";

const docs = services.map((service, order) => ({ service, detail: servicePageDetails[service.slug], published: true, order }));
test("every existing service can be imported without losing its detail content", () => {
  assert.ok(docs.length > 10);
  for (const doc of docs) {
    const parsed = parseWebServiceDocument(doc);
    assert.equal(parsed.service.slug, doc.service.slug);
    assert.equal(parsed.detail.longDescription, doc.detail?.longDescription);
    assert.deepEqual(parsed.detail.faqs, doc.detail?.faqs);
  }
});
test("service validation prevents invalid documents and derives links and numbered steps", () => {
  const first = docs[0]!;
  assert.throws(() => parseWebServiceDocument({ ...first, service: { ...first.service, slug: "../../auth" } }));
  assert.throws(() => parseWebServiceDocument({ ...first, service: { ...first.service, image: "javascript:alert(1)" } }));
  assert.throws(() => parseWebServiceDocument({ ...first, detail: {} }));
  assert.throws(() => parseWebServiceDocument({ ...first, order: -1 }));
  const parsed = parseWebServiceDocument({ ...first, service: { ...first.service, href: "https://evil.invalid", process: [{ step: 99, title: "상담", description: "상담 신청" }] } });
  assert.equal(parsed.service.href, `/what-we-do/${first.service.slug}`);
  assert.equal(parsed.service.process[0]?.step, 1);
});
test("public service reads reflect visibility, deletion, ordering and database failures", async () => {
  const url = process.env.DATABASE_URL;
  const original = prisma.page.findMany;
  process.env.DATABASE_URL = "postgresql://unused-test-connection";
  try {
    prisma.page.findMany = (async () => docs.slice(0, 3).map((doc, index) => ({ content: JSON.stringify({ ...doc, published: index !== 1, order: 2 - index }) }))) as unknown as typeof prisma.page.findMany;
    const visible = await getServiceDocuments();
    assert.deepEqual(visible.map((doc) => doc.service.slug), [docs[2]!.service.slug, docs[0]!.service.slug]);
    assert.equal(await getServiceDocument(docs[1]!.service.slug), undefined);
    prisma.page.findMany = (async () => []) as typeof prisma.page.findMany;
    assert.deepEqual(await getServiceDocuments(), []);
    prisma.page.findMany = (async () => { throw new Error("offline"); }) as typeof prisma.page.findMany;
    await assert.rejects(getServiceDocuments(), /offline/);
  } finally {
    prisma.page.findMany = original;
    if (url === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = url;
  }
});

test("navigation exposes only provided published services", () => {
  assert.equal(navigationForServices([]).find((item) => item.href === "/what-we-do"), undefined);
  const service = services[0]!;
  const menu = navigationForServices([service]).find((item) => item.href === "/what-we-do");
  assert.deepEqual(menu?.children?.flatMap((group) => group.items.map((item) => item.href)), [service.href]);
});
