import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@bayada/db";
import { getAdminUser, audit } from "@/lib/session";
import { can } from "@/lib/rbac";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!can(user, "legacy.read")) return new Response("Forbidden", { status: 403 });
  const { id } = await params;
  const record = await prisma.legacyRecord.findUnique({ where: { id } });
  if (!record || record.kind !== "FILE") return new Response("Not found", { status: 404 });
  const data = record.payload as Record<string, unknown>;
  if (typeof data.storedFile !== "string" || !/^[a-f0-9]{64}\.[a-z0-9]{1,8}$/.test(data.storedFile)) return new Response("Not found", { status: 404 });
  const root = path.resolve(process.env.LEGACY_PRIVATE_DIR ?? "/legacy-private", "files");
  let bytes: Buffer;
  try {
    const actualRoot = await realpath(root), actual = await realpath(path.join(root, data.storedFile));
    if (!actual.startsWith(actualRoot + path.sep)) return new Response("Not found", { status: 404 });
    bytes = await readFile(actual);
  } catch { return new Response("Not found", { status: 404 }); }
  await audit(user.id, "legacy.download", `LegacyRecord:${id}`, { file: record.title });
  const name = record.title.replace(/[\x00-\x1f\x7f]/g, "").slice(0, 240) || "attachment";
  return new Response(new Uint8Array(bytes), { headers: {
    "Content-Type": "application/octet-stream", "Content-Length": String(bytes.length),
    "Content-Disposition": `attachment; filename="attachment"; filename*=UTF-8''${encodeURIComponent(name).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)}`,
    "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox",
  } });
}
