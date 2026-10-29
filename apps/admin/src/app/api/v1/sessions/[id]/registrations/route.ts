import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { audit, getAdminUser } from "@/lib/session";
import { can } from "@/lib/rbac";

function csvCell(v: string): string {
  // 엑셀이 =,+,-,@ 로 시작하는 값을 수식으로 실행하지 않게 앞에 ' 를 붙인다
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function kst(d: Date): string {
  return new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 16).replace("T", " ");
}

/** 실습 신청자 명단 CSV (UTF-8 BOM — 엑셀에서 한글이 깨지지 않게) */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  if (!can(user, "session")) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const { id } = await params;
  const s = await prisma.trainingSession.findUnique({
    where: { id },
    select: {
      title: true,
      startsAt: true,
      registrations: {
        orderBy: { createdAt: "asc" },
        select: { createdAt: true, user: { select: { name: true, email: true, phone: true } } },
      },
    },
  });
  if (!s) return NextResponse.json({ error: "일정을 찾을 수 없습니다" }, { status: 404 });

  const lines = [
    ["번호", "이름", "이메일", "연락처", "신청 일시(KST)"].join(","),
    ...s.registrations.map((r, i) =>
      [String(i + 1), r.user.name ?? "", r.user.email, r.user.phone ?? "", kst(r.createdAt)].map(csvCell).join(","),
    ),
  ];
  await audit(user.id, "session.export", `TrainingSession:${id}`, { title: s.title, rows: s.registrations.length });

  const date = kst(s.startsAt).slice(0, 10);
  const filename = `실습신청자_${date}_${s.title}`.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80) + ".csv";
  return new NextResponse("﻿" + lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations.csv"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
