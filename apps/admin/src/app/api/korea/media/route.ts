import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@bayada/db";
import { getAdminUser } from "@/lib/session";
import { can } from "@/lib/rbac";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!can(user, "korea.content")) return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  const url = new URL(request.url);
  const origin = `${request.headers.get("x-forwarded-proto") || url.protocol.slice(0, -1)}://${request.headers.get("host") || url.host}`;
  if (request.headers.get("origin") !== origin) return Response.json({ error: "같은 사이트에서 요청하세요." }, { status: 403 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "파일이 없습니다." }, { status: 400 });
  const chunks: Uint8Array[] = []; let length = 0;
  while (true) { const part = await reader.read(); if (part.done) break; length += part.value.byteLength; if (length > 11 * 1024 * 1024) { await reader.cancel(); return Response.json({ error: "10MB 이하 파일만 올릴 수 있습니다." }, { status: 413 }); } chunks.push(part.value); }
  let file: File;
  try { const form = await new Request(request.url, { method: "POST", headers: { "content-type": request.headers.get("content-type") || "" }, body: Buffer.concat(chunks) }).formData(); const value = form.get("file"); if (!(value instanceof File)) throw new Error(); file = value; } catch { return Response.json({ error: "파일 형식을 확인하세요." }, { status: 400 }); }
  if (file.size > 10 * 1024 * 1024 || !file.size) return Response.json({ error: "파일 크기를 확인하세요." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "png" : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? "jpg" : /^GIF8[79]a$/.test(bytes.subarray(0, 6).toString()) ? "gif" : bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP" ? "webp" : bytes.subarray(0, 5).toString() === "%PDF-" ? "pdf" : null;
  if (!ext) return Response.json({ error: "PNG·JPG·GIF·WebP 또는 PDF만 올릴 수 있습니다." }, { status: 400 });
  const directory = process.env.KOREA_MEDIA_DIR;
  if (!directory) return Response.json({ error: "미디어 저장 경로를 설정해 주세요." }, { status: 503 });
  const name = randomUUID() + "." + ext, destination = path.join(directory, name);
  try {
    await mkdir(directory, { recursive: true }); await writeFile(destination, bytes, { flag: "wx", mode: 0o640 });
    await prisma.auditLog.create({ data: { actorId: user.id, action: "korea.media.upload", target: name, detail: { bytes: file.size, format: ext } } });
    return Response.json({ url: (process.env.KOREA_PUBLIC_URL || "").replace(/\/+$/, "") + "/media/" + name }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch { await unlink(destination).catch(() => {}); return Response.json({ error: "파일을 저장하지 못했습니다." }, { status: 500 }); }
}
