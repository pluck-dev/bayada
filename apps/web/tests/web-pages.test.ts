import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma } from "@bayada/db";
import { WEB_PAGE_DEFAULTS, isWebPageKey, parseWebPageContent } from "@bayada/shared/web-page-content";
import type { WebPageKey } from "@bayada/shared/web-page-content";
import { getWebPageContent } from "../src/lib/web-pages";

test("all original page contents remain valid, including nested lists", () => {
  for (const key of Object.keys(WEB_PAGE_DEFAULTS) as WebPageKey[]) {
    const content = parseWebPageContent(key, WEB_PAGE_DEFAULTS[key]);
    assert.ok(content);
  }
  assert.equal(isWebPageKey("about"), true);
  assert.equal(isWebPageKey("__proto__"), false);
  assert.equal(isWebPageKey("refund"), false);
});
test("page validation rejects malformed structures and oversized content", () => {
  assert.throws(() => parseWebPageContent("guide", { title: "x", steps: "invalid" }));
  assert.throws(() => parseWebPageContent("privacy", {}));
  assert.throws(() => parseWebPageContent("guide", { ...WEB_PAGE_DEFAULTS.guide, title: "x".repeat(20001) }));
  const about = structuredClone(WEB_PAGE_DEFAULTS.about);
  about.brandColors[0]!.hex = "url(javascript:alert(1))";
  assert.throws(() => parseWebPageContent("about", about));
});
test("list edits preserve empty lists and assign unique anchors and step numbers", () => {
  assert.deepEqual(parseWebPageContent("guide", { ...WEB_PAGE_DEFAULTS.guide, steps: [] }).steps, []);
  const step = WEB_PAGE_DEFAULTS.guide.steps[0]!;
  const guide = parseWebPageContent("guide", { ...WEB_PAGE_DEFAULTS.guide, steps: [step, step] });
  assert.deepEqual(guide.steps.map((s) => s.step), [1, 2]);
  const section = WEB_PAGE_DEFAULTS.terms.sections[0]!;
  const terms = parseWebPageContent("terms", { sections: [section, section] });
  assert.deepEqual(terms.sections.map((s) => s.id), ["section-1", "section-2"]);
});
test("website reads stored page changes, explicit empty lists and intentional default reset", async () => {
  const original = prisma.page.findUnique;
  const url = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://unused-test-connection";
  try {
    prisma.page.findUnique = (async () => ({ content: JSON.stringify({ ...WEB_PAGE_DEFAULTS.guide, title: "수정된 이용안내", steps: [] }) })) as unknown as typeof prisma.page.findUnique;
    const edited = await getWebPageContent("guide");
    assert.equal(edited.title, "수정된 이용안내");
    assert.deepEqual(edited.steps, []);
    prisma.page.findUnique = (async () => null) as typeof prisma.page.findUnique;
    assert.deepEqual(await getWebPageContent("guide"), WEB_PAGE_DEFAULTS.guide);
    prisma.page.findUnique = (async () => { throw new Error("offline"); }) as typeof prisma.page.findUnique;
    await assert.rejects(getWebPageContent("guide"), /offline/);
  } finally {
    prisma.page.findUnique = original;
    if (url === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = url;
  }
});
