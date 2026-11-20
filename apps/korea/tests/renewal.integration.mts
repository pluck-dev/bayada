import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { prisma } from '@bayada/db';
import { pages, renderPage } from '@bayada/korea/server';
import { renewalPresentation } from '../src/lib/renewal';
const db=new URL(process.env.DATABASE_URL||'http://invalid');
if(db.hostname!=='127.0.0.1'||db.port!=='55433'||db.pathname!=='/bayada_functional_qa')throw Error('Only the isolated synthetic QA DB is allowed');
const home=pages.find(p=>p.path==='/')!,slug='korea/page/'+home.key,original=await prisma.page.findUnique({where:{slug}});
const checks:string[]=[];
try{
 const baseline=await renderPage(home,new URLSearchParams(),'http://localhost:3300');assert.ok(baseline&&!baseline.includes('korea-renewal'));checks.push('Default renderer remains visually unchanged without a presentation');
 let html=await renderPage(home,new URLSearchParams(),'http://localhost:3300',renewalPresentation(home));assert.ok(html?.includes('class="rn-home"'));assert.ok(html?.includes('href="tel:16701379"'));assert.ok(html?.includes('autoplay=0'));assert.ok(!html?.includes('{{KOREA_'));checks.push('Renewal home resolves CMS markers, telephone links and non-autoplay video');
 const value={title:'Synthetic design test',published:true,values:{f0:'<script>window.unsafe=1</script>',f27:'/media/qa-renewal.png',f41:'/faq-2/'}};
 await prisma.page.upsert({where:{slug},create:{slug,title:value.title,content:JSON.stringify(value)},update:{content:JSON.stringify(value)}});
 html=await renderPage(home,new URLSearchParams(),'http://localhost:3300',renewalPresentation(home));assert.ok(html?.includes('&lt;script&gt;window.unsafe=1&lt;/script&gt;'));assert.ok(!html?.includes('<script>window.unsafe'));assert.ok(html?.includes('src="/media/qa-renewal.png"'));assert.ok(html?.includes('href="/faq-2/"'));checks.push('Existing CMS title, hero image and action bindings work and text is escaped');
 value.published=false;await prisma.page.update({where:{slug},data:{content:JSON.stringify(value)}});assert.equal(await renderPage(home,new URLSearchParams(),'http://localhost:3300',renewalPresentation(home)),null);checks.push('CMS unpublished state is preserved');
 const nav=renewalPresentation(home).header!('<img src="/logo.png">',[{id:'qa',label:'QA <menu>',href:'tel:1234',children:[]}],'/');assert.ok(nav.includes('QA &lt;menu&gt;')&&nav.includes('href="tel:1234"'));checks.push('Navigation keeps safe contact links and escapes authored labels');
}finally{
 if(original)await prisma.page.upsert({where:{slug},create:{slug,title:original.title,content:original.content},update:{title:original.title,content:original.content}});else await prisma.page.deleteMany({where:{slug}});
 await prisma.$disconnect();
}
for(let i=0;i<pages.length;i+=6){await Promise.all(pages.slice(i,i+6).map(async p=>{const response=await fetch('http://localhost:3300'+encodeURI(p.path));assert.equal(response.status,200,p.path);const html=await response.text();assert.ok(html.includes('korea-renewal')&&html.includes('id="rn-main"'),p.path);assert.ok(!html.includes('{{KOREA_'),p.path);}));}
checks.push(`All ${pages.length} captured public routes render renewal shell without unresolved markers`);
writeFileSync('output/korea-renewal-integration.json',JSON.stringify({passed:true,environment:'isolated synthetic QA',checks},null,2));console.log(JSON.stringify({passed:true,groups:checks.length,publicRoutes:pages.length}));
