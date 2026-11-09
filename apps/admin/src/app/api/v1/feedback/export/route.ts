import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@bayada/db";
import { departmentLabel, feedbackKindLabel, feedbackStatuses, reviewSites, sectionLabel, type FeedbackStatus } from "@bayada/review/config";
import { audit, getAdminUser } from "@/lib/session";
import { can } from "@/lib/rbac";
import { feedbackContext, feedbackLocationUrl, feedbackWhere, parseFeedbackFilter } from "@/lib/queries/feedback";

const MAX_ROWS = 5000;

function csvCell(v: string): string {
  // 엑셀이 =,+,-,@ 로 시작하는 값을 수식으로 실행하지 않게 앞에 ' 를 붙인다
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function kst(d: Date | null): string {
  return d ? new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 16).replace("T", " ") : "";
}

/** 피드백 목록 CSV — 목록 화면과 같은 필터 (UTF-8 BOM, 최대 5000건) */
export async function GET(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  if (!can(user, "feedback")) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const filter = parseFeedbackFilter(Object.fromEntries(request.nextUrl.searchParams));
  const rows = await prisma.reviewFeedback.findMany({
    where: feedbackWhere(filter),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: MAX_ROWS,
    select: {
      id: true,
      site: true,
      kind: true,
      status: true,
      department: true,
      assignee: true,
      tags: true,
      body: true,
      pagePath: true,
      section: true,
      context: true,
      reworkReason: true,
      reworkRequestedAt: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { replies: { where: { deletedAt: null } } } },
    },
  });

  const header = ["번호", "사이트", "화면 영역", "화면 경로", "유형", "상태", "작성자", "소속", "태그", "내용", "선택 요소 텍스트", "선택자", "화면 크기", "댓글 수", "재수정 사유", "재수정 요청일(KST)", "등록일(KST)", "수정일(KST)", "위치 보기"];
  const lines = [
    header.join(","),
    ...rows.map((r) => {
      const ctx = feedbackContext(r.context);
      return [
        String(r.id),
        reviewSites[r.site].label,
        sectionLabel(r.site, r.section),
        r.pagePath,
        feedbackKindLabel(r.kind),
        feedbackStatuses[r.status as FeedbackStatus],
        r.assignee ?? "",
        departmentLabel(r.department),
        r.tags.map((t) => `#${t}`).join(" "),
        r.body,
        String(ctx.text ?? ""),
        String(ctx.selector ?? ""),
        ctx.width && ctx.height ? `${ctx.width}x${ctx.height}` : "",
        String(r._count.replies),
        r.reworkReason ?? "",
        kst(r.reworkRequestedAt),
        kst(r.createdAt),
        kst(r.updatedAt),
        feedbackLocationUrl(r.site, r.pagePath, ctx, r.id) ?? "",
      ]
        .map(csvCell)
        .join(",");
    }),
  ];
  await audit(user.id, "feedback.export", "ReviewFeedback:*", { rows: rows.length, filter });

  const filename = `피드백_${kst(new Date()).slice(0, 10)}${filter.site ? `_${reviewSites[filter.site].label}` : ""}.csv`;
  return new NextResponse("﻿" + lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="feedback.csv"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
