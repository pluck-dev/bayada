// 옛 사이트(MasterStudy) 문항 본문은 <p>·&nbsp; 가 섞인 HTML 이다. 퀴즈 화면에는 글자만 보여 준다.
const ENTITIES: Record<string, string> = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'" };

export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#?\w+);/g, (m, name: string) => ENTITIES[name] ?? m)
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}
