// 리뷰·피드백 API — 웹사이트·아카데미의 Next 라우트 핸들러가 사이트 키만 넘겨 그대로 export 한다.
//   app/api/review/feedback/route.ts : export const { GET, POST, PUT, PATCH, DELETE } = createFeedbackRoute("web");
// 원본(Supabase site_feedback API)의 입력 검증·응답 코드·동시성 규칙을 Prisma 로 옮겼다.
// 모든 요청은 리뷰 모드 쿠키가 있어야 하고(원본은 사이트 전체 비밀번호 프록시가 대신 막았다), 모든 쿼리는 site 로 범위를 나눈다.
import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@bayada/db";
import { reviewDb as prisma } from "./db";
import {
  FEEDBACK_BODY_MAX,
  FEEDBACK_LIST_PAGE_SIZE,
  FEEDBACK_MARKER_PAGE_SIZE,
  FEEDBACK_REPLY_LIMIT,
  isFeedbackDepartment,
  isFeedbackKind,
  isFeedbackStatus,
  isFeedbackTags,
  isPagePath,
  isReviewerName,
  isSectionValue,
  manualFeedbackTransitions,
  pageSection,
  type FeedbackKind,
  type FeedbackStatus,
  type ReviewSiteKey,
} from "./config";
import {
  REVIEW_ACCESS_TTL_SECONDS,
  createReviewToken,
  isReviewTokenValid,
  reviewAccessEnabled,
  reviewCookieName,
  reviewHintCookieName,
  reviewIpHash,
  safeReviewDestination,
  sha256Hex,
  verifyReviewPassword,
} from "./access";

const NO_STORE = { "Cache-Control": "no-store" };
const PRIVATE = { "Cache-Control": "private, no-store", Vary: "Cookie" };
const HOURLY_LIMIT = 60;

const json = (body: unknown, status = 200, headers: Record<string, string> = NO_STORE) =>
  NextResponse.json(body, { status, headers });
const fail = (error: string, status: number) => json({ error }, status);

function requestHost(request: NextRequest) {
  return (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host).split(",")[0]!.trim();
}

/**
 * 같은 사이트 요청인지. 프록시(Caddy) 뒤에서는 nextUrl 의 프로토콜이 http 로 보일 수 있어 호스트만 비교한다.
 * write=true 면 Origin 헤더가 반드시 있어야 한다.
 */
function sameOrigin(request: NextRequest, write: boolean) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return !write;
  try {
    return new URL(origin).host === requestHost(request);
  } catch {
    return false;
  }
}

function hasAccess(site: ReviewSiteKey, request: NextRequest) {
  return isReviewTokenValid(site, request.cookies.get(reviewCookieName(site))?.value);
}

/** 쿠키·출처 검사. 통과하면 null */
function guard(site: ReviewSiteKey, request: NextRequest, write = false) {
  if (!reviewAccessEnabled()) return fail("리뷰 모드가 설정되지 않았습니다.", 503);
  if (!hasAccess(site, request)) return fail("리뷰 모드 비밀번호를 먼저 입력해 주세요.", 401);
  if (!sameOrigin(request, write)) return fail("허용되지 않은 요청입니다.", 403);
  return null;
}

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}

async function readJson(request: NextRequest, limit: number): Promise<{ value: Record<string, unknown> } | { error: NextResponse }> {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > limit) return { error: fail("입력 내용이 너무 깁니다.", 413) };
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return { error: fail("입력 형식을 확인해 주세요.", 400) };
    return { value };
  } catch {
    return { error: fail("입력 형식을 확인해 주세요.", 400) };
  }
}

const positiveInt = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) > 0;

const feedbackSelect = {
  id: true,
  kind: true,
  department: true,
  assignee: true,
  tags: true,
  body: true,
  context: true,
  status: true,
  createdAt: true,
  pagePath: true,
  editVersion: true,
  reworkReason: true,
  reworkRequestedAt: true,
  _count: { select: { replies: { where: { deletedAt: null } } } },
} satisfies Prisma.ReviewFeedbackSelect;

type FeedbackRow = Prisma.ReviewFeedbackGetPayload<{ select: typeof feedbackSelect }>;

/** 응답 모양은 원본 API(snake_case)를 유지한다 — 화면 코드가 그대로 읽는다 */
function serializeFeedback(row: FeedbackRow) {
  return {
    id: row.id,
    kind: row.kind,
    department: row.department,
    assignee: row.assignee,
    tags: row.tags,
    body: row.body,
    context: row.context,
    status: row.status,
    created_at: row.createdAt.toISOString(),
    page_path: row.pagePath,
    edit_version: row.editVersion,
    rework_reason: row.reworkReason,
    rework_requested_at: row.reworkRequestedAt?.toISOString() ?? null,
    reply_count: row._count.replies,
  };
}

const CONTEXT_TEXT_KEYS = ["selector", "tag", "text", "component", "typography", "font", "color", "classes"] as const;
const CONTEXT_NUMBER_KEYS = ["width", "height", "x", "y"] as const;

export function createFeedbackRoute(site: ReviewSiteKey) {
  async function GET(request: NextRequest) {
    const denied = guard(site, request);
    if (denied) return denied;
    const params = request.nextUrl.searchParams;
    const path = params.get("path") ?? "";
    const all = params.get("scope") === "all";
    const list = params.get("view") === "list";
    if (!all && !isPagePath(path)) return fail("화면 주소를 확인해 주세요.", 400);
    const status = params.get("status") ?? "";
    if (status && !isFeedbackStatus(status)) return fail("조회 조건을 확인해 주세요.", 400);
    const kind = params.get("kind") ?? "";
    if (kind && !isFeedbackKind(kind)) return fail("유형 조건을 확인해 주세요.", 400);
    const mine = params.get("mine") === "1";
    const department = params.get("department");
    const assignee = params.get("assignee");
    if (mine && (!list || !isFeedbackDepartment(department) || !isReviewerName(assignee))) return fail("작성자 정보를 확인해 주세요.", 400);
    const section = params.get("section") ?? "";
    if (section && (!all || !isSectionValue(section))) return fail("화면 조건을 확인해 주세요.", 400);
    const sort = params.get("sort") ?? "newest";
    if (sort !== "newest" && sort !== "oldest") return fail("정렬 조건을 확인해 주세요.", 400);
    const page = Number(params.get("page") ?? "1");
    if (!Number.isSafeInteger(page) || page < 1 || page > 100000) return fail("조회 조건을 확인해 주세요.", 400);

    const pageSize = list ? FEEDBACK_LIST_PAGE_SIZE : FEEDBACK_MARKER_PAGE_SIZE;
    const direction = !list || sort === "oldest" ? "asc" : "desc";
    const where: Prisma.ReviewFeedbackWhereInput = {
      site,
      deletedAt: null,
      ...(all ? {} : { pagePath: path }),
      ...(all && section ? { section } : {}),
      ...(status ? { status: status as FeedbackStatus } : {}),
      ...(kind ? { kind: kind as FeedbackKind } : {}),
      ...(mine && department && assignee ? { department, assignee } : {}),
    };
    try {
      const [total, rows] = await prisma.$transaction([
        prisma.reviewFeedback.count({ where }),
        prisma.reviewFeedback.findMany({
          where,
          select: feedbackSelect,
          orderBy: [{ createdAt: direction }, { id: direction }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return json({ items: rows.map(serializeFeedback), total, page, pageSize }, 200, PRIVATE);
    } catch (error) {
      console.error("[review] feedback list", error);
      return fail("피드백을 불러올 수 없습니다.", 503);
    }
  }

  async function POST(request: NextRequest) {
    const denied = guard(site, request, true);
    if (denied) return denied;
    const parsed = await readJson(request, 20000);
    if ("error" in parsed) return parsed.error;
    const input = parsed.value;
    const { body, page_path: path, context, department, assignee, tags, kind } = input;
    if (!isFeedbackKind(kind)) return fail("피드백 유형을 선택해 주세요.", 400);
    if (!isFeedbackDepartment(department)) return fail("소속을 선택해 주세요.", 400);
    if (!isReviewerName(assignee)) return fail("작성자 이름을 입력해 주세요.", 400);
    if (!isFeedbackTags(tags)) return fail("태그는 24자 이내로 최대 5개까지 추가해 주세요.", 400);
    if (typeof body !== "string" || !body.trim() || body.length > FEEDBACK_BODY_MAX || !isPagePath(path) || !context || typeof context !== "object" || Array.isArray(context))
      return fail("메모와 요소 정보를 확인해 주세요.", 400);
    const source = context as Record<string, unknown>;
    const safeContext: Record<string, string | number> = {};
    for (const key of CONTEXT_TEXT_KEYS) {
      const value = source[key];
      if (typeof value !== "string" || value.length > 1500) return fail("요소 정보를 확인해 주세요.", 400);
      safeContext[key] = value;
    }
    for (const key of CONTEXT_NUMBER_KEYS) {
      const value = source[key];
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1000000) return fail("화면 정보를 확인해 주세요.", 400);
      safeContext[key] = value;
    }
    const ipHash = reviewIpHash(clientIp(request));
    try {
      const recent = await prisma.reviewFeedback.count({ where: { ipHash, createdAt: { gte: new Date(Date.now() - 3600000) } } });
      if (recent >= HOURLY_LIMIT) return fail("등록 횟수가 많습니다. 잠시 후 다시 시도해 주세요.", 429);
      const editToken = randomBytes(32).toString("hex");
      const created = await prisma.reviewFeedback.create({
        data: {
          site,
          kind,
          department,
          assignee,
          tags,
          body: body.trim(),
          pagePath: path,
          section: pageSection(path),
          context: safeContext,
          ipHash,
          editTokenHash: sha256Hex(editToken),
        },
        select: { id: true },
      });
      return json({ saved: true, id: created.id, editToken }, 201);
    } catch (error) {
      console.error("[review] feedback create", error);
      return fail("저장하지 못했습니다. 다시 시도해 주세요.", 503);
    }
  }

  async function PUT(request: NextRequest) {
    const denied = guard(site, request, true);
    if (denied) return denied;
    const parsed = await readJson(request, 10000);
    if ("error" in parsed) return parsed.error;
    const input = parsed.value;
    const editVersion = input.editVersion;
    if (!positiveInt(input.id) || !Number.isSafeInteger(editVersion) || (editVersion as number) < 0 || (editVersion as number) >= 2147483647 || !isPagePath(input.page_path))
      return fail("피드백 정보를 확인해 주세요.", 400);
    if (typeof input.editToken !== "string" || !/^[0-9a-f]{64}$/.test(input.editToken)) return fail("이 브라우저에서 작성한 피드백만 수정할 수 있습니다.", 403);
    if (!isFeedbackDepartment(input.department) || !isReviewerName(input.assignee)) return fail("작성자 정보를 확인해 주세요.", 400);
    if (!isFeedbackKind(input.kind) || typeof input.body !== "string" || !input.body.trim() || input.body.length > FEEDBACK_BODY_MAX) return fail("피드백 내용을 확인해 주세요.", 400);
    if (!isFeedbackTags(input.tags)) return fail("태그는 24자 이내로 최대 5개까지 추가해 주세요.", 400);
    try {
      // 작성 브라우저 토큰 + 작성자 + 편집 버전 + 미처리 상태가 모두 맞을 때만 (조건부 UPDATE 로 동시 수정 방지)
      const { count } = await prisma.reviewFeedback.updateMany({
        where: {
          id: input.id as number,
          site,
          pagePath: input.page_path,
          department: input.department,
          assignee: input.assignee,
          editTokenHash: sha256Hex(input.editToken),
          editVersion: editVersion as number,
          status: "open",
          deletedAt: null,
        },
        data: { kind: input.kind, body: input.body.trim(), tags: input.tags, editVersion: (editVersion as number) + 1 },
      });
      if (count !== 1) return fail("수정 권한이 없거나 피드백이 변경되었습니다. 목록을 새로고침해 주세요.", 409);
      const item = await prisma.reviewFeedback.findUnique({ where: { id: input.id as number }, select: { id: true, kind: true, body: true, tags: true, editVersion: true } });
      return json({ item: item && { id: item.id, kind: item.kind, body: item.body, tags: item.tags, edit_version: item.editVersion } });
    } catch (error) {
      console.error("[review] feedback edit", error);
      return fail("수정하지 못했습니다. 다시 시도해 주세요.", 503);
    }
  }

  async function PATCH(request: NextRequest) {
    const denied = guard(site, request, true);
    if (denied) return denied;
    const parsed = await readJson(request, 10000);
    if ("error" in parsed) return parsed.error;
    const input = parsed.value;
    if (!positiveInt(input.id) || !isFeedbackStatus(input.status) || !isFeedbackStatus(input.expectedStatus) || !isPagePath(input.page_path))
      return fail("피드백 정보를 확인해 주세요.", 400);
    if (!manualFeedbackTransitions[input.expectedStatus].includes(input.status))
      return fail("배포완료는 관리자 화면에서 기록합니다. 디자인 확인은 배포완료 후 진행해 주세요.", 400);
    const rework = input.status === "open" && input.expectedStatus !== "discussion";
    const reason = typeof input.reworkReason === "string" ? input.reworkReason.trim() : "";
    if (rework && (!reason || reason.length > FEEDBACK_BODY_MAX)) return fail("재수정이 필요한 이유를 입력해 주세요.", 400);
    try {
      const { count } = await prisma.reviewFeedback.updateMany({
        where: { id: input.id, site, pagePath: input.page_path, status: input.expectedStatus, deletedAt: null },
        data: { status: input.status, ...(rework ? { reworkReason: reason, reworkRequestedAt: new Date() } : {}) },
      });
      if (count !== 1) return fail("다른 사용자가 상태를 변경했거나 피드백이 없습니다. 화면을 새로고침해 주세요.", 409);
      return json({ item: { id: input.id, status: input.status } });
    } catch (error) {
      console.error("[review] feedback status", error);
      return fail("상태를 저장하지 못했습니다. 다시 시도해 주세요.", 503);
    }
  }

  async function DELETE(request: NextRequest) {
    const denied = guard(site, request, true);
    if (denied) return denied;
    const parsed = await readJson(request, 5000);
    if ("error" in parsed) return parsed.error;
    const input = parsed.value;
    if (!positiveInt(input.id) || !isPagePath(input.page_path) || !isFeedbackStatus(input.expectedStatus)) return fail("피드백 정보를 확인해 주세요.", 400);
    try {
      const { count } = await prisma.reviewFeedback.updateMany({
        where: { id: input.id, site, pagePath: input.page_path, status: input.expectedStatus, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      if (count !== 1) return fail("피드백이 이미 변경되었거나 삭제되었습니다. 목록을 새로고침해 주세요.", 409);
      return json({ deleted: true });
    } catch (error) {
      console.error("[review] feedback delete", error);
      return fail("삭제하지 못했습니다. 다시 시도해 주세요.", 503);
    }
  }

  return { GET, POST, PUT, PATCH, DELETE };
}

const replySelect = { id: true, feedbackId: true, parentId: true, authorName: true, department: true, body: true, createdAt: true } satisfies Prisma.ReviewFeedbackReplySelect;
type ReplyRow = Prisma.ReviewFeedbackReplyGetPayload<{ select: typeof replySelect }>;
const serializeReply = (row: ReplyRow) => ({
  id: row.id,
  feedback_id: row.feedbackId,
  parent_id: row.parentId,
  author_name: row.authorName,
  department: row.department,
  body: row.body,
  created_at: row.createdAt.toISOString(),
});

export function createReplyRoute(site: ReviewSiteKey) {
  const liveFeedback = (id: number) => prisma.reviewFeedback.findFirst({ where: { id, site, deletedAt: null }, select: { id: true } });

  async function GET(request: NextRequest) {
    const denied = guard(site, request);
    if (denied) return denied;
    const feedbackId = Number(request.nextUrl.searchParams.get("feedback_id"));
    if (!positiveInt(feedbackId)) return fail("피드백 번호를 확인해 주세요.", 400);
    try {
      if (!(await liveFeedback(feedbackId))) return fail("피드백을 찾을 수 없습니다.", 404);
      const rows = await prisma.reviewFeedbackReply.findMany({
        where: { feedbackId, deletedAt: null },
        select: replySelect,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: FEEDBACK_REPLY_LIMIT,
      });
      return json({ items: rows.map(serializeReply) }, 200, PRIVATE);
    } catch (error) {
      console.error("[review] reply list", error);
      return fail("댓글을 불러올 수 없습니다.", 503);
    }
  }

  async function POST(request: NextRequest) {
    const denied = guard(site, request, true);
    if (denied) return denied;
    const parsed = await readJson(request, 5000);
    if ("error" in parsed) return parsed.error;
    const input = parsed.value;
    const feedbackId = input.feedback_id;
    const parentId = input.parent_id ?? null;
    const body = input.body;
    if (!positiveInt(feedbackId) || (parentId !== null && !positiveInt(parentId)) || typeof body !== "string" || !body.trim() || body.length > FEEDBACK_BODY_MAX || !isFeedbackDepartment(input.department) || !isReviewerName(input.assignee))
      return fail("댓글과 작성자 정보를 확인해 주세요.", 400);
    try {
      if (!(await liveFeedback(feedbackId))) return fail("피드백을 찾을 수 없습니다.", 404);
      if (parentId !== null) {
        const parent = await prisma.reviewFeedbackReply.findFirst({ where: { id: parentId, feedbackId, deletedAt: null }, select: { parentId: true } });
        if (!parent || parent.parentId !== null) return fail("답글 대상을 확인해 주세요.", 400);
      }
      const ipHash = reviewIpHash(clientIp(request));
      const recent = await prisma.reviewFeedbackReply.count({ where: { ipHash, createdAt: { gte: new Date(Date.now() - 3600000) } } });
      if (recent >= HOURLY_LIMIT) return fail("등록 횟수가 많습니다. 잠시 후 다시 시도해 주세요.", 429);
      const deleteToken = randomBytes(32).toString("hex");
      const item = await prisma.reviewFeedbackReply.create({
        data: { site, feedbackId, parentId, authorName: input.assignee, department: input.department, body: body.trim(), ipHash, deleteTokenHash: sha256Hex(deleteToken) },
        select: replySelect,
      });
      return json({ item: serializeReply(item), deleteToken }, 201);
    } catch (error) {
      console.error("[review] reply create", error);
      return fail("댓글을 저장하지 못했습니다. 다시 시도해 주세요.", 503);
    }
  }

  async function DELETE(request: NextRequest) {
    const denied = guard(site, request, true);
    if (denied) return denied;
    const parsed = await readJson(request, 500);
    if ("error" in parsed) return parsed.error;
    const { feedback_id: feedbackId, id, deleteToken } = parsed.value;
    if (!positiveInt(feedbackId) || !positiveInt(id) || typeof deleteToken !== "string" || !/^[0-9a-f]{64}$/.test(deleteToken))
      return fail("삭제 권한을 확인해 주세요.", 400);
    try {
      const { count } = await prisma.reviewFeedbackReply.updateMany({
        where: { id, feedbackId, site, deleteTokenHash: sha256Hex(deleteToken), deletedAt: null },
        data: { deletedAt: new Date() },
      });
      if (count !== 1) return fail("삭제 권한이 없거나 이미 삭제된 댓글입니다.", 403);
      return json({ id });
    } catch (error) {
      console.error("[review] reply delete", error);
      return fail("댓글을 삭제하지 못했습니다.", 503);
    }
  }

  return { GET, POST, DELETE };
}

/**
 * 리뷰 모드 세션: GET 상태 확인 / POST 비밀번호로 잠금 해제 / DELETE 종료.
 * 잠금 해제 시 서명 쿠키(httpOnly)와 표시용 힌트 쿠키를 함께 굽는다.
 */
export function createSessionRoute(site: ReviewSiteKey) {
  const cookieOptions = (maxAge: number, httpOnly: boolean) => ({
    httpOnly,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  });

  async function GET(request: NextRequest) {
    const enabled = reviewAccessEnabled();
    const unlocked = enabled && hasAccess(site, request);
    const response = json({ enabled, unlocked }, 200, PRIVATE);
    // 서명이 만료됐는데 힌트만 남아 있으면 지워서 다음 방문부터 묻지 않게 한다
    if (!unlocked && request.cookies.get(reviewHintCookieName(site))) response.cookies.set(reviewHintCookieName(site), "", cookieOptions(0, false));
    return response;
  }

  async function POST(request: NextRequest) {
    if (!sameOrigin(request, true)) return fail("허용되지 않은 요청입니다.", 403);
    if (!reviewAccessEnabled()) return fail("리뷰 모드 비밀번호가 설정되지 않았습니다.", 503);
    const parsed = await readJson(request, 3000);
    if ("error" in parsed) return parsed.error;
    const { password, next } = parsed.value;
    if (typeof password !== "string" || !verifyReviewPassword(password)) return fail("비밀번호가 올바르지 않습니다.", 401);
    const response = json({ redirectTo: safeReviewDestination(next) });
    response.cookies.set(reviewCookieName(site), createReviewToken(site), cookieOptions(REVIEW_ACCESS_TTL_SECONDS, true));
    response.cookies.set(reviewHintCookieName(site), "1", cookieOptions(REVIEW_ACCESS_TTL_SECONDS, false));
    return response;
  }

  async function DELETE(request: NextRequest) {
    if (!sameOrigin(request, true)) return fail("허용되지 않은 요청입니다.", 403);
    const response = json({ redirectTo: "/" });
    response.cookies.set(reviewCookieName(site), "", cookieOptions(0, true));
    response.cookies.set(reviewHintCookieName(site), "", cookieOptions(0, false));
    return response;
  }

  return { GET, POST, DELETE };
}

/** 서버 컴포넌트(/review-access 화면)용 — 쿠키 값으로 잠금 상태 확인 */
export function isReviewUnlocked(site: ReviewSiteKey, cookieValue: string | undefined) {
  return isReviewTokenValid(site, cookieValue);
}
