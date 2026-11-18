import { cache } from "react";
import { prisma } from "@bayada/db";
import { WEB_PAGE_DEFAULTS, WEB_PAGE_PREFIX, parseWebPageContent } from "@bayada/shared/web-page-content";
import type { WebPageKey } from "@bayada/shared/web-page-content";
export const getWebPageContent = cache(async <K extends WebPageKey>(key: K): Promise<typeof WEB_PAGE_DEFAULTS[K]> => {
  if (!process.env.DATABASE_URL) return WEB_PAGE_DEFAULTS[key];
  const row = await prisma.page.findUnique({ where: { slug: WEB_PAGE_PREFIX + key } });
  return row ? parseWebPageContent(key, JSON.parse(row.content)) : WEB_PAGE_DEFAULTS[key];
});
