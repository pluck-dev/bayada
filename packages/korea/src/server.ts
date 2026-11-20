import { prisma } from "@bayada/db";
import sanitizeHtml from "sanitize-html";
import bundle from "../content/templates.json";
import quarantined from "../content/quarantine.json";
import { normalizeAssetData, normalizeAssetPaths, BOARDS, KOREA_PREFIX, escapeHtml, renderTemplate, parseMenu, parsePartners, parseInquirySettings, DEFAULT_INQUIRY_SETTINGS, type Partner, type MenuItem, type BoardPost, type KoreaPage, type PageEdits, type Template } from "./model";

export const templates = bundle as unknown as { pages: KoreaPage[]; fragments: Record<string, Template>; navigation: MenuItem[]; partners: Partner[]; partnerRow: string; boards: Record<string, {list: string; row: string; gallery: boolean}>; boardView: string; faqRow: string };
export const pages = templates.pages;
export const quarantine = quarantined;
export async function getInquirySettings() {
  const row = await prisma.siteSetting.findUnique({ where: { key: 'korea.inquiry.settings' } });
  return { settings: row ? parseInquirySettings(row.value) : DEFAULT_INQUIRY_SETTINGS, updatedAt: row?.updatedAt.toISOString() ?? null };
}
export const documentSlug = (key: string) => `${KOREA_PREFIX}page/${key}`;
export function cleanRichText(html: string) {
  return sanitizeHtml(normalizeAssetPaths(html), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "iframe", "video", "source"],
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, "*": ["class", "style"], img: ["src", "alt", "width", "height"], iframe: ["src", "title", "width", "height", "allowfullscreen"], video: ["src", "controls", "poster"], source: ["src", "type"] },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    allowedStyles: { '*': {
      'font-family': [/^[\w\s,'"\-가-힣]+$/], 'font-size': [/^[\d.]+(?:px|pt|em|rem|%)$/],
      'font-weight': [/^(?:normal|bold|[1-9]00)$/], 'font-style': [/^(?:normal|italic)$/],
      color: [/^(?:#[a-f\d]{3,8}|[a-z]+|rgba?\([\d.,%\s]+\))$/i], 'background-color': [/^(?:#[a-f\d]{3,8}|[a-z]+|rgba?\([\d.,%\s]+\))$/i],
      'text-align': [/^(?:left|right|center|justify)$/], 'text-decoration': [/^(?:none|underline|line-through)$/],
      margin: [/^[\d.\s%a-z-]+$/i], padding: [/^[\d.\s%a-z-]+$/i], 'line-height': [/^[\d.]+(?:px|pt|em|rem|%)?$/],
      width: [/^[\d.]+(?:px|pt|em|rem|%)$/], height: [/^[\d.]+(?:px|pt|em|rem|%)$/], 'max-width': [/^[\d.]+(?:px|pt|em|rem|%)$/],
    } },
  });
}
export async function getEdits(key: string): Promise<{ edits: PageEdits | null; updatedAt: string | null }> {
  const row = await prisma.page.findUnique({ where: { slug: documentSlug(key) } });
  return { edits: row ? normalizeAssetData(JSON.parse(row.content)) as PageEdits : null, updatedAt: row?.updatedAt.toISOString() ?? null };
}
export async function getMenu() {
  const row = await prisma.page.findUnique({ where: { slug: "korea/navigation" } });
  return { items: row ? parseMenu(normalizeAssetData(JSON.parse(row.content))) : templates.navigation, updatedAt: row?.updatedAt.toISOString() ?? null };
}
export async function getPartners() {
  const row = await prisma.page.findUnique({ where: { slug: 'korea/partners' } });
  return { items: row ? parsePartners(normalizeAssetData(JSON.parse(row.content))) : templates.partners, updatedAt: row?.updatedAt.toISOString() ?? null };
}
function renderMenu(items: MenuItem[], path: string, depth = 0): string {
  const active = (item: MenuItem): boolean => {
    try { return item.href.startsWith('/') && decodeURIComponent(new URL(item.href, 'https://korea.local').pathname).replace(/\/+$/, '') === path.replace(/\/+$/, ''); } catch { return false; }
  };
  return items.map(item => `<li class="menu-item ${item.children.length ? "menu-item-has-children" : ""} ${active(item) ? "current-menu-item" : ""}"><a class="${depth ? "elementor-sub-item" : "elementor-item"}${active(item) ? ' elementor-item-active' : ''}" href="${escapeHtml(item.href)}"${item.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(item.label)}</a>${item.children.length ? `<ul class="sub-menu elementor-nav-menu--dropdown">${renderMenu(item.children, path, depth + 1)}</ul>` : ""}</li>`).join("");
}
export async function listPosts(board?: string, publicOnly = false): Promise<(BoardPost & { updatedAt: string; viewCount: number })[]> {
  const rows = await prisma.page.findMany({ where: { slug: { startsWith: KOREA_PREFIX + "post/" + (board ? board + "/" : "") } }, orderBy: { updatedAt: "desc" } });
  const counters = await prisma.siteSetting.findMany({ where: { key: { startsWith: 'korea.views.' + (board ? board + '.' : '') } }, select: { key: true, value: true } });
  const counts = new Map(counters.map(row => [row.key, Number((row.value as { count?: number }).count) || 0]));
  return rows.map(row => { const post = normalizeAssetData(JSON.parse(row.content)) as BoardPost; return { ...post, viewCount: counts.get('korea.views.' + post.board + '.' + post.id) || 0, updatedAt: row.updatedAt.toISOString() }; }).filter(row => !publicOnly || row.published).sort((a, b) => Number(b.notice) - Number(a.notice) || b.date.localeCompare(a.date) || b.id.localeCompare(a.id, undefined, { numeric: true }));
}
export async function incrementBoardView(board: string, id: string) {
  if (!Object.hasOwn(BOARDS, board) || !/^[a-zA-Z0-9_-]{1,80}$/.test(id)) return;
  const key = 'korea.views.' + board + '.' + id;
  await prisma.$executeRaw`INSERT INTO "SiteSetting" ("key", "value", "updatedAt") VALUES (${key}, jsonb_build_object('count', 1), NOW()) ON CONFLICT ("key") DO UPDATE SET "value" = jsonb_build_object('count', COALESCE(("SiteSetting"."value"->>'count')::integer, 0) + 1), "updatedAt" = NOW()`;
}
const e = escapeHtml;
function boardHtml(board: string, posts: (BoardPost & { viewCount?: number })[], query: URLSearchParams) {
  const current = query.get("vid") || query.get("board_pid");
  const post = current ? posts.find(p => p.id === current) : null;
  if (current && !post) return null;
  if (board === 'bayadab_05') return [...posts].sort((a, b) => (a.sortOrder ?? 1000) - (b.sortOrder ?? 1000)).map((p, index) => templates.faqRow.replace(/\{\{(TITLE|CONTENT|INDEX)\}\}/g, (_, key: string) => key === 'TITLE' ? e(p.title) : key === 'CONTENT' ? cleanRichText(p.content) : String(index + 1))).join('');
  const search = (query.get("search_text") || "").slice(0, 200);
  const field = query.get('search_field');
  const matches = posts.filter(p => !search || (field === 'fn_user_name' ? p.author : field === 'fn_reg_date' ? p.date : field === 'fn_content' ? p.content.replace(/<[^>]*>/g, ' ') : field === 'fn_title' ? p.title : p.title + p.content.replace(/<[^>]*>/g, ' ')).toLowerCase().includes(search.toLowerCase()));
  const orderBy = { fn_title: 'title', fn_user_name: 'author', fn_reg_date: 'date', fn_pid: 'id', fn_hit: 'hits' }[query.get('order_by') || ''] as 'title' | 'author' | 'date' | 'id' | 'hits' | undefined;
  if (orderBy) matches.sort((a, b) => (orderBy === 'hits' ? (a.hits || 0) + (a.viewCount || 0) - (b.hits || 0) - (b.viewCount || 0) : String(a[orderBy]).localeCompare(String(b[orderBy]), 'ko', { numeric: true })) * (query.get('order_type') === 'asc' ? 1 : -1));
  const pageSize = 20;
  const count = Math.max(1, Math.ceil(matches.length / pageSize));
  const index = Math.max(1, Math.min(count, Math.floor(Number(query.get('board_page') || query.get("page")) || 1)));
  const visible = matches.slice((index - 1) * pageSize, index * pageSize);
  const searchForm = `<form method="get" class="board-search"><label>검색 <select name="search_field"><option value="fn_title">제목·내용</option></select> <input name="search_text" value="${e(search)}" aria-label="검색어"></label> <button type="submit" class="btn btn-default">검색</button></form>`;
  const pager = `<div class="mb-pagination">${Array.from({ length: count }, (_, i) => `<a class="btn-page-num ${i + 1 === index ? "active" : ""}" href="?page=${i + 1}&search_text=${encodeURIComponent(search)}">${i + 1}</a>`).join(" ")}</div>`;
  const source = templates.boards[board];
  const substitute = (html: string, values: Record<string, string>) => html.replace(/\{\{([A-Z_]+)\}\}/g, (_, key: string) => values[key] ?? "");
  if (post) {
    const table = substitute(templates.boardView, { TITLE: e(post.title), AUTHOR: e(post.author), DATE: e(post.date + (post.time ? ' ' + post.time : '')), CONTENT: cleanRichText(post.content) });
    return `<div id="${e(board)}_board" class="mb-board"><div class="mb-level-0 mb-mode-view mb-skin-bbs-basic"><div class="mb-style1 board-view">${table}${post.attachments.map(a => `<p><a href="${e(a.url)}" download>${e(a.label)}</a></p>`).join("")}<div class="view-btn"><a class="btn btn-default" href="?">목록</a></div></div></div></div>`;
  }
  if (source) {
    const rows = visible.map((p, i) => substitute(source.row, { ID: e(p.id), TITLE: e(p.title), TITLE_CLASS: p.notice ? 'mb-notice mb-notice-title' : '', AUTHOR: e(p.author), AUTHOR_ENCODED: encodeURIComponent(p.author), ICON: p.hasImage ? '<img alt="img" class="list-i-img" src="/assets/vendor/mangboard/skins/bbs_basic/images/icon_image.gif">' : '', DATE: e(p.date), HITS: String((p.hits || 0) + (p.viewCount || 0)), RANK: p.notice ? "공지" : String(matches.length - (index - 1) * pageSize - i), ROW_CLASS: p.notice ? "mb-notice" : "", IMAGE: e(p.image) })).join("");
    const href = (page: number) => { const q = new URLSearchParams(query); q.delete('vid'); q.delete('board_pid'); q.delete('page'); q.set('board_page', String(page)); return '?' + e(q.toString()); };
    const arrow = (page: number, label: string, kind: string, icon: string, hidden = false) => `<td class="page_arrow${page === index ? ' mb-disabled' : ''}${hidden ? ' mb-mobile-hide' : ''}"><a${page !== index ? ` href="${href(page)}"` : ''} title="${label}" class="btn-${kind}" role="button"><span><img src="/assets/vendor/mangboard/skins/bbs_basic/images/btn_paging_${icon}.gif" alt="${label}" style="width:15px;"></span></a></td>`;
    const start = Math.floor((index - 1) / 7) * 7 + 1;
    const paging = `<tbody><tr>${arrow(1, '처음', 'start', 'pprev', true)}${arrow(Math.max(1, index - 1), '이전', 'prev', 'prev')}${Array.from({ length: Math.min(7, count - start + 1) }, (_, i) => { const number = start + i; return `<td class="btn-page ${number === index ? "active" : ""}"><a class="btn-page-num${number === 1 ? ' first' : ''}" href="${href(number)}" title="Page ${number}">${number}</a></td>`; }).join("")}${arrow(Math.min(count, index + 1), '다음', 'next', 'next')}${arrow(count, '맨끝', 'end', 'nnext', true)}</tr></tbody>`;
    return substitute(source.list, { ROWS: rows, PAGER: paging, SEARCH: e(search) });
  }
  return `<div class="mb-board">${searchForm}${pager}</div>`;
}
export type PagePresentation = {
  header?: (html: string, items: MenuItem[], path: string) => string;
  footer?: (html: string) => string;
  content?: (html: string, values: Record<string, string>) => string;
  head?: string;
  bodyClass?: string;
};
export async function renderPage(page: KoreaPage, query: URLSearchParams, origin: string, presentation: PagePresentation = {}): Promise<string | null> {
  const [current, header, footer, boardPosts, menu] = await Promise.all([getEdits(page.key), getEdits("header"), getEdits("footer"), page.board ? listPosts(page.board, true) : Promise.resolve([]), getMenu()]);
  if (current.edits?.published === false) return null;
  const values = { ...current.edits?.values };
  const origins = page.origins?.length ? await prisma.page.findMany({ where: { slug: { in: page.origins.map(documentSlug) } }, select: { slug: true, content: true } }) : [];
  const originEdits = new Map(origins.map(row => [row.slug, normalizeAssetData(JSON.parse(row.content)) as PageEdits]));
  for (const field of page.fields) if (field.source && values[field.key] === undefined) {
    const source = originEdits.get(documentSlug(field.source.key));
    if (source?.values[field.source.field] !== undefined) values[field.key] = source.values[field.source.field]!;
  }
  let body = renderTemplate(page, values);
  if (presentation.content) body = presentation.content(body, values);
  for (const key of page.origins ?? []) if (originEdits.get(documentSlug(key))?.published === false) body = body.replace(new RegExp('<article\\b(?=[^>]*data-korea-origin="' + key + '")[\\s\\S]*?</article>', 'g'), '');
  const headerHtml = renderTemplate(templates.fragments.header, header.edits?.values);
  const footerHtml = renderTemplate(templates.fragments.footer, footer.edits?.values);
  body = body.replace("{{KOREA_HEADER}}", presentation.header?.(headerHtml, menu.items, page.path) ?? headerHtml).replace("{{KOREA_FOOTER}}", presentation.footer?.(footerHtml) ?? footerHtml);
  body = body.replaceAll("{{KOREA_MENU}}", renderMenu(menu.items, page.path));
  if (body.includes('{{KOREA_PARTNERS}}')) {
    const partners = await getPartners();
    const html = partners.items.map(item => templates.partnerRow.replace(/\{\{(HREF|LABEL|IMAGE)\}\}/g, (_, key: string) => escapeHtml(key === 'HREF' ? item.href : key === 'LABEL' ? item.label : item.image)).replaceAll(' target="_blank"', item.newTab ? ' target="_blank" rel="noopener noreferrer"' : '')).join('');
    body = body.replaceAll('{{KOREA_PARTNERS}}', html);
  }
  if (page.board) {
    const board = boardHtml(page.board, boardPosts, query);
    if (board === null) return null;
    body = body.replace("{{KOREA_BOARD}}", board).replace('{{KOREA_FAQ}}', board);
  }
  const title = current.edits?.title || page.title;
  body = body.replaceAll(encodeURIComponent('https://www.bayadakorea.com'), encodeURIComponent(origin)).replaceAll(encodeURIComponent('http://www.bayadakorea.com'), encodeURIComponent(origin));
  const head = page.head.replace(/<title>[\s\S]*?<\/title>/i, `<title>${e(title)}</title>`);
  return `<!doctype html><html lang="ko-KR"><head>${head}<link rel="canonical" href="${e(origin + page.path)}"><link rel="stylesheet" href="/korea-runtime.css?v=inquiry-20261119">${presentation.head ?? ""}</head><body class="${e(page.bodyClass + (presentation.bodyClass ? " " + presentation.bodyClass : ""))}">${body}<script src="/korea-runtime.js?v=inquiry-20261119" defer></script></body></html>`;
}
export function pageByPath(path: string) {
  const normalized = decodeURIComponent(path).replace(/\/+$/, "") || "/";
  if (normalized === "/test") return pages.find(p => p.path === "/");
  return pages.find(p => (p.path.replace(/\/+$/, "") || "/") === normalized);
}
