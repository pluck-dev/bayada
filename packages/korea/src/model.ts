export const KOREA_PREFIX = "korea/";
export type InquirySettings = { consultationRecipients: string[]; careersRecipients: string[]; enabled: boolean };
export const DEFAULT_INQUIRY_SETTINGS: InquirySettings = { consultationRecipients: [], careersRecipients: [], enabled: true };
export function parseInquirySettings(input: unknown): InquirySettings {
  if (!input || typeof input !== 'object') throw new Error('설정을 확인하세요.');
  const x = input as InquirySettings;
  const emails = (value: unknown): string[] => {
    if (!Array.isArray(value) || value.length > 10 || value.some(e => typeof e !== 'string' || e.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))) throw new Error('알림 이메일 주소를 확인하세요.');
    return [...new Set(value.map(e => e.trim().toLowerCase()))];
  };
  if (typeof x.enabled !== 'boolean') throw new Error('접수 여부를 확인하세요.');
  return { enabled: x.enabled, consultationRecipients: emails(x.consultationRecipients), careersRecipients: emails(x.careersRecipients) };
}
export type Field = { key: string; kind: "text" | "image" | "background" | "link"; label: string; value: string; srcset?: string; cssRule?: string; source?: { key: string; field: string } };
export type Template = { template: string; fields: Field[] };
export type KoreaPage = Template & { key: string; path: string; title: string; kind: string; legacyId: number; board: string | null; head: string; bodyClass: string; origins?: string[] };
export type PageEdits = { title: string; published: boolean; values: Record<string, string> };
export type MenuItem = { id: string; label: string; href: string; children: MenuItem[]; newTab?: boolean };
export type Partner = { id: string; label: string; image: string; href: string; newTab: boolean };
export function parsePartners(input: unknown): Partner[] {
  const ids = new Set<string>();
  if (!Array.isArray(input) || input.length > 100) throw new Error('협력기관 목록을 확인하세요.');
  return input.map((x: Partner) => {
    if (!x || typeof x.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(x.id) || ids.has(x.id) || typeof x.label !== 'string' || !x.label.trim() || x.label.length > 120 || typeof x.image !== 'string' || !safeUrl(x.image, true) || typeof x.href !== 'string' || !safeUrl(x.href) || typeof x.newTab !== 'boolean') throw new Error('협력기관 이름·이미지·링크를 확인하세요.');
    ids.add(x.id); return { id: x.id, label: x.label.trim(), image: x.image, href: x.href, newTab: x.newTab };
  });
}
export function parseMenu(input: unknown): MenuItem[] {
  let count = 0;
  const ids = new Set<string>();
  const visit = (items: unknown, depth: number): MenuItem[] => {
    if (!Array.isArray(items) || (depth > 3 && items.length > 0)) throw new Error("메뉴는 4단계까지 구성할 수 있습니다.");
    return items.map((item: MenuItem) => {
      count++;
      if (!item || count > 100 || typeof item.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(item.id) || ids.has(item.id) || typeof item.label !== "string" || !item.label.trim() || item.label.length > 100 || typeof item.href !== "string" || !safeUrl(item.href)) throw new Error("메뉴 이름·주소·중복 항목을 확인하세요.");
      ids.add(item.id);
      return { id: item.id, label: item.label.trim(), href: item.href, children: visit(item.children, depth + 1), ...(item.newTab === true ? { newTab: true } : {}) };
    });
  };
  return visit(input, 0);
}
export type BoardPost = { id: string; board: string; title: string; content: string; author: string; date: string; time?: string; sortOrder?: number; published: boolean; notice: boolean; image: string; hits?: number; hasImage?: boolean; attachments: { label: string; url: string }[] };
export const BOARDS = {
  bayadab_01: { title: "공지사항", path: "/공지사항2/" },
  bayadab_02: { title: "보도자료/뉴스룸", path: "/보도자료-뉴스룸/" },
  bayadab_03: { title: "영상자료실", path: "/영상자료실/" },
  bayadab_05: { title: "FAQ", path: "/faq-2/" },
} as const;
export type BoardKey = keyof typeof BOARDS;
export const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function safeUrl(input: string, media = false): boolean {
  if (!input || input.length > 2048 || /[\u0000-\u0020<>"\\]/.test(input)) return false;
  if (input.startsWith("/") && !input.startsWith("//")) return true;
  if (!media && /^(#[^\s]*|tel:[+0-9()-]+|mailto:[^\s@]+@[^\s@]+)$/.test(input)) return true;
  try { const url = new URL(input); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}

export function parseEdits(input: unknown, template: Template): PageEdits {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("입력값을 확인하세요.");
  const x = input as PageEdits;
  if (typeof x.title !== "string" || !x.title.trim() || x.title.length > 200 || typeof x.published !== "boolean" || !x.values || typeof x.values !== "object" || Array.isArray(x.values)) throw new Error("제목·공개 여부·내용을 확인하세요.");
  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(x.values)) {
    const field = template.fields.find(f => f.key === key);
    if (!field || typeof value !== "string" || value.length > 20000) throw new Error("수정 항목을 확인하세요.");
    if (field.kind !== "text" && !safeUrl(value, field.kind !== "link")) throw new Error("이미지·링크 주소를 확인하세요.");
    values[key] = value;
  }
  return { title: x.title.trim(), published: x.published, values };
}

export function renderTemplate(source: Template, values: Record<string, string> = {}): string {
  const fields = new Map(source.fields.map(f => [f.key, f]));
  return source.template.replace(/\{\{KOREA_BACKGROUND:(f\d+)\}\}/g, (_, key: string) => {
    const field = fields.get(key), override = values[key];
    if (!field?.cssRule || override === undefined || override === field.value || !safeUrl(override, true)) return '';
    return field.cssRule.replace('{{KOREA_URL}}', override);
  }).replace(/\{\{KOREA_SRCSET:(f\d+)\}\}/g, (_, key: string) => {
    const field = fields.get(key);
    const override = values[key];
    return escapeHtml(override !== undefined && safeUrl(override, true) ? override : field?.srcset ?? "");
  }).replace(/\{\{KOREA_FIELD:(f\d+)\}\}/g, (_, key: string) => {
    const field = fields.get(key);
    if (!field) return "";
    const value = values[key] ?? field.value;
    // Revalidate persisted URL overrides too: older or manually edited rows are not trusted.
    const safe = field.kind !== "text" && values[key] !== undefined && !safeUrl(value, field.kind !== "link") ? field.value : value;
    return field.kind === "background" ? safe : escapeHtml(safe);
  });
}

export function parsePost(input: unknown): BoardPost {
  if (!input || typeof input !== "object") throw new Error("게시글을 확인하세요.");
  const x = input as BoardPost;
  if (typeof x.board !== "string" || !Object.hasOwn(BOARDS, x.board) || typeof x.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(x.id) || typeof x.title !== "string" || !x.title.trim() || x.title.length > 250 || typeof x.content !== "string" || x.content.length > 200000 || typeof x.published !== "boolean" || typeof x.notice !== "boolean") throw new Error("게시판·제목·본문을 확인하세요.");
  if (typeof x.author !== "string" || x.author.length > 80 || !/^\d{4}-\d{2}-\d{2}$/.test(x.date) || !Number.isFinite(Date.parse(x.date))) throw new Error("작성자·날짜를 확인하세요.");
  if (new Date(x.date).toISOString().slice(0, 10) !== x.date || (x.time !== undefined && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(x.time))) throw new Error('날짜·시각을 확인하세요.');
  if (x.sortOrder !== undefined && (!Number.isInteger(x.sortOrder) || x.sortOrder < 0 || x.sortOrder > 1000)) throw new Error('노출 순서를 확인하세요.');
  if (typeof x.image !== "string" || (x.image && !safeUrl(x.image, true))) throw new Error("이미지 주소를 확인하세요.");
  if (!Array.isArray(x.attachments) || x.attachments.length > 20 || x.attachments.some(a => !a || typeof a.label !== "string" || a.label.length > 200 || typeof a.url !== "string" || !safeUrl(a.url, true))) throw new Error("첨부 파일을 확인하세요.");
  return { id: x.id, board: x.board, title: x.title.trim(), content: x.content, author: x.author, date: x.date, ...(x.time ? { time: x.time } : {}), ...(x.sortOrder !== undefined ? { sortOrder: x.sortOrder } : {}), published: x.published, notice: x.notice, image: x.image, hasImage: x.hasImage === true || /<img\b/i.test(x.content), hits: Number.isInteger(x.hits) && x.hits! >= 0 ? x.hits : 0, attachments: x.attachments.map(a => ({ label: a.label, url: a.url })) };
}
