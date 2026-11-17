import { NextResponse } from "next/server";
import { getWorkspace, importWorkspace, saveWorkspace } from "@/lib/project-workspace/store";
import { assertSameOrigin, privateHeaders, readBody, workspaceFailure, workspaceUser } from "@/lib/project-workspace/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { actor } = await workspaceUser();
    const row = await getWorkspace();
    const etag = `"workspace-${row.revision}"`;
    if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: { ...privateHeaders, ETag: etag } });
    return NextResponse.json({ state: row.state, user: actor }, { headers: { ...privateHeaders, ETag: etag } });
  } catch (error) { return workspaceFailure(error); }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { actor } = await workspaceUser();
    const body = await readBody(request);
    const row = body.operation === "import"
      ? await importWorkspace(body.baseRevision, body.state, actor)
      : await saveWorkspace(body.baseRevision, body.state, actor);
    return NextResponse.json({ state: row.state, user: actor }, { headers: privateHeaders });
  } catch (error) { return workspaceFailure(error); }
}
