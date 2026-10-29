import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { getViewer } from "@/lib/viewer";
import { canManageOrg } from "@/lib/queries/business";
import { JOB_ROLE_LABEL, formatDate } from "@/lib/labels";

const cell = (v: string | number | null | undefined) => {
  const s = v === null || v === undefined ? "" : String(v);
  // 엑셀 수식 주입 방지 + 따옴표 이스케이프
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/** 직원 × 과정 이수 현황 CSV (엑셀에서 한글이 깨지지 않게 UTF-8 BOM) */
export async function GET() {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    if (!canManageOrg(viewer)) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
    const organizationId = viewer.organizationId;

    const [org, users] = await Promise.all([
      prisma.organization.findUnique({ where: { id: organizationId }, select: { name: true } }),
      prisma.user.findMany({
        where: { organizationId },
        orderBy: [{ name: "asc" }, { email: "asc" }],
        select: {
          name: true,
          email: true,
          jobRole: true,
          enrollments: {
            orderBy: { createdAt: "asc" },
            select: { courseId: true, progressPercent: true, completedAt: true, course: { select: { title: true } } },
          },
          assignments: {
            where: { organizationId },
            select: { courseId: true, dueAt: true, course: { select: { title: true } } },
          },
          certificates: { select: { courseId: true, number: true } },
        },
      }),
    ]);

    const header = [
      "이름",
      "이메일",
      "직군",
      "과정",
      "기관 배정",
      "이수 기한",
      "진도율(%)",
      "상태",
      "수료일",
      "수료증 번호",
    ];
    const lines = [header.map(cell).join(",")];
    for (const u of users) {
      const base = [u.name ?? "", u.email, u.jobRole ? JOB_ROLE_LABEL[u.jobRole] : ""];
      const assigned = new Map(u.assignments.map((a) => [a.courseId, a]));
      const certs = new Map(u.certificates.map((c) => [c.courseId, c.number]));
      const courseIds = [
        ...new Set([...u.assignments.map((a) => a.courseId), ...u.enrollments.map((e) => e.courseId)]),
      ];
      if (courseIds.length === 0) {
        lines.push([...base, "", "", "", "", "수강 내역 없음", "", ""].map(cell).join(","));
        continue;
      }
      for (const courseId of courseIds) {
        const e = u.enrollments.find((x) => x.courseId === courseId);
        const a = assigned.get(courseId);
        const progress = e?.completedAt ? 100 : (e?.progressPercent ?? 0);
        const state = e?.completedAt ? "수료" : progress > 0 ? "진행 중" : "미시작";
        lines.push(
          [
            ...base,
            a?.course.title ?? e?.course.title ?? "",
            a ? "Y" : "",
            a?.dueAt ? formatDate(a.dueAt) : "",
            progress,
            state,
            e?.completedAt ? formatDate(e.completedAt) : "",
            certs.get(courseId) ?? "",
          ]
            .map(cell)
            .join(",")
        );
      }
    }

    const today = formatDate(new Date()).replace(/\./g, "");
    const filename = `${org?.name ?? "기관"}_이수현황_${today}.csv`;
    return new NextResponse(`\uFEFF${lines.join("\r\n")}\r\n`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="export.csv"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
