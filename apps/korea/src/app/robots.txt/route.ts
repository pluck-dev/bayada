export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = `${request.headers.get('x-forwarded-proto') || url.protocol.slice(0, -1)}://${request.headers.get('host') || url.host}`;
  return new Response('User-agent: *\nDisallow: /api/\nSitemap: ' + origin + '/sitemap.xml\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
