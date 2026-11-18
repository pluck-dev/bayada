import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma } from "@bayada/db";
import { getAllPosts, getFaqCategories, getHeroSlides, getReviews } from "../src/lib/web-content";

test("CMS empty, hidden, and failed reads never resurrect demo content", async () => {
  const originalUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://unused-test-connection";
  const models = [prisma.webBlogPost, prisma.webFaqCategory, prisma.webHeroSlide, prisma.webReview];
  const originals = models.map((model) => model.findMany);
  try {
    for (const model of models) model.findMany = (async () => []) as typeof model.findMany;
    for (const read of [getAllPosts, getFaqCategories, getHeroSlides, getReviews]) {
      assert.deepEqual(await read(), []);
    }
    prisma.webHeroSlide.findMany = (async () => [{ visible: false }]) as unknown as typeof prisma.webHeroSlide.findMany;
    prisma.webReview.findMany = (async () => [{ visible: false }]) as unknown as typeof prisma.webReview.findMany;
    assert.deepEqual(await getHeroSlides(), []);
    assert.deepEqual(await getReviews(), []);
    const unavailable = new Error("database unavailable");
    prisma.webBlogPost.findMany = (async () => { throw unavailable; }) as typeof prisma.webBlogPost.findMany;
    await assert.rejects(getAllPosts(), unavailable);
    delete process.env.DATABASE_URL;
    assert.ok((await getHeroSlides()).length > 0, "DB-free builds retain static defaults");
  } finally {
    models.forEach((model, index) => { model.findMany = originals[index]!; });
    if (originalUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalUrl;
  }
});
