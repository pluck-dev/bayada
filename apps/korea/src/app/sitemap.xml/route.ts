import { prisma } from "@bayada/db";
import { pages } from "@bayada/korea/server";
import { escapeHtml } from "@bayada/korea";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = `${request.headers.get('x-forwarded-proto') || url.protocol.slice(0, -1)}://${request.headers.get('host') || url.host}`;
  const rows = await prisma.page.findMany({ where: { slug: { startsWith: 'korea/page/' } }, select: { slug: true, content: true } });
  const hidden = new Set(rows.filter(row => JSON.parse(row.content).published === false).map(row => row.slug.slice('korea/page/'.length)));
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + pages.filter(p => !hidden.has(p.key)).map(p => '<url><loc>' + escapeHtml(origin + encodeURI(p.path)) + '</loc></url>').join('') + '</urlset>', { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
