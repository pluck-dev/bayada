import Link from "next/link";
import { prisma, type Prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { KoreaInquiryEditor } from "@/components/korea/KoreaInquiryEditor";
export default async function InquiriesPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string; q?: string; status?: string; kind?: string }> }) {
  const { locale } = await params; await requirePage("korea.inquiries", locale);
  const query = await searchParams;
  const page = Math.max(1, Math.min(100000, Math.floor(Number(query.page) || 1)));
  const filters: Prisma.PageWhereInput[] = [{ slug: { startsWith: "korea/inquiry/" } }];
  if (query.q?.trim()) filters.push({ content: { contains: query.q.trim().slice(0, 100), mode: "insensitive" } });
  if (["NEW", "IN_PROGRESS", "DONE"].includes(query.status || "")) filters.push({ content: { contains: `"status":"${query.status}"` } });
  if (["CAREERS", "CONSULTATION"].includes(query.kind || "")) filters.push({ content: { contains: `"formType":"${query.kind}"` } });
  const where = { AND: filters };
  const [rows, total] = await Promise.all([prisma.page.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (page - 1) * 25, take: 25 }), prisma.page.count({ where })]);
  const ids = rows.map(row => JSON.parse(row.content).id as string);
  const deliveries = await prisma.page.findMany({ where: { slug: { in: ids.map(id => "korea/delivery/" + id) } }, select: { slug: true, content: true } });
  const deliveryMap = new Map(deliveries.map(row => [row.slug.slice("korea/delivery/".length), JSON.parse(row.content).state]));
  const href = (index: number) => `/${locale}/korea/inquiries?` + new URLSearchParams({ page: String(index), q: query.q || "", status: query.status || "", kind: query.kind || "" });
  return <><PageHeader title="바야다코리아 상담·채용 접수" description="리뉴얼 사이트 문의와 분리됩니다. 항목을 열어 내용과 처리 이력을 확인합니다." />
    <form className="mb-4 flex flex-wrap gap-3" method="get"><input name="q" defaultValue={query.q} aria-label="접수 검색" placeholder="접수번호·이름·연락처 검색" className="rounded border border-line px-3 py-2" /><select name="kind" defaultValue={query.kind} aria-label="접수 유형" className="rounded border border-line px-3 py-2"><option value="">전체 유형</option><option value="CONSULTATION">서비스 상담</option><option value="CAREERS">채용</option></select><select name="status" defaultValue={query.status} aria-label="처리 상태" className="rounded border border-line px-3 py-2"><option value="">전체 상태</option><option value="NEW">신규</option><option value="IN_PROGRESS">처리 중</option><option value="DONE">완료</option></select><button className="rounded border border-line px-4">조회</button></form>
    <p className="mb-4 text-sm text-muted">{total}건 · {page}/{Math.max(1, Math.ceil(total / 25))}쪽 · 최근 변경순</p>
    <div className="space-y-3">{rows.map(row => {
      const x = JSON.parse(row.content);
      return <details key={`${row.slug}:${row.updatedAt.toISOString()}`} className="rounded-xl border border-line bg-white p-4"><summary className="cursor-pointer text-sm font-bold">{x.formType === "CAREERS" ? "채용" : "상담"} · {x.reference} · {x.name} · {x.status === "DONE" ? "완료" : x.status === "IN_PROGRESS" ? "처리 중" : "신규"} · {x.title}</summary><div className="mt-4 grid gap-2 text-sm"><p>접수 {x.receivedAt}</p><p>{x.name} · {x.location}</p><p>연락처: {x.contact || x.phone || x.email}</p>{x.formType === "CAREERS" && <p>이메일: {x.email} · 지원 분야: {x.position}</p>}<p>{x.services.join(", ")}</p><p>알림: {deliveryMap.get(x.id) === "SENT" ? "SMTP 전송 완료 (실제 수신과 구분)" : deliveryMap.get(x.id) === "FAILED" ? "전송 실패 · 관리자에서 확인 필요" : "이메일 미설정 · 관리자 접수"}</p><p className="whitespace-pre-wrap">{x.message}</p><p>개인정보 동의: {x.privacyConsent ? "동의" : "미동의"}</p>{x.notes.map((n: { at: string; text: string }, i: number) => <p key={i} className="whitespace-pre-wrap">{n.at} — {n.text}</p>)}</div><KoreaInquiryEditor slug={row.slug} status={x.status} updatedAt={row.updatedAt.toISOString()} /></details>;
    })}{!rows.length && <p>접수된 항목이 없습니다.</p>}</div><nav className="mt-5 flex gap-4" aria-label="접수 목록 페이지">{page > 1 && <Link href={href(page - 1)}>이전</Link>}{page * 25 < total && <Link href={href(page + 1)}>다음</Link>}</nav>
  </>;
}
