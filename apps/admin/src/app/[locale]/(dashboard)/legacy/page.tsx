import Link from "next/link";
import { prisma, type Prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { LEGACY_KINDS, LEGACY_STATUS, legacyDate } from "@/lib/legacy";
import { Badge, EmptyState, FilterChip, PageHeader, cx, qs, tableClass, tableWrap, tdClass, thClass, trClass } from "@/components/ui";
import { SearchBox } from "@/components/SearchBox";
import { SelectFilter } from "@/components/SelectFilter";
import { Pager } from "@/components/Pager";

export default async function LegacyPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kind?: string; status?: string; q?: string; page?: string; user?: string; board?: string }>;
}) {
  const { locale } = await params;
  await requirePage("legacy.read", locale);
  const sp = await searchParams;
  const selectedKind = sp.kind ?? "BOARD";
  const kind = Object.hasOwn(LEGACY_KINDS, selectedKind) ? selectedKind : undefined;
  const status = sp.status && Object.hasOwn(LEGACY_STATUS, sp.status) ? sp.status : undefined;
  const userWpId = sp.user && /^\d{1,9}$/.test(sp.user) ? Number(sp.user) : undefined;
  const q = sp.q?.trim().slice(0, 200);
  const board = ["공지사항", "학습자료", "문의게시판", "뉴스룸"].includes(sp.board ?? "") ? sp.board : undefined;
  const where: Prisma.LegacyRecordWhereInput = {
    ...(kind ? { kind } : {}), ...(status ? { status } : {}), ...(userWpId ? { userWpId } : {}),
    ...(kind === "BOARD" && board ? { payload: { path: ["boardName"], equals: board } } : {}),
    ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { body: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const [total, groups] = await Promise.all([
    prisma.legacyRecord.count({ where }),
    prisma.legacyRecord.groupBy({ by: ["kind"], where: userWpId ? { userWpId } : {}, _count: true }),
  ]);
  const pages = Math.max(1, Math.ceil(total / 40));
  const requested = Number(sp.page);
  const page = Math.min(pages, Number.isSafeInteger(requested) && requested > 0 ? requested : 1);
  const rows = await prisma.legacyRecord.findMany({ where, skip: (page - 1) * 40, take: 40,
    orderBy: [{ sourceDate: { sort: "desc", nulls: "last" } }, { id: "asc" }],
    select: { id: true, kind: true, title: true, status: true, sourceDate: true, userWpId: true, payload: true },
  });
  const counts = new Map(groups.map((g) => [g.kind, g._count]));
  const base = `/${locale}/legacy`;
  const link = (value?: string) => qs(base, { kind: value, user: sp.user });
  return <>
    <PageHeader title="이전 사이트 자료" description="기존 아카데미의 게시판·첨부·수료증 코드·시험 답안입니다. 비공개·휴지통·승인 대기 상태를 보존했으며 이 화면의 자료는 학습자에게 자동 공개되지 않습니다." />
    {userWpId && <p className="mb-3 text-caption text-muted">기존 회원 #{userWpId}의 기록 <Link className="ml-2 text-brand" href={base}>전체 회원 보기</Link></p>}
    <div className="mb-4 flex flex-wrap gap-1.5">
      <FilterChip href={link("ALL")} active={!kind} count={groups.reduce((n, g) => n + g._count, 0)}>전체</FilterChip>
      {Object.entries(LEGACY_KINDS).map(([key, label]) => <FilterChip key={key} href={link(key)} active={kind === key} count={counts.get(key) ?? 0}>{label}</FilterChip>)}
    </div>
    <div className="mb-4 flex flex-wrap gap-3">
      <SearchBox placeholder="제목·내용·수료증 코드 검색" />
      {kind === "BOARD" && <SelectFilter param="board" label="게시판" value={board ?? ""} options={[{ value: "", label: "모든 게시판" }, ...["공지사항", "학습자료", "문의게시판", "뉴스룸"].map((label) => ({ value: label, label }))]} />}
      <SelectFilter param="status" label="상태" value={status ?? ""} options={[{ value: "", label: "모든 상태" }, ...Object.entries(LEGACY_STATUS).map(([value, label]) => ({ value, label }))]} />
    </div>
    <div className={tableWrap}>{!rows.length ? <EmptyState title="해당하는 자료가 없습니다" /> : <table className={tableClass}>
      <thead><tr>{["분류", "제목", "상태", "원본 작성일"].map((s) => <th key={s} className={thClass}>{s}</th>)}</tr></thead>
      <tbody>{rows.map((r) => <tr key={r.id} className={trClass}>
        <td className={tdClass}>{r.kind === "BOARD" && r.payload && typeof r.payload === "object" && !Array.isArray(r.payload) ? String(r.payload.boardName ?? "게시판") : LEGACY_KINDS[r.kind] ?? r.kind}</td>
        <td className={cx(tdClass, "whitespace-normal!")}><Link className="font-semibold hover:text-brand" href={`${base}/${r.id}`}>{r.title}</Link></td>
        <td className={tdClass}><Badge tone={r.status === "PENDING" ? "amber" : r.status === "PUBLISHED" ? "green" : "slate"}>{LEGACY_STATUS[r.status] ?? r.status}</Badge></td>
        <td className={cx(tdClass, "tabular text-muted")}>{legacyDate(r.sourceDate)}</td>
      </tr>)}</tbody>
    </table>}</div>
    <Pager page={page} pages={pages} total={total} />
  </>;
}
