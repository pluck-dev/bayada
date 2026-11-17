import { readFile } from "node:fs/promises";
import path from "node:path";
import { Script } from "node:vm";

export type RecordData = Record<string, any>;
export type WorkspaceState = RecordData & {
  revision: number;
  decisions: Record<string, RecordData>;
  terms: Record<string, string>;
  customItems: RecordData[];
  events: RecordData[];
  baselines: RecordData[];
  approvals: RecordData[];
};

export interface WorkspaceDefinition {
  html: string;
  catalog: RecordData;
  projectId: string;
  initialState: WorkspaceState;
  validate: (state: unknown) => void;
}

let definition: Promise<WorkspaceDefinition> | undefined;

function extractFunction(script: string, name: string): string {
  const start = script.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Missing workspace validator: ${name}`);
  const next = script.indexOf("\nfunction ", start + 1);
  return script.slice(start, next < 0 ? script.length : next);
}

async function readDefinition(): Promise<WorkspaceDefinition> {
  const html = await readFile(path.resolve(process.cwd(), "../../docs/bayada-contract-review.html"), "utf8");
  const catalog = JSON.parse(html.match(/id="catalog">([\s\S]*?)<\/script>/)![1]);
  const app = html.match(/<script>([\s\S]*?)<\/script>/)![1];
  const projectId = `bayada-scope-${catalog.scan.commit.slice(0, 12)}-20261117-v1`;
  const constants = ["stages", "scopes", "statuses"].map((name) => {
    const value = app.match(new RegExp(`const ${name}=(\\[[^\\n]*?\\]);`));
    if (!value) throw new Error(`Missing workspace options: ${name}`);
    return `const ${name}=${value[1]};`;
  });
  // These validators come from the packaged, trusted HTML, never from a request or an import.
  const source = constants.join("\n") + ["freshState", "quoteTotals", "validateCommerce", "validateState"]
    .map((name) => extractFunction(app, name)).join("\n");
  const initial = new Script(source + "\nfreshState()");
  const validation = new Script(source + "\nvalidateState(input); true");
  const context = { catalog, projectId };
  const options = { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } };
  const initialState = JSON.parse(JSON.stringify(initial.runInNewContext(context, options)));
  return {
    html, catalog, projectId, initialState,
    validate: (input) => { validation.runInNewContext({ ...context, input }, options); },
  };
}

export function getWorkspaceDefinition() {
  definition ??= readDefinition().catch((error) => { definition = undefined; throw error; });
  return definition;
}
