import assert from "node:assert/strict";
import test from "node:test";
import { normalizeAssetPaths, normalizeAssetData, parseEdits, parseMenu, parsePartners, parsePost, renderTemplate, safeUrl } from "../src/model";
import { cleanRichText, templates } from "../src/server";

test('old saved asset URLs use neutral roots and discard unused CDN options', () => {
  assert.equal(normalizeAssetPaths('/wp-content/uploads/2025/04/logo.png?fit=500%2C200&ssl=1'), '/assets/media/2025/04/logo.png');
  assert.equal(normalizeAssetPaths('https://www.bayadakorea.com/wp-content/plugins/example/app.js?ver=2'), '/assets/vendor/example/app.js?ver=2');
  assert.equal(normalizeAssetPaths('/wp-includes/font.svg?ver=1#glyph'), '/assets/runtime/font.svg?ver=1#glyph');
  assert.equal(normalizeAssetPaths('https://player.vimeo.com/video/1?w=500&h=200'), 'https://player.vimeo.com/video/1?w=500&h=200');
  assert.equal(normalizeAssetPaths('https://example.org/wp-content/uploads/photo.png?fit=20'), 'https://example.org/wp-content/uploads/photo.png?fit=20');
  assert.equal(normalizeAssetPaths(String.raw`https:\/\/www.bayadakorea.com\/wp-content\/uploads\/a.png`), String.raw`\/assets\/media\/a.png`);
  assert.equal(normalizeAssetPaths(String.raw`"uploadUrl":"\/wp-content\/uploads"`), String.raw`"uploadUrl":"\/assets\/media"`);
  assert.deepEqual(normalizeAssetData({ values: { f0: '/wp-content/themes/example/a.css' }, published: false }), { values: { f0: '/assets/theme/example/a.css' }, published: false });
  assert.equal(normalizeAssetPaths(String.raw`\/wp-content\/plugins\/example\/`), String.raw`\/assets\/vendor\/example\/`);
});

test("URL validation rejects executable, protocol-relative and attribute-breaking URLs", () => {
  for (const value of ['javascript:alert(1)', '//evil.test/x', '/x" onerror="a', '/x\n', 'data:text/html,x', 'https://user:pass@example.test/x']) assert.equal(safeUrl(value), false, value);
  for (const value of ['/media/picture.png', 'https://example.test/a', 'tel:16701379', 'mailto:a@example.test']) assert.equal(safeUrl(value), true, value);
});
test("CMS text stays text and responsive image override changes src and srcset together", () => {
  const template = { template: '<p>{{KOREA_FIELD:f0}}</p><img src="{{KOREA_FIELD:f1}}" srcset="{{KOREA_SRCSET:f1}}">', fields: [{ key: 'f0', kind: 'text' as const, label: 'text', value: '원본' }, { key: 'f1', kind: 'image' as const, label: 'image', value: '/old.png', srcset: '/old.png 2x' }] };
  const result = renderTemplate(template, { f0: '<script>alert(1)</script>', f1: '/new.png' });
  assert.ok(!result.includes('<script>')); assert.match(result, /src="\/new.png" srcset="\/new.png"/);
  assert.match(renderTemplate(template, { f1: 'javascript:alert(1)' }), /src="\/old.png"/);
  assert.throws(() => parseEdits({ title: '제목', published: true, values: { unknown: 'x' } }, template));
});
test("menus support nested additions/reordering and reject duplicate IDs, deep trees and scripts", () => {
  const item = { id: 'a', label: '회사', href: '/aboutus/', children: [] };
  assert.deepEqual(parseMenu([item]), [item]);
  assert.throws(() => parseMenu([item, item]));
  assert.throws(() => parseMenu([{ ...item, href: 'javascript:alert(1)' }]));
  assert.throws(() => parseMenu([{ ...item, children: [{ ...item, id: 'b', children: [{ ...item, id: 'c', children: [{ ...item, id: 'd', children: [{ ...item, id: 'e' }] }] }] }] }]));
});
test('background editor preserves media queries and emits no default overrides', () => {
  const source = { template: '<style>{{KOREA_BACKGROUND:f0}}</style>', fields: [{ key: 'f0', kind: 'background' as const, label: '배경', value: '/old.png', cssRule: '@media(max-width:767px){.banner{background-image:url("{{KOREA_URL}}") !important;}}' }] };
  assert.equal(renderTemplate(source), '<style></style>');
  assert.equal(renderTemplate(source, { f0: '/old.png' }), '<style></style>');
  assert.match(renderTemplate(source, { f0: '/new.png' }), /@media\(max-width:767px\).*\/new.png/);
  assert.equal(renderTemplate(source, { f0: '\"><script>alert(1)</script>' }), '<style></style>');
});
test("board HTML blocks scripts, event handlers, unsafe links and foreign iframe embeds", () => {
  const html = cleanRichText('<p onclick="alert(1)">본문<script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(1)"><iframe src="https://evil.test/"></iframe><iframe src="https://www.youtube.com/embed/demo"></iframe></p>');
  assert.ok(!/onclick|onerror|<script|javascript:|evil\.test/.test(html));
  assert.match(html, /www.youtube.com/);
  assert.throws(() => parsePost({ board: 'constructor', id: 'a' }));
});
test("all public templates are route-unique, contain no admin bar and preserve trusted scripts outside editable fields", () => {
  assert.deepEqual(parseMenu(templates.navigation), templates.navigation);
  assert.deepEqual(parsePartners(templates.partners), templates.partners);
  assert.equal(templates.pages.length, 74);
  assert.equal(new Set(templates.pages.map(p => p.path)).size, templates.pages.length);
  for (const board of Object.values(templates.boards).filter(b => !b.gallery)) {
    assert.match(board.list, /mb-th-pid[^\"]*mb-hide-mobile[^\"]*mb-hide-tablet/);
  }
  assert.equal(templates.pages.filter(p => p.kind === 'archive').length, 15);
  for (const page of templates.pages.filter(p => p.kind === 'archive')) {
    assert.ok(page.origins?.every(key => templates.pages.some(p => p.key === key && p.kind === 'post')));
    for (const field of page.fields.filter(f => f.source)) assert.ok(templates.pages.find(p => p.key === field.source!.key)?.fields.some(f => f.key === field.source!.field));
  }
  assert.match(templates.faqRow, /elementor-accordion-title/);
  assert.ok(!JSON.stringify(templates).includes('/wp-content/'));
  assert.ok(!JSON.stringify(templates).includes('/wp-includes/'));
  for (const page of templates.pages) {
    const renderedSource = (page.head + page.template).replaceAll('\\/', '/');
    assert.ok(!renderedSource.includes('/wp-content/') && !renderedSource.includes('/wp-includes/'), page.path);
    assert.ok(!page.template.includes('id="wpadminbar"'));
    for (const f of page.fields) { assert.ok(!f.value.startsWith('{{KOREA_')); assert.ok(!f.value.includes('nonce')); }
    assert.ok(!page.head.includes('googletagmanager.com'));
  }
});
