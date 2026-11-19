import Link from "next/link";
import { prisma, type Prisma } from "@bayada/db";
import { requirePage } from "@/lib/session";
import { PageHeader, Badge, Button, Select, inputClass } from "@/components/ui";
import { KoreaInquiryInbox, type KoreaInquiryRecord } from "@/components/korea/KoreaInquiryInbox";
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
  const counts=await Promise.all(['NEW','IN_PROGRESS','DONE'].map(status=>prisma.page.count({where:{slug:{startsWith:'korea/inquiry/'},content:{contains:`"status":"${status}"`}}})));
  const records=rows.map(row=>({slug:row.slug,updatedAt:row.updatedAt.toISOString(),data:JSON.parse(row.content),delivery:deliveryMap.get(JSON.parse(row.content).id)||'NOT_CONFIGURED'})) as KoreaInquiryRecord[];
  const statusHref=(status:string)=>`/${locale}/korea/inquiries?`+new URLSearchParams({q:query.q||'',kind:query.kind||'',status});
  return <><PageHeader title="상담·채용 접수" description="접수 내용을 확인하고 처리 상태와 메모를 남깁니다." eyebrow={<Badge tone="zinc">바야다코리아</Badge>}/>
  <nav className="mb-5 flex flex-wrap gap-2" aria-label="접수 상태 필터">{[['','전체',counts.reduce((a,b)=>a+b,0)],['NEW','신규',counts[0]],['IN_PROGRESS','처리 중',counts[1]],['DONE','완료',counts[2]]].map(([value,label,count])=><Link key={value} href={statusHref(String(value))} aria-current={(query.status||'')===value?'page':undefined} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${(query.status||'')===value?'bg-ink text-white':'bg-canvas text-muted hover:text-ink'}`}>{label}<span className="text-xs opacity-60">{count}</span></Link>)}</nav>
  <form className="mb-5 flex flex-wrap gap-3 rounded-2xl bg-canvas p-4" method="get"><input type="hidden" name="status" value={query.status||''}/><input name="q" defaultValue={query.q} aria-label="접수 검색" placeholder="이름·연락처·접수번호 검색" className={`${inputClass} min-w-0 flex-1 basis-56`}/><Select name="kind" defaultValue={query.kind||''} aria-label="접수 유형" options={[{value:'',label:'전체 유형'},{value:'CONSULTATION',label:'서비스 상담'},{value:'CAREERS',label:'채용 지원'}]}/><Button type="submit" variant="primary">검색</Button>{(query.q||query.kind)&&<Link className="self-center text-sm text-muted underline" href={`/${locale}/korea/inquiries?status=${encodeURIComponent(query.status||'')}`}>초기화</Link>}</form>
  <p className="mb-3 text-xs text-muted">검색 결과 {total}건 · 최근 변경순</p><KoreaInquiryInbox records={records}/><nav className="mt-5 flex items-center justify-end gap-4 text-sm" aria-label="접수 목록 페이지">{page>1&&<Link href={href(page-1)}>이전</Link>}<span className="text-muted">{page} / {Math.max(1,Math.ceil(total/25))}</span>{page*25<total&&<Link href={href(page+1)}>다음</Link>}</nav></>;
}
