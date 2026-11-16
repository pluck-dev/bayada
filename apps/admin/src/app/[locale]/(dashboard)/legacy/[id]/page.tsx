import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { can } from "@/lib/rbac";
import { LEGACY_KINDS, LEGACY_STATUS, legacyFields, legacyDate } from "@/lib/legacy";
import { Badge, Card, PageHeader } from "@/components/ui";

export default async function LegacyDetail({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const viewer = await requirePage("legacy.read", locale);
  const record = await prisma.legacyRecord.findUnique({ where: { id } });
  if (!record) notFound();
  const [files, member, course] = await Promise.all([
    record.kind === "BOARD" ? prisma.legacyRecord.findMany({ where: { kind: "FILE", payload: { path: ["boardRecordId"], equals: record.id } }, select: { id: true, title: true } }) : [],
    record.userWpId ? prisma.user.findUnique({ where: { legacyWpId: record.userWpId }, select: { id: true, name: true } }) : null,
    record.courseWpId ? prisma.course.findUnique({ where: { legacyWpId: record.courseWpId }, select: { id: true, title: true } }) : null,
  ]);
  return <>
    <PageHeader title={record.title} back={{ href: `/${locale}/legacy?kind=${record.kind}`, label: "이전 사이트 자료" }} description={<span className="flex flex-wrap items-center gap-3">
      <span>{LEGACY_KINDS[record.kind]}</span><Badge tone={record.status === "PENDING" ? "amber" : "slate"}>{LEGACY_STATUS[record.status]}</Badge>
      <span>{legacyDate(record.sourceDate)}</span>
    </span>} />
    <div className="flex max-w-5xl flex-col gap-5">
      {(record.userWpId || course) && <Card title="연결된 회원·프로그램"><div className="flex flex-wrap gap-5 text-caption">
        {member && can(viewer, "member.read") ? <Link className="text-brand hover:underline" href={`/${locale}/members/${member.id}`}>{member.name ?? "회원 상세"}</Link> : record.userWpId ? <span>기존 회원 #{record.userWpId}{!member && " · 현재 계정과 연결되지 않은 원본 기록"}</span> : null}
        {course && (can(viewer, "program.read") ? <Link className="text-brand hover:underline" href={`/${locale}/programs/${course.id}`}>{course.title}</Link> : <span>{course.title}</span>)}
      </div></Card>}
      {record.body && <Card title={record.kind === "ANSWER" ? "제출 답안" : record.kind === "CERTIFICATE" ? "기존 발급 코드" : "내용"}>
        <div className="whitespace-pre-wrap break-words text-sm leading-7">{record.body}</div>
      </Card>}
      <Card title="원본 기록"><dl className="grid grid-cols-[160px_minmax(0,1fr)] gap-x-5 gap-y-4 text-caption">
        {legacyFields(record.payload).map(([label, value]) => <div key={label} className="contents"><dt className="text-muted">{label}</dt><dd className="whitespace-pre-wrap break-words">{value}</dd></div>)}
      </dl></Card>
      {(files.length > 0 || record.kind === "FILE") && <Card title="첨부파일"><div className="flex flex-col items-start gap-3">
        {(record.kind === "FILE" ? [record] : files).map((f) => <a key={f.id} className="text-sm font-semibold text-brand hover:underline" href={`/api/v1/legacy/files/${f.id}`}>{f.title} 다운로드</a>)}
      </div></Card>}
    </div>
  </>;
}
