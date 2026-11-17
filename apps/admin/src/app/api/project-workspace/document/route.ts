import { workspaceDocument } from "@/lib/project-workspace/document";
import { getWorkspace } from "@/lib/project-workspace/store";
import { privateHeaders, workspaceFailure, workspaceUser } from "@/lib/project-workspace/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { actor } = await workspaceUser();
    const row = await getWorkspace();
    const download = new URL(request.url).searchParams.get("download") === "1";
    const html = await workspaceDocument(row.state, actor, !download);
    const filename = `BAYADA-project-workspace-r${row.revision}.html`;
    return new Response(html, { headers: {
      ...privateHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "same-origin",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'; form-action 'none'",
      ...(download ? { "Content-Disposition": `attachment; filename="${filename}"`, "X-Workspace-Filename": filename } : {}),
    } });
  } catch (error) { return workspaceFailure(error); }
}
