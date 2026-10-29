// 어드민에서 편집하는 정적 문서(Page.content) 출력용 허용 목록 정리기.
// 외부 라이브러리 없이 태그 단위로 걸러낸다: 허용 태그·속성만 남기고, 스크립트류는 내용째 버린다.
const ALLOWED_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "br",
  "hr",
  "div",
  "span",
  "blockquote",
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "sub",
  "sup",
  "small",
  "a",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
]);
const DROP_WITH_CONTENT = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "template",
  "noscript",
  "svg",
  "math",
  "textarea",
  "select",
];
const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "title"],
  th: ["colspan", "rowspan", "scope"],
  td: ["colspan", "rowspan"],
};

function safeHref(raw: string): string | null {
  const v = raw.replace(/[\u0000-\u001f\s]+/g, "");
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(v)) return raw.trim();
  return null;
}

function escapeAttr(v: string): string {
  return v
    .replace(/&(?!(#\d+|#x[0-9a-f]+|\w+);)/gi, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function sanitizeHtml(html: string): string {
  let out = html.replace(/<!--[\s\S]*?-->/g, "");
  for (const tag of DROP_WITH_CONTENT) {
    out = out.replace(new RegExp(`<${tag}\b[\s\S]*?(<\/${tag}\s*>|$)`, "gi"), "");
  }
  return out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (match, rawName: string, rawAttrs: string) => {
    const name = rawName.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return "";
    if (match.startsWith("</")) return `</${name}>`;
    const allowed = ALLOWED_ATTRS[name] ?? [];
    const attrs: string[] = [];
    for (const m of rawAttrs.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
      const key = m[1].toLowerCase();
      const value = m[3] ?? m[4] ?? m[5] ?? "";
      if (!allowed.includes(key)) continue;
      if (key === "href") {
        const href = safeHref(value);
        if (!href) continue;
        attrs.push(`href="${escapeAttr(href)}"`);
        if (/^https?:/i.test(href)) attrs.push('target="_blank"', 'rel="noopener noreferrer"');
        continue;
      }
      attrs.push(`${key}="${escapeAttr(value)}"`);
    }
    const selfClosing = name === "br" || name === "hr";
    return `<${name}${attrs.length ? ` ${attrs.join(" ")}` : ""}${selfClosing ? " /" : ""}>`;
  });
}
