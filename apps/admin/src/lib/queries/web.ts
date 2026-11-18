// 웹사이트 작업 영역 조회 — 문의 CRM 목록·상세·대시보드, 담당자 후보
import { prisma, type Prisma, type WebInquiryStatus } from "@bayada/db";
import { WEB_INQUIRY_STATUSES, isWebFormType } from "@bayada/shared/web-content";
import { ADMIN_ROLES } from "@/lib/rbac";
import { getRoleDefs, roleKeyOf } from "@/lib/roles";

export interface InquiryFilter {
  type?: string;
  status?: string;
  /** YYYY-MM-DD (KST) */
  from?: string;
  to?: string;
  q?: string;
}

const isStatus = (v: unknown): v is WebInquiryStatus => typeof v === "string" && (WEB_INQUIRY_STATUSES as readonly string[]).includes(v);
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** 필터 값 정리 — 화면·CSV 공용. 잘못된 값은 버린다 */
export function parseInquiryFilter(sp: Record<string, string | undefined>): InquiryFilter {
  return {
    type: isWebFormType(sp.type) ? sp.type : undefined,
    status: isStatus(sp.status) ? sp.status : undefined,
    from: sp.from && DAY.test(sp.from) ? sp.from : undefined,
    to: sp.to && DAY.test(sp.to) ? sp.to : undefined,
    q: sp.q?.trim() ? sp.q.trim().slice(0, 100) : undefined,
  };
}

/** status 를 뺀 조건 (상태 칩 숫자는 다른 필터만 반영) */
function baseWhere(f: InquiryFilter): Prisma.WebInquiryWhereInput {
  const createdAt: Prisma.DateTimeFilter = {};
  if (f.from) createdAt.gte = new Date(`${f.from}T00:00:00+09:00`);
  if (f.to) createdAt.lt = new Date(new Date(`${f.to}T00:00:00+09:00`).getTime() + 86400_000);
  const q = f.q;
  return {
    ...(f.type ? { formType: f.type } : {}),
    ...(f.from || f.to ? { createdAt } : {}),
    ...(q
      ? {
          OR: [
            { referenceNo: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { organization: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export function inquiryWhere(f: InquiryFilter): Prisma.WebInquiryWhereInput {
  return { ...baseWhere(f), ...(f.status ? { status: f.status as WebInquiryStatus } : {}) };
}

export const INQUIRY_PAGE_SIZE = 20;

export async function listInquiries(f: InquiryFilter, page: number) {
  const where = inquiryWhere(f);
  const [rows, total, grouped] = await Promise.all([
    prisma.webInquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * INQUIRY_PAGE_SIZE,
      take: INQUIRY_PAGE_SIZE,
      select: {
        id: true,
        referenceNo: true,
        formType: true,
        status: true,
        name: true,
        phone: true,
        email: true,
        organization: true,
        createdAt: true,
        assignee: { select: { name: true, email: true } },
        _count: { select: { notes: true } },
      },
    }),
    prisma.webInquiry.count({ where }),
    prisma.webInquiry.groupBy({ by: ["status"], where: baseWhere(f), _count: { _all: true } }),
  ]);
  const statusCounts = Object.fromEntries(grouped.map((g) => [g.status, g._count._all])) as Partial<Record<WebInquiryStatus, number>>;
  return { rows, total, pages: Math.max(1, Math.ceil(total / INQUIRY_PAGE_SIZE)), statusCounts };
}

export async function getInquiry(id: string) {
  return prisma.webInquiry.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true, email: true } } } },
    },
  });
}

/** 담당자 후보 — 승인된 운영 계정(시스템 운영 역할 또는 사용자 정의 역할). 파트너 관리자는 제외 */
export async function listAssignees() {
  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      where: {
        status: "APPROVED",
        OR: [{ role: { in: ADMIN_ROLES.filter((r) => r !== "PARTNER_ADMIN") } }, { customRoleKey: { not: null } }],
      },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true, role: true, customRoleKey: true },
    }),
    getRoleDefs(),
  ]);
  const eligible = new Set(roles.filter(role => role.permissions.includes("web.inquiries")).map(role => role.key));
  return users.filter(user => eligible.has(roleKeyOf(user))).map(({ id, name, email }) => ({ id, name, email }));
}

/** 웹사이트 대시보드 숫자 */
export async function getWebDashboard() {
  const weekAgo = new Date(Date.now() - 7 * 86400_000);
  const [byStatus, week, recent, posts, drafts, faqs, reviews, slides] = await Promise.all([
    prisma.webInquiry.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.webInquiry.count({ where: { createdAt: { gte: weekAgo }, status: { not: "SPAM" } } }),
    prisma.webInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, referenceNo: true, formType: true, status: true, name: true, organization: true, createdAt: true },
    }),
    prisma.webBlogPost.count({ where: { isPublished: true } }),
    prisma.webBlogPost.count({ where: { isPublished: false } }),
    prisma.webFaqItem.count({ where: { visible: true } }),
    prisma.webReview.count({ where: { visible: true } }),
    prisma.webHeroSlide.count({ where: { visible: true } }),
  ]);
  const status = Object.fromEntries(byStatus.map((g) => [g.status, g._count._all])) as Partial<Record<WebInquiryStatus, number>>;
  return { status, week, recent, content: { posts, drafts, faqs, reviews, slides } };
}
