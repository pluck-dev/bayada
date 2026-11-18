import { WEB_PAGE_DEFAULTS } from "@bayada/shared/web-page-content";
import type { WebPageKey, AudienceSegment } from "@bayada/shared/web-page-content";
import { getWebPageContent } from "./web-pages";
export async function getManagedAudienceSegments() {
 const keys = Object.keys(WEB_PAGE_DEFAULTS).filter(k => k.startsWith("audience")) as WebPageKey[];
 return await Promise.all(keys.map(k => getWebPageContent(k))) as AudienceSegment[];
}
