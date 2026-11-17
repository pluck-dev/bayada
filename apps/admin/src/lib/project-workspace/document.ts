import { getWorkspaceDefinition } from "./definition";
import { HOSTED_BRIDGE } from "./hosted-bridge";
import type { WorkspaceActor } from "./transition";

function replaceFunction(app: string, name: string, replacement: string): string {
  const match = new RegExp(`^(?:async )?function ${name}\\(`, "m").exec(app);
  if (!match) throw new Error(`Workspace function missing: ${name}`);
  const rest = app.slice(match.index + match[0].length);
  const next = /\n(?:async )?function \w+\(/.exec(rest);
  if (!next) throw new Error(`Workspace function boundary missing: ${name}`);
  return app.slice(0, match.index) + replacement + "\n" + rest.slice(next.index + 1);
}

const json = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

export async function workspaceDocument(state: unknown, actor: WorkspaceActor, hosted: boolean) {
  const definition = await getWorkspaceDefinition();
  let html = definition.html.replace(/(<script type="application\/json" id="embedded-state">)[\s\S]*?(<\/script>)/,
    () => `<script type="application/json" id="embedded-state">${json(state)}</script>`);
  if (!hosted) {
    // Offline snapshots retain the canonical comparison used by server-created baselines.
    const stable = HOSTED_BRIDGE.slice(HOSTED_BRIDGE.indexOf("function stableStringify("), HOSTED_BRIDGE.indexOf("function load("));
    return html.replace("function snapshotToken(){return JSON.stringify(payload());}", stable);
  }
  let app = html.match(/<script>([\s\S]*?)<\/script>/)![1];
  app = app.replace("function showDialog(", "function localShowDialog(");
  app = app.replace(/^window\.addEventListener\('storage'[^\n]+\n/m, "");
  for (const name of ["snapshotToken", "load", "assertWritable", "mutate", "exportHtml", "importFile"]) {
    app = replaceFunction(app, name, "");
  }
  app = app.replace("function submit(event)", "async function submit(event)")
    .replace("function submitPrice(event)", "async function submitPrice(event)")
    .replace("function recordCart(", "async function recordCart(")
    .replace(/\bmutate\(/g, "await mutate(");
  app = app.replace("load();render();", HOSTED_BRIDGE + "\nload();render();startWorkspaceSync();");
  html = html.replace(/<script>[\s\S]*?<\/script>/, () => `<script>${app}</script>`);
  html = html.replace("<script type=\"application/json\" id=\"catalog\">",
    `<script type="application/json" id="workspace-server">${json({ user: actor })}</script><script type="application/json" id="catalog">`);
  html = html.replace("<strong>BAYADA 협의관리</strong>", '<strong id="connectionStatus">공동 저장 연결 중</strong>');
  html = html.replace("이 브라우저에 저장 · 공유 시 저장본 전달 · 당사자 확인은 근거 문서와 함께 기록", "서버 공동 저장 · 작성자는 로그인 계정으로 기록");
  html = html.replace("작성자 정보는 수동 기록이며 실제 당사자 승인 근거를 함께 보관합니다.", "작성자는 로그인 계정으로 기록하며 승인 근거 문서를 함께 보관합니다.");
  return html.replace("</style>", ".server-saving #content,.server-saving #editDialog{pointer-events:none;opacity:.75}body .shell{min-height:100dvh}#connectionStatus{font-size:11px!important;color:#617187}</style>");
}
