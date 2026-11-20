import { normalizeAssetPaths } from "@bayada/korea";
import { pageByPath, pages, renderPage, incrementBoardView } from "@bayada/korea/server";
import { addReviewEntry } from "@/lib/review-presentation";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = `${request.headers.get("x-forwarded-proto") || url.protocol.slice(0, -1)}://${request.headers.get("host") || url.host}`;
  const legacyAsset = normalizeAssetPaths(url.pathname + url.search);
  if (legacyAsset !== url.pathname + url.search && legacyAsset.startsWith("/assets/")) return Response.redirect(new URL(legacyAsset, origin), 308);
  let page;
  const legacyId = url.searchParams.get("page_id") || url.searchParams.get("p");
  try { page = legacyId && ["/", "/index.php"].includes(url.pathname) ? pages.find(p => p.legacyId > 0 && String(p.legacyId) === legacyId) : pageByPath(url.pathname); } catch { return new Response("Not found", { status: 404 }); }
  if (!page) return new Response("Not found", { status: 404 });
  const html = await renderPage(page, url.searchParams, origin);
  if (html === null) return new Response("Not found", { status: 404 });
  const headers = new Headers({ "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin" });
  const postId = url.searchParams.get('vid') || url.searchParams.get('board_pid');
  if (page.board && postId && /^[a-zA-Z0-9_-]{1,80}$/.test(postId)) {
    const name = 'korea_view_' + page.board + '_' + postId;
    const seen = request.headers.get('cookie')?.split(';').some(part => part.trim() === name + '=1');
    if (!seen) {
      try { await incrementBoardView(page.board, postId); headers.append('set-cookie', `${name}=1; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax${origin.startsWith('https:') ? '; Secure' : ''}`); }
      catch(error) { console.error('[korea view counter]', error instanceof Error ? error.name : 'failed'); }
    }
  }
  return new Response(addReviewEntry(html, url), { headers });
}
