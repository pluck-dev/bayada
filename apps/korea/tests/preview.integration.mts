import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {prisma} from '@bayada/db';
const db=new URL(process.env.DATABASE_URL||'http://invalid');if(db.hostname!=='127.0.0.1'||db.port!=='55433'||db.pathname!=='/bayada_functional_qa')throw Error('Only isolated QA is allowed');
try{
 const before=await prisma.page.count({where:{slug:{startsWith:'korea/inquiry/'}}});
 const home=await fetch('http://localhost:3300/');assert.equal(home.status,200);assert.ok((home.headers.get('x-robots-tag')||'').includes('noindex'));const html=await home.text();assert.ok(html.includes('korea-preview-notice')&&html.includes('feat/renewal'));
 const blocked=await fetch('http://localhost:3300/api/inquiries',{method:'POST',headers:{Origin:'http://localhost:3300','content-type':'application/json'},body:JSON.stringify({formType:'CONSULTATION',name:'Preview write rejection',contact:'qa@example.test',title:'Must not be stored',privacyConsent:true})});assert.equal(blocked.status,409);assert.equal(await prisma.page.count({where:{slug:{startsWith:'korea/inquiry/'}}}),before);
 const key='korea.views.bayadab_01.13';const old=await prisma.siteSetting.findUnique({where:{key}});assert.equal((await fetch('http://localhost:3300/'+encodeURI('공지사항2')+'/?vid=13')).status,200);const current=await prisma.siteSetting.findUnique({where:{key}});assert.deepEqual(current?.value,old?.value);
 writeFileSync('output/korea-preview-integration.json',JSON.stringify({passed:true,checks:['Preview label and noindex header','Valid inquiry POST rejected before storage','Article view causes no counter writes'],environment:'isolated QA'},null,2));console.log('Passed 3 preview isolation checks');
}finally{await prisma.$disconnect();}
