import { readFile } from "node:fs/promises";
import path from "node:path";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const allowed = /^[a-f0-9-]{36}\.(png|jpg|gif|webp|pdf)$/.exec(name), directory = process.env.KOREA_MEDIA_DIR;
  if (!allowed || !directory) return new Response("Not found", { status: 404 });
  try {
    const bytes = await readFile(path.join(directory, name));
    const type = { png: "image/png", jpg: "image/jpeg", gif: "image/gif", webp: "image/webp", pdf: "application/pdf" }[allowed[1]!]!;
    return new Response(bytes, { headers: { "content-type": type, "x-content-type-options": "nosniff", "cache-control": "public, max-age=31536000, immutable", ...(allowed[1] === "pdf" ? { "content-disposition": `attachment; filename="${name}"` } : {}) } });
  } catch { return new Response("Not found", { status: 404 }); }
}
