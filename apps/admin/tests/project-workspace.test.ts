import assert from "node:assert/strict";
import { before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { Script } from "node:vm";
import { getWorkspaceDefinition, type RecordData, type WorkspaceDefinition, type WorkspaceState } from "../src/lib/project-workspace/definition";
import { workspaceDocument } from "../src/lib/project-workspace/document";
import { commerce, stableStringify, validateTransition, workspacePayload, type WorkspaceActor } from "../src/lib/project-workspace/transition";
import { effectivePermissions, homePath } from "../src/lib/rbac";

let definition: WorkspaceDefinition;
const actor: WorkspaceActor = { id: "authenticated-user", name: "로그인 작성자", party: "고객사", isAdmin: false };
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const defaults = { stage: "미배정", scope: "미합의", owner: "미정", status: "검토 전", acceptance: "", evidence: "", note: "" };

before(async () => {
  let root = process.cwd();
  while (!existsSync(path.join(root, "pnpm-workspace.yaml"))) {
    const parent = path.dirname(root);
    if (parent === root) throw Error("Repository root missing");
    root = parent;
  }
  process.chdir(path.join(root, "apps/admin"));
  definition = await getWorkspaceDefinition();
});

function proposed(state: WorkspaceState, kind: string, target: string, old: unknown, next: unknown, apply: (state: WorkspaceState) => void) {
  const candidate = clone(state);
  apply(candidate);
  candidate.revision++;
  candidate.events.push({ id: randomUUID(), kind, target, before: old, after: next, actor: "위조 작성자", at: "2000-01-01", reason: "검증 요청" });
  return candidate;
}

test("customer role stays workspace-only even if stored permissions are broader", () => {
  const permissions = effectivePermissions("custom_project_client", ["dashboard", "role.manage", "commerce", "web.members"]);
  assert.deepEqual(permissions, ["project.workspace"]);
  assert.equal(homePath({ permissions }, "ko"), "/ko/workspace");
});

test("security scope follows the supplied workbook and keeps requests separate from agreement", () => {
  assert.equal(definition.catalog.security.length, 11);
  assert.equal(definition.catalog.securityWorkbook.file, "보안항목구분표.xlsx");
  assert.equal(definition.catalog.securityWorkbook.maintenance.length, 5);
  assert.equal(definition.catalog.securityWorkbook.roleQuestions.length, 4);
  assert.equal(definition.initialState.terms.C17, "");
  assert.match(definition.catalog.securityWorkbook.warrantyStatus, /요청/);
  assert(definition.catalog.retiredSecurity.every((x: RecordData) => x.hiddenFromReview && x.scopeDisposition === "제외"));
  assert(!definition.catalog.security.some((x: RecordData) => /망분리|보안장비/.test(x.title)));
});

test("hosted and offline documents compile, preserve embedded data and use server persistence", async () => {
  const state = clone(definition.initialState);
  state.terms.C02 = "기록 <태그>";
  const html = await workspaceDocument(state, actor, true);
  const script = html.match(/<script>([\s\S]*?)<\/script>/)![1];
  assert.doesNotThrow(() => new Script(script));
  assert.match(script, /async function mutate/);
  assert.doesNotMatch(script, /localStorage\.setItem/);
  assert.match(html, /workspace-server/);
  assert.equal(JSON.parse(html.match(/id="embedded-state">([\s\S]*?)<\/script>/)![1]).terms.C02, "기록 <태그>");
  const offline = await workspaceDocument(state, actor, false);
  assert.doesNotThrow(() => new Script(offline.match(/<script>([\s\S]*?)<\/script>/)![1]));
  assert.doesNotMatch(offline, /const workspaceServer=/);
});

test("item writes use the authenticated author and reject unrelated writes", () => {
  const current = clone(definition.initialState);
  const after = { ...defaults, stage: "1차 오픈", note: "두 줄\n메모" };
  const candidate = proposed(current, "항목 변경", "ACADEMY-001", defaults, after, (s) => { s.decisions["ACADEMY-001"] = after; });
  const result = validateTransition(definition, current, candidate, actor);
  assert.equal(result.event.actor, actor.name);
  assert.equal(result.event.actorId, actor.id);
  assert.equal(result.state.decisions["ACADEMY-001"].note, after.note);
  const forged = clone(candidate);
  forged.terms.C02 = "숨은 변경";
  assert.throws(() => validateTransition(definition, current, forged, actor));
});

test("prior history and fixed commercial principles cannot be rewritten", () => {
  const initial = clone(definition.initialState);
  const first = proposed(initial, "계약 조건 변경", "C02", initial.terms.C02, "별도", (s) => { s.terms.C02 = "별도"; });
  const current = validateTransition(definition, initial, first, actor).state;
  const second = proposed(current, "계약 조건 변경", "C02", "별도", "포함", (s) => { s.terms.C02 = "포함"; });
  second.events[0].actor = "기존 기록 변경";
  assert.throws(() => validateTransition(definition, current, second, actor));
  const fixed = proposed(initial, "계약 조건 변경", "C01", initial.terms.C01, "10원", (s) => { s.terms.C01 = "10원"; });
  assert.throws(() => validateTransition(definition, initial, fixed, actor));
});

test("baselines remain comparable after JSONB key reordering and party identity is enforced", () => {
  const current = clone(definition.initialState);
  const snapshot = workspacePayload(current, definition.catalog);
  const baseline = { id: "BASE-001", title: "기준본", summary: "검토 기준", actor: "수기", at: "2000-01-01", reason: "검증 요청", revision: 0, snapshot, token: stableStringify(snapshot), pending: {} };
  const candidate = proposed(current, "기준본 저장", baseline.id, null, { id: baseline.id, title: baseline.title, pending: {} }, (s) => { s.baselines.push(baseline); });
  const result = validateTransition(definition, current, candidate, actor).state;
  assert.equal(result.baselines[0].actorId, actor.id);
  const reordered = JSON.parse(stableStringify(result));
  assert.equal(result.baselines[0].token, stableStringify(workspacePayload(reordered, definition.catalog)));
  const approval = { id: randomUUID(), baselineId: baseline.id, party: "개발사", actor: "수기", at: "2000-01-01", reference: "승인 메일", note: "검토 범위" };
  const invalid = proposed(result, "당사자 확인", baseline.id, null, approval, (s) => { s.approvals.push(approval); });
  assert.throws(() => validateTransition(definition, result, invalid, actor));
  approval.party = "고객사";
  const valid = proposed(result, "당사자 확인", baseline.id, null, approval, (s) => { s.approvals.push(approval); });
  assert.equal(validateTransition(definition, result, valid, actor).state.approvals[0].actorId, actor.id);
});

test("paid snapshots match the current quote and remain immutable after persistence", () => {
  const current = clone(definition.initialState);
  current.commerce = { cart: { "TASK-01": 2 }, months: 1, priceOverrides: {}, orders: [] };
  const offer = definition.catalog.pricing.offers.find((x: RecordData) => x.id === "TASK-01");
  const order = {
    id: "ORDER-001", title: "작업", actor: "수기", at: "2000-01-01", reason: "검증 요청", reference: "메일", brief: "문구 교체", startDate: "2026-11-18", extra: "",
    items: [{ ...offer, quantity: 2 }], months: 1, vatRate: .1, pricingVersion: definition.catalog.pricing.version, terms: definition.catalog.pricing.terms,
    totals: { monthly: 0, once: 60000, months: 1, monthlySupply: 0, supply: 60000, vat: 6000, total: 66000 },
  };
  const candidate = proposed(current, "유상 진행 확정", order.id, null, order, (s) => { s.commerce.orders.push(order); s.commerce.cart = {}; });
  const result = validateTransition(definition, current, candidate, actor).state;
  assert.equal(result.commerce.orders[0].actorId, actor.id);
  assert.equal(commerce(result).orders[0].totals.total, 66000);
  const reordered = JSON.parse(stableStringify(result));
  assert.doesNotThrow(() => definition.validate(reordered));
  const forged = clone(candidate);
  forged.commerce.orders[0].items[0].price = 1;
  assert.throws(() => validateTransition(definition, current, forged, actor));
  const hidden = proposed(result, "계약 조건 변경", "C02", result.terms.C02, "별도", (s) => { s.terms.C02 = "별도"; });
  hidden.commerce.orders[0].scope = "기존 확정 기록 변조";
  assert.throws(() => validateTransition(definition, result, hidden, actor));
});


test("contract groups follow the exact website selection and keep academy commerce", () => {
  const c = definition.catalog;
  const included = c.contractScope.websiteIncludedIds;
  const excluded = new Set([...c.contractScope.websiteExcludedIds, ...c.contractScope.dependentExcludedIds]);
  assert.equal(included.length, 31);
  assert.equal(c.contractScope.websiteExcludedIds.length, 41);
  assert.equal(c.contractModules.length, 27);
  assert.equal(c.contractDraft.articles.length, 16);
  const ids = new Set(c.contractModules.flatMap((x: RecordData) => x.featureIds));
  included.forEach((id: string) => assert(ids.has(id)));
  excluded.forEach(id => assert(!ids.has(id)));
  assert(ids.has("ACADEMY-017"));
  assert(ids.has("ACADEMY-001"));
  assert.equal(definition.initialState.terms.C02, "");
  assert.equal(definition.initialState.terms.C17, "");
});

test("scope source changes are admin-only, preserve prior state and cannot be forged", () => {
  const current = clone(definition.initialState);
  const scope = definition.catalog.contractScope;
  const candidate = proposed(current, "계약 범위 기준 반영", scope.version, null, scope, s => { s.scopeRevision = clone(scope); });
  assert.throws(() => validateTransition(definition, current, candidate, actor));
  const admin = { ...actor, isAdmin: true, party: "개발사" as const };
  const result = validateTransition(definition, current, candidate, admin);
  assert.deepEqual(result.state.scopeRevision, scope);
  assert.deepEqual(result.state.decisions, current.decisions);
  assert.equal(result.event.actorId, admin.id);
  const forged = clone(candidate);
  forged.scopeRevision.websiteExcludedIds = [];
  forged.events.at(-1)!.after.websiteExcludedIds = [];
  assert.throws(() => validateTransition(definition, current, forged, admin));
});

