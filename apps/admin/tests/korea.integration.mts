import assert from "node:assert/strict";
import { writeFileSync, readFileSync } from "node:fs";
import { hash } from "bcryptjs";
import { prisma } from "@bayada/db";
import { pages, quarantine, cleanRichText } from "@bayada/korea/server";
import publicPosts from "../../../packages/korea/content/boards.json";
import { parsePost } from "@bayada/korea";
const db = new URL(process.env.DATABASE_URL || "http://invalid");
if (db.hostname !== "127.0.0.1" || db.port !== "55433" || db.pathname !== "/bayada_functional_qa") throw new Error("Only the isolated synthetic QA DB is allowed.");
const password = process.env.QA_TEST_PASSWORD;
if (!password) throw new Error("Set QA_TEST_PASSWORD from the private QA configuration.");
const adminBase = "http://localhost:3442", publicBase = "http://localhost:3300";
class Client {
  cookies = new Map<string, string>();
  take(response: Response) { for (const cookie of response.headers.getSetCookie()) { const pair = cookie.split(';')[0]!; const i = pair.indexOf('='); this.cookies.set(pair.slice(0, i), pair.slice(i + 1)); } }
  async request(path: string, options: RequestInit = {}) {
    const response = await fetch(adminBase + path, { ...options, headers: { Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; '), ...options.headers }, redirect: 'manual' }); this.take(response); return response;
  }
  async login(email: string) {
    const csrf = await (await this.request('/api/auth/csrf')).json();
    await this.request('/api/auth/callback/credentials', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', 'X-Auth-Return-Redirect': '1' }, body: new URLSearchParams({ email, password: password!, csrfToken: csrf.csrfToken, callbackUrl: adminBase + '/ko' }) });
    assert.equal((await (await this.request('/api/auth/session')).json()).user.email, email);
  }
}
async function main() {
  const prefix = 'qa-korea-' + Date.now().toString(36);
  writeFileSync('output/korea-integration-evidence.json', JSON.stringify({ passed: false, state: 'running', runId: prefix }));
  // These public fixtures belong to this isolated QA namespace, never the live DB.
  for (const value of publicPosts) {
    const post = parsePost(value); post.content = cleanRichText(post.content);
    const slug = `korea/post/${post.board}/${post.id}`, data = { title: post.title, content: JSON.stringify(post) };
    await prisma.page.upsert({ where: { slug }, create: { slug, ...data }, update: data });
  }
  const secret = await hash(password!, 10);
  const accounts: Record<string, { id: string; email: string }> = {};
  for (const [name, permissions] of Object.entries({ admin: null, editor: ['korea.content'], inquiries: ['korea.inquiries'], brand: ['web.content'] })) {
    const key = 'custom_' + prefix + '_' + name;
    if (permissions) await prisma.adminRoleDef.create({ data: { key, name: 'QA ' + name, permissions, isSystem: false } });
    accounts[name] = await prisma.user.create({ data: { email: `${prefix}-${name}@example.test`, name: `QA ${name}`, role: permissions ? 'STUDENT' : 'ADMIN', customRoleKey: permissions ? key : null, status: 'APPROVED', password: secret }, select: { id: true, email: true } });
  }
  writeFileSync('output/korea-qa-fixtures.json', JSON.stringify({ prefix, accounts, createdAt: new Date().toISOString() }, null, 2));
  const clients: Record<string, Client> = {};
  for (const name of Object.keys(accounts)) { clients[name] = new Client(); await clients[name]!.login(accounts[name]!.email); }
  const checks: string[] = [];
  const check = async (name: string, run: () => Promise<void>) => { await run(); checks.push(name); };
  await check('anonymous CMS page redirects to login', async () => { assert.equal((await new Client().request('/ko/korea')).status, 307); });
  for (const route of ['/ko/korea', '/ko/korea/menu', '/ko/korea/boards', '/ko/korea/partners', '/ko/korea/archive']) {
    await check(`korea editor allowed ${route}`, async () => assert.equal((await clients.editor!.request(route)).status, 200));
    await check(`brand editor blocked ${route}`, async () => assert.equal((await clients.brand!.request(route)).status, 307));
  }
  await check('korea editor cannot read private inquiries', async () => assert.equal((await clients.editor!.request('/ko/korea/inquiries')).status, 307));
  await check('inquiry operator can read inquiries', async () => assert.equal((await clients.inquiries!.request('/ko/korea/inquiries')).status, 200));
  await check('inquiry operator can manage reception settings', async () => assert.equal((await clients.inquiries!.request('/ko/korea/settings')).status, 200));
  await check('content editor cannot manage private reception settings', async () => assert.equal((await clients.editor!.request('/ko/korea/settings')).status, 307));
  await check('inquiry operator cannot edit pages', async () => assert.equal((await clients.inquiries!.request('/ko/korea')).status, 307));
  await check('korea editor cannot edit renewal brand', async () => assert.equal((await clients.editor!.request('/ko/web/pages')).status, 307));
  await check('anonymous media upload blocked', async () => assert.equal((await new Client().request('/api/korea/media', { method: 'POST' })).status, 401));
  await check('brand editor media upload blocked', async () => assert.equal((await clients.brand!.request('/api/korea/media', { method: 'POST' })).status, 403));
  await check('cross-origin media upload blocked', async () => assert.equal((await clients.editor!.request('/api/korea/media', { method: 'POST', headers: { Origin: 'https://evil.test' } })).status, 403));
  let mediaUrl = '';
  await check('PNG upload is public in korea only', async () => {
    const form = new FormData(); form.append('file', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aS1cAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' }), 'qa.png');
    const response = await clients.editor!.request('/api/korea/media', { method: 'POST', headers: { Origin: adminBase }, body: form });
    assert.equal(response.status, 201); mediaUrl = (await response.json()).url; const downloaded = await fetch(mediaUrl); assert.equal(downloaded.status, 200); assert.equal(downloaded.headers.get('content-type'), 'image/png');
  });
  await check('HTML disguised as an image rejected', async () => {
    const form = new FormData(); form.append('file', new Blob(['<script>alert(1)</script>'], { type: 'image/png' }), 'x.png');
    assert.equal((await clients.editor!.request('/api/korea/media', { method: 'POST', headers: { Origin: adminBase }, body: form })).status, 400);
  });
  const inquiry = { title: prefix, name: 'QA synthetic', phone: '01000000000', message: 'Synthetic test only', services: ['QA'], location: 'QA', privacyConsent: true };
  const qaIp = '2001:db8:' + Date.now().toString(16).match(/.{1,4}/g)!.join(':') + '::1';
  const send = (body: unknown, origin = publicBase) => fetch(publicBase + '/api/inquiries', { method: 'POST', headers: { 'content-type': 'application/json', Origin: origin, 'x-forwarded-for': qaIp }, body: JSON.stringify(body) });
  await check('cross-origin inquiry rejected', async () => assert.equal((await send(inquiry, 'https://evil.test')).status, 403));
  await check('inquiry requires explicit consent', async () => assert.equal((await send({ ...inquiry, privacyConsent: false })).status, 400));
  await check('careers inquiry requires email and position', async () => assert.equal((await send({ ...inquiry, formType: 'CAREERS' })).status, 400));
  await check('careers inquiry uses its own fields and allows an optional message', async () => {
    const response = await send({ ...inquiry, formType: 'CAREERS', email: 'qa@example.test', position: 'QA', message: '' }); assert.equal(response.status, 201);
    const reference = (await response.json()).message.match(/KR-\d{8}-[A-F0-9]{8}/)?.[0]; assert.ok(reference);
    const row = await prisma.page.findFirstOrThrow({ where: { slug: { startsWith: 'korea/inquiry/' }, title: reference } });
    const value = JSON.parse(row.content); assert.equal(value.formType, 'CAREERS'); assert.equal(value.email, 'qa@example.test'); assert.equal(value.position, 'QA'); assert.equal(value.message, '');
  });
  await check('valid inquiry persisted privately', async () => {
    const response = await send(inquiry); assert.equal(response.status, 201);
    const reference = (await response.json()).message.match(/KR-\d{8}-[A-F0-9]{8}/)?.[0]; assert.ok(reference);
    const row = await prisma.page.findFirstOrThrow({ where: { slug: { startsWith: 'korea/inquiry/' }, title: reference } });
    const value = JSON.parse(row.content); assert.equal(value.formType, 'CONSULTATION'); assert.equal(value.name, inquiry.name); assert.equal(value.privacyConsent, true); assert.equal(value.status, 'NEW');
    assert.equal((await fetch(publicBase + '/' + row.slug)).status, 404);
  });
  await check('unknown page and WordPress admin are not proxied to the legacy backend', async () => { assert.equal((await fetch(publicBase + '/wp-admin/')).status, 404); assert.equal((await fetch(publicBase + '/not-a-real-page')).status, 404); });
  await check('IP throttling is atomic under concurrent requests', async () => {
    const responses = await Promise.all(Array.from({ length: 4 }, () => send(inquiry)));
    assert.deepEqual(responses.map(r => r.status).sort(), [201, 201, 201, 429]);
  });
  await check('article view count increments once with its cookie without changing editor revision', async () => {
    const key = 'korea.views.bayadab_01.13';
    const before = await prisma.siteSetting.findUnique({ where: { key } }); const oldCount = Number((before?.value as { count?: number } | undefined)?.count) || 0;
    const document = await prisma.page.findUniqueOrThrow({ where: { slug: 'korea/post/bayadab_01/13' } });
    const response = await fetch(publicBase + '/%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD2/?vid=13'); assert.equal(response.status, 200);
    const cookie = response.headers.getSetCookie().find(c => c.startsWith('korea_view_'))?.split(';')[0]; assert.ok(cookie);
    await fetch(publicBase + '/%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD2/?vid=13', { headers: { Cookie: cookie } });
    const after = await prisma.siteSetting.findUniqueOrThrow({ where: { key } }); assert.equal((after.value as { count: number }).count, oldCount + 1);
    const current = await prisma.page.findUniqueOrThrow({ where: { slug: document.slug } }); assert.equal(current.updatedAt.toISOString(), document.updatedAt.toISOString());
  });
  let pageCount = 0;
  for (const page of pages) {
    const response = await fetch(publicBase + encodeURI(page.path)); assert.equal(response.status, 200, page.path); const html = await response.text(); assert.ok(!html.includes('id="wpadminbar"')); assert.ok(!html.includes('{{KOREA_')); pageCount++;
  }
  checks.push(`all ${pageCount} captured public routes respond without unresolved markers`);
  for (const item of quarantine) assert.equal((await fetch(publicBase + encodeURI(item.path))).status, 404, item.path);
  checks.push(`all ${quarantine.length} unreviewed source paths stay unpublished`);
  await check('legacy page ID resolves to the original page', async () => { const response = await fetch(publicBase + '/?page_id=218'); assert.equal(response.status, 200); assert.ok((await response.text()).includes('page-id-218')); });
  await check('sitemap excludes quarantined paths', async () => { const response = await fetch(publicBase + '/sitemap.xml'); assert.equal(response.status, 200); const html = await response.text(); assert.equal((html.match(/<loc>/g) || []).length, pages.length); });
  const fixtures = { prefix, accounts, mediaUrl, createdAt: new Date().toISOString() };
  writeFileSync('output/korea-qa-fixtures.json', JSON.stringify(fixtures, null, 2));
  writeFileSync('output/korea-integration-evidence.json', JSON.stringify({ passed: true, count: checks.length, checks, publicRoutes: pageCount, environment: 'isolated synthetic QA database', source: 'current worktree', fixturesRetainedForUiCheck: true }, null, 2));
  console.log(JSON.stringify({ passed: true, checks: checks.length, publicRoutes: pageCount }));
}
main().catch(error => { writeFileSync('output/korea-integration-evidence.json', JSON.stringify({ passed: false, error: error instanceof Error ? error.message : 'Failed' }, null, 2)); console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
