import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { resolve } from "node:path";
import { readWpTable } from "../packages/db/scripts/wp-history-source";
import { plainText } from "../packages/db/scripts/wp-archive";
import { parsePost } from "../packages/korea/src/model";
// Never execute the SQL or copy account/contact/IP/password columns into public content.
const source = process.argv[2];
if (!source) throw new Error("Usage: tsx scripts/prepare-korea-posts.mts <backup.sql.gz>");
const sql = gunzipSync(readFileSync(source)).toString("utf8");
const table = (name: string) => readWpTable(sql.replaceAll('`' + name + '`', '`lLJ_' + name + '`'), name);
const published = table('wp_posts').filter(p => p.post_status === 'publish' && p.post_type === 'post');
const terms = table('wp_terms'), taxonomy = table('wp_term_taxonomy'), relationships = table('wp_term_relationships');
const categories = taxonomy.filter(t => t.taxonomy === 'category').map(t => ({ termId: t.term_id, name: terms.find(term => term.term_id === t.term_id)?.name, posts: relationships.filter(r => r.term_taxonomy_id === t.term_taxonomy_id).map(r => published.find(p => p.ID === r.object_id)).filter(Boolean).map(p => ({ id: p!.ID, title: p!.post_title })) }));
writeFileSync(resolve('output/korea-capture/post-categories.json'), JSON.stringify(categories, null, 2));
const localize = (s: string) => s.replace(/https?:\/\/i[0-3]\.wp\.com\/(?:www\.)?bayadakorea\.com/gi, "").replace(/https?:\/\/(?:www\.)?bayadakorea\.com/gi, "");
const result = [];
const files = readWpTable(sql.replaceAll('`mb_files`', '`lLJ_mb_files`'), 'mb_files');
const gallery = JSON.parse(readFileSync('output/korea-capture/page-523.json', 'utf8')).html as string;
const thumbnails = new Map([...gallery.matchAll(/href=["'][^"']*\?vid=(\d+)[^"']*["'](?:(?!<a\b)[\s\S])*?background-image:url\(([^)]+)\)/g)].map(match => [match[1]!, localize(match[2]!).replaceAll('&amp;', '&')]));
function extractImages(content: string) {
  return content.replace(/data:image\/(png|jpeg|gif|webp);base64,([a-zA-Z0-9+/=\r\n]+)/g, (_, ext: string, encoded: string) => {
    const bytes = Buffer.from(encoded, "base64");
    const name = createHash("sha256").update(bytes).digest("hex") + "." + ext;
    const directory = resolve("apps/korea/public/wp-content/uploads/korea-import");
    mkdirSync(directory, { recursive: true }); writeFileSync(resolve(directory, name), bytes);
    return "/wp-content/uploads/korea-import/" + name;
  });
}
for (const board of ["bayadab_01", "bayadab_02", "bayadab_03", "bayadab_05"]) {
  const table = "mb_" + board;
  const rows = readWpTable(sql.replaceAll("`" + table + "`", "`lLJ_" + table + "`"), table);
  for (const row of rows) {
    if (Number(row.is_secret) !== 0 || Number(row.is_show) !== 1 || row.status !== "publish") continue;
    const attachments = files.filter(file => file.board_name === board && Number(file.board_pid) === Number(row.pid) && Number(file.is_download) === 1).map(file => ({ label: String(file.file_name), url: encodeURI('/wp-content/uploads/mangboard/' + String(file.file_path)) }));
    result.push(parsePost({ id: String(row.pid), board, title: plainText(row.title), content: extractImages(localize(String(row.content || row.text || ""))), author: plainText(row.user_name || "관리자"), date: String(row.reg_date).slice(0, 10), time: String(row.reg_date).slice(11, 16), notice: Number(row.is_notice) === 1, published: true, hasImage: !!row.image_path || /<img\b/i.test(String(row.content)), hits: Number(row.hit) || 0, image: board === 'bayadab_03' && thumbnails.has(String(row.pid)) ? thumbnails.get(String(row.pid))! : (() => { const value=localize(String(row.image_path || "")); return value ? encodeURI(value.startsWith("/") || /^https?:/.test(value) ? value : "/wp-content/uploads/mangboard/"+value) : ""; })(), attachments }));
  }
}
writeFileSync(resolve("packages/korea/content/boards.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ publicBoardPosts: result.length, privateColumnsExported: false }));
