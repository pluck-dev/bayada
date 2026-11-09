import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { WEB_FIELD_LABEL, WEB_INQUIRY_STATUS_LABEL, formatWebFieldValue, webFormLabel } from "@bayada/shared/web-content";
import { audit, getAdminUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { inquiryWhere, parseInquiryFilter } from "@/lib/queries/web";

function csvCell(v: string): string {
  // 엑셀이 =,+,-,@ 로 시작하는 값을 수식으로 실행하지 않게 앞에 ' 를 붙인다
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function kst(d: Date): string {
  return new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 16).replace("T", " ");
}

const MAX_ROWS = 5000;

/** 홈페이지 문의 CSV — 목록 화면과 같은 필터(type·status·from·to·q). UTF-8 BOM */
export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  if (!can(user, "web.inquiries")) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const sp = Object.fromEntries(new URL(request.url).searchParams.entries());
  const filter = parseInquiryFilter(sp);
  const rows = await prisma.webInquiry.findMany({
    where: inquiryWhere(filter),
    orderBy: { createdAt: "desc" },
    take: MAX_ROWS,
    include: { assignee: { select: { name: true, email: true } } },
  });

  const lines = [
    ["접수번호", "유형", "상태", "이름", "연락처", "이메일", "기관", "담당자", "접수 일시(KST)", "접수 페이지", "신청 내용"].join(","),
    ...rows.map((r) => {
      const payload = (r.payload && typeof r.payload === "object" && !Array.isArray(r.payload) ? r.payload : {}) as Record<string, unknown>;
      const detail = Object.entries(payload)
        .map(([k, v]) => [WEB_FIELD_LABEL[k] ?? k, formatWebFieldValue(k, v)] as const)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" / ");
      return [
        r.referenceNo,
        webFormLabel(r.formType),
        WEB_INQUIRY_STATUS_LABEL[r.status],
        r.name ?? "",
        r.phone ?? "",
        r.email ?? "",
        r.organization ?? "",
        r.assignee ? (r.assignee.name ?? r.assignee.email) : "",
        kst(r.createdAt),
        r.sourcePage ?? "",
        detail,
      ]
        .map(csvCell)
        .join(",");
    }),
  ];
  await audit(user.id, "web.inquiry.export", "WebInquiry:export", { filter, rows: rows.length });

  const filename = `홈페이지문의_${kst(new Date()).slice(0, 10)}.csv`;
  return new NextResponse("﻿" + lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inquiries.csv"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
