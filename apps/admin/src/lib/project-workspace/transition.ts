import { isDeepStrictEqual } from "node:util";
import type { RecordData, WorkspaceDefinition, WorkspaceState } from "./definition";

export class WorkspaceError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export interface WorkspaceActor {
  id: string;
  name: string;
  party: "고객사" | "개발사";
  isAdmin: boolean;
}

const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const same = (a: unknown, b: unknown) => isDeepStrictEqual(a, b);
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
  if (value && typeof value === "object") {
    return "{" + Object.entries(value).sort(([a], [b]) => a.localeCompare(b, "en"))
      .map(([key, item]) => JSON.stringify(key) + ":" + stableStringify(item)).join(",") + "}";
  }
  return JSON.stringify(value);
}
const assert = (value: unknown, message: string): void => {
  if (!value) throw new WorkspaceError(400, message);
};
const text = (value: unknown, max = 12000): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;

export function commerce(state: WorkspaceState): RecordData {
  return state.commerce || { cart: {}, months: 1, priceOverrides: {}, orders: [] };
}

export function workspacePayload(state: WorkspaceState, catalog: RecordData) {
  const payload: RecordData = {
    specRevision: catalog.specRevision,
    decisions: state.decisions,
    terms: state.terms,
    customItems: state.customItems,
  };
  const c = commerce(state);
  if (Object.keys(c.cart).length || Object.keys(c.priceOverrides).length || c.orders.length) payload.commerce = c;
  return payload;
}

function decision(state: WorkspaceState, id: string) {
  return state.decisions[id] || {
    stage: "미배정", scope: "미합의", owner: "미정", status: "검토 전", acceptance: "", evidence: "", note: "",
  };
}

function pricedOffer(state: WorkspaceState, catalog: RecordData, id: string) {
  const base = catalog.pricing.offers.find((offer: RecordData) => offer.id === id);
  assert(base, "가격 항목을 찾을 수 없습니다.");
  return { ...base, ...commerce(state).priceOverrides[id] };
}

function pending(state: WorkspaceState, catalog: RecordData) {
  const items = [...catalog.features, ...state.customItems, ...catalog.security]
    .filter((x) => !["v1 재검토", "제외"].includes(x.scopeDisposition));
  return {
    unassigned: items.filter((x) => decision(state, x.id).stage === "미배정").length,
    unsigned: items.filter((x) => decision(state, x.id).scope === "미합의").length,
    terms: catalog.terms.filter((x: RecordData) => x.required && !state.terms[x.id].trim()).length,
  };
}

function assertDecision(value: RecordData) {
  assert(value && typeof value === "object", "항목 변경 형식이 올바르지 않습니다.");
  if (value.status === "검수 완료") assert(text(value.evidence), "검수 완료에는 증빙이 필요합니다.");
}

export function validateTransition(
  definition: WorkspaceDefinition,
  current: WorkspaceState,
  proposed: WorkspaceState,
  actor: WorkspaceActor,
  now = new Date().toISOString(),
): { state: WorkspaceState; event: RecordData } {
  try { definition.validate(proposed); } catch { throw new WorkspaceError(400, "문서 데이터가 올바르지 않습니다."); }
  assert(proposed.revision === current.revision + 1, "문서 버전이 올바르지 않습니다.");
  assert(proposed.events.length === current.events.length + 1, "변경은 한 번에 한 건씩 저장합니다.");
  assert(same(proposed.events.slice(0, -1), current.events), "기존 이력은 변경할 수 없습니다.");
  const supplied = proposed.events.at(-1)!;
  assert(/^[0-9a-f-]{36}$/i.test(supplied.id), "변경 식별자가 올바르지 않습니다.");
  assert(text(supplied.reason, 2000), "변경 사유가 필요합니다.");
  assert(supplied.reason.trim().length >= 2 && supplied.before !== undefined && supplied.after !== undefined, "변경 전후 내용과 사유를 확인하세요.");
  assert(typeof supplied.target === "string" && supplied.target.length <= 20000, "변경 대상이 올바르지 않습니다.");
  const expected = copy(current);
  const candidate = copy(proposed);
  const event: RecordData = {
    id: supplied.id, kind: supplied.kind, target: supplied.target,
    before: copy(supplied.before), after: copy(supplied.after), reason: supplied.reason,
    actor: actor.name, actorId: actor.id, at: now,
  };
  const id = event.target;
  const allowedItems = new Set([...definition.catalog.features, ...definition.catalog.security, ...current.customItems].map((x) => x.id));
  const before = (value: unknown) => assert(same(supplied.before, value), "변경 전 내용이 현재 문서와 다릅니다.");

  switch (event.kind) {
    case "계약 범위 기준 반영":
      assert(actor.isAdmin, "범위 기준 반영은 개발사 관리자만 수행합니다.");
      assert(id === definition.catalog.contractScope.version, "현재 범위 기준과 다릅니다.");
      before(current.scopeRevision || null);
      assert(same(event.after, definition.catalog.contractScope), "원본 범위 선택과 다릅니다.");
      assert(!same(current.scopeRevision, event.after), "이미 반영한 범위 기준입니다.");
      expected.scopeRevision = copy(event.after);
      break;
    case "항목 변경":
      assert(allowedItems.has(id), "기능 항목을 찾을 수 없습니다.");
      before(decision(current, id));
      assertDecision(event.after);
      expected.decisions[id] = event.after;
      break;
    case "일괄 배정": {
      const ids = Object.keys(event.after || {});
      assert(ids.length > 0 && ids.length <= 500 && ids.join(", ") === id, "일괄 대상이 올바르지 않습니다.");
      const old = Object.fromEntries(ids.map((key) => [key, decision(current, key)]));
      before(old);
      for (const key of ids) {
        assert(allowedItems.has(key), "일괄 대상에 없는 기능이 포함돼 있습니다.");
        assertDecision(event.after[key]);
        expected.decisions[key] = event.after[key];
      }
      break;
    }
    case "계약 조건 변경":
      assert(definition.catalog.terms.some((x: RecordData) => x.id === id), "계약 항목을 찾을 수 없습니다.");
      assert(!["C01", "C21", "C22"].includes(id), "확정된 기본 계약 원칙은 수정할 수 없습니다.");
      before(current.terms[id]);
      expected.terms[id] = event.after;
      break;
    case "요구사항 추가": {
      const item = event.after;
      before(null);
      assert(id === `REQ-${String(current.customItems.length + 1).padStart(3, "0")}` && item.id === id, "추가 요구 식별자가 올바르지 않습니다.");
      assert(text(item.title, 200) && text(item.behavior) && text(item.acceptance), "추가 요구의 기능명·처리·검수 기준이 필요합니다.");
      assert(["아카데미", "관리자", "공통", "웹사이트"].includes(item.site), "사이트 구분이 올바르지 않습니다.");
      expected.customItems.push(item);
      break;
    }
    case "기준본 저장": {
      before(null);
      const submitted = candidate.baselines.at(-1)!;
      const payload = workspacePayload(current, definition.catalog);
      assert(submitted && submitted.id === `BASE-${String(current.baselines.length + 1).padStart(3, "0")}`, "기준본 식별자가 올바르지 않습니다.");
      assert(submitted.id === id && submitted.reason === event.reason, "기준본의 대상과 변경 사유를 확인하세요.");
      assert(text(submitted.title, 200) && text(submitted.summary), "기준본 제목과 설명이 필요합니다.");
      const baseline: RecordData = {
        ...submitted, actor: actor.name, actorId: actor.id, at: now,
        revision: current.revision, snapshot: copy(payload), token: stableStringify(payload), pending: pending(current, definition.catalog),
      };
      assert(same(submitted.snapshot, baseline.snapshot) && submitted.token === baseline.token, "기준본의 원문이 현재 내용과 다릅니다.");
      expected.baselines.push(baseline);
      candidate.baselines[candidate.baselines.length - 1] = baseline;
      event.after = { id: baseline.id, title: baseline.title, pending: baseline.pending };
      break;
    }
    case "당사자 확인": {
      before(null);
      const approval = event.after;
      assert(current.baselines.some((x) => x.id === id) && approval.baselineId === id, "확인할 기준본을 찾을 수 없습니다.");
      assert(approval.party === actor.party, "로그인한 당사자 구분으로만 확인할 수 있습니다.");
      assert(text(approval.reference, 2000) && text(approval.note), "당사자 확인 근거와 범위가 필요합니다.");
      event.after = { ...approval, actor: actor.name, actorId: actor.id, at: now };
      expected.approvals.push(event.after);
      candidate.approvals[candidate.approvals.length - 1] = event.after;
      break;
    }
    case "유상 항목 선택":
      before({ cart: commerce(current).cart, months: commerce(current).months });
      expected.commerce = copy(commerce(current));
      expected.commerce.cart = event.after.cart;
      expected.commerce.months = event.after.months;
      break;
    case "제안 단가 변경": {
      before(pricedOffer(current, definition.catalog, id));
      const override = { ...event.after, revision: `${now} · ${actor.name} · r${current.revision + 1}` };
      expected.commerce = copy(commerce(current));
      expected.commerce.priceOverrides[id] = override;
      candidate.commerce.priceOverrides[id] = override;
      event.after = override;
      break;
    }
    case "유상 진행 확정": {
      before(null);
      const order = event.after;
      const c = commerce(current);
      const items = Object.entries(c.cart).map(([key, quantity]) => ({ ...pricedOffer(current, definition.catalog, key), quantity }));
      assert(id === `ORDER-${String(c.orders.length + 1).padStart(3, "0")}` && order.id === id, "진행 식별자가 올바르지 않습니다.");
      assert(items.length > 0 && same(order.items, items) && order.months === c.months, "진행 조건이 현재 선택서와 다릅니다.");
      assert(text(order.title, 300) && text(order.reference, 2000) && text(order.brief), "진행 제목·근거·작업 조건이 필요합니다.");
      assert(/^\d{4}-\d{2}-\d{2}$/.test(order.startDate), "시작일을 확인하세요.");
      event.after = { ...order, actor: actor.name, actorId: actor.id, at: now };
      expected.commerce = copy(c);
      expected.commerce.orders.push(event.after);
      expected.commerce.cart = {};
      candidate.commerce.orders[candidate.commerce.orders.length - 1] = event.after;
      break;
    }
    case "발주 진행 상태":
      assert(commerce(current).orders.some((x: RecordData) => x.id === id), "진행 기록을 찾을 수 없습니다.");
      before(commerce(current).orderUpdates?.[id] || { status: "진행 확정" });
      assert(text(event.after.note) && text(event.after.reference, 2000), "변경 내용과 근거가 필요합니다.");
      expected.commerce = copy(commerce(current));
      expected.commerce.orderUpdates = { ...(expected.commerce.orderUpdates || {}), [id]: event.after };
      break;
    default:
      throw new WorkspaceError(400, "지원하지 않는 변경입니다.");
  }
  expected.revision = current.revision + 1;
  expected.events.push(event);
  candidate.events[candidate.events.length - 1] = event;
  assert(same(candidate, expected), "요청한 항목 외의 변경 또는 과거 기록 변경이 포함돼 있습니다.");
  try { definition.validate(expected); } catch { throw new WorkspaceError(400, "변경된 문서의 검증에 실패했습니다."); }
  return { state: expected, event };
}
