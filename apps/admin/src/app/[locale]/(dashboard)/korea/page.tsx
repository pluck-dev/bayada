import { requirePage } from "@/lib/session";
import { PageHeader, Badge } from "@/components/ui";
import { pages, templates, getEdits } from "@bayada/korea/server";
import { KoreaPageEditor } from "@/components/korea/KoreaPageEditor";
import { KoreaPageBrowser } from "@/components/korea/KoreaPageBrowser";
export default async function KoreaPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> }) {
 const {locale}=await params;await requirePage('korea.content',locale);const query=await searchParams;
 const page=pages.find(p=>p.key===query.page)??pages.find(p=>p.path==='/')!;const fragment=query.page&&Object.hasOwn(templates.fragments,query.page)?templates.fragments[query.page]:null;
 const key=fragment?query.page!:page.key,source=fragment||page;const{edits,updatedAt}=await getEdits(key);
 const short=(title:string)=>title.replace(/\s*\|\s*바야다홈헬스케어.*$/,'');
 const title=fragment?(key==='header'?'공통 헤더':'공통 푸터'):page.path==='/'?'홈페이지':short(page.title);
 const choices=[{key:'header',title:'공통 헤더',path:'/',kind:'fragment'},{key:'footer',title:'공통 푸터',path:'/',kind:'fragment'},...pages.map(p=>({key:p.key,title:p.path==='/'?'홈페이지':short(p.title)+(p.kind==='archive'&&p.path.includes('/page/')?' · '+p.path.match(/page\/(\d+)/)?.[1]+'쪽':''),path:p.path,kind:p.kind}))];
 choices.sort((a,b)=>Number(b.path==='/'&&b.kind==='page')-Number(a.path==='/'&&a.kind==='page'));
 return <><PageHeader title="페이지 편집" description="페이지를 선택한 뒤 문구·이미지·링크를 나누어 수정합니다." eyebrow={<Badge tone="zinc">바야다코리아</Badge>}/><div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]"><KoreaPageBrowser choices={choices} selected={key} locale={locale}/><KoreaPageEditor key={`${key}:${updatedAt}`} documentKey={key} fields={source.fields} initial={edits??{title:fragment?title:page.title,published:true,values:{}}} updatedAt={updatedAt} title={title} previewPath={fragment?'/':page.path} publicOrigin={process.env.KOREA_PUBLIC_URL||'http://localhost:3300'}/></div></>;
}
