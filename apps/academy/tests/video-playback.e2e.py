"""Headless QA-only playback check. Requires isolated synthetic QA config/DB, ffmpeg and local QA app; creates its own fixtures."""
import json
import os
import subprocess
import uuid
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

private = Path('C:/Users/SIMJAE/AppData/Local/Temp/bayada-synthetic-qa-private.json')
config = json.loads(private.read_text(encoding='utf-8'))
database = urlparse(config['databaseUrl'])
assert database.hostname == '127.0.0.1' and database.port == 55433 and database.path == '/bayada_functional_qa', 'Synthetic QA only'
root = Path(__file__).resolve().parents[3]
video_name = 'qa-playback-' + uuid.uuid4().hex + '.webm'
video_file = root / 'apps/academy/public' / video_name
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc2=size=320x180:rate=24','-t','8','-c:v','libvpx','-b:v','200k','-an',str(video_file)],check=True)
fixture_code = r"""
const {PrismaClient}=require('@prisma/client');const {hash}=require('bcryptjs');
(async()=>{const db=new PrismaClient();try{
const tag='qa-video-'+Date.now();const user=await db.user.create({data:{email:tag+'@qa.invalid',password:await hash(process.env.QA_TEST_PASSWORD,10),name:tag,role:'STUDENT',status:'APPROVED'}});
const course=await db.course.create({data:{title:'QA video playback',slug:tag,status:'PUBLISHED',visibility:'PUBLIC',price:0,audiences:[],objectives:[],sections:{create:{title:'QA',order:0,lectures:{create:{title:'QA eight second video',type:'VIDEO',order:0,duration:8,videoUrl:process.env.QA_VIDEO_URL}}}}},include:{sections:{include:{lectures:true}}}});
await db.enrollment.create({data:{userId:user.id,courseId:course.id}});
console.log(JSON.stringify({courseId:course.id,lectureId:course.sections[0].lectures[0].id,slug:course.slug,userId:user.id,email:user.email}));
}finally{await db.$disconnect()}})().catch(()=>process.exit(1));
"""
qa_env={**os.environ,'DATABASE_URL':config['databaseUrl'],'DIRECT_URL':config['databaseUrl'],'QA_TEST_PASSWORD':config['testPassword'],'QA_VIDEO_URL':'/'+video_name}
fixture=json.loads(subprocess.check_output(['node','-e',fixture_code],cwd=root/'packages/db',env=qa_env,text=True))
base = 'http://127.0.0.1:3442'
evidence = {'passed': False, 'synthetic_video': True, 'real_customer_video': False}
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    context.route('**/*', lambda route: route.continue_() if urlparse(route.request.url).netloc == '127.0.0.1:3442' else route.abort())
    page = context.new_page()
    try:
        from time import sleep
        progress_statuses = []
        delayed = [False]
        def delay_first_progress(route):
            if not delayed[0] and route.request.method == 'PUT' and not route.request.post_data_json.get('completed'):
                delayed[0] = True
                sleep(2)
            route.continue_()
        page.route('**/api/v1/progress/**', delay_first_progress)
        page.on('response', lambda response: progress_statuses.append(response.status) if '/api/v1/progress/' in response.url else None)
        page.goto(base + '/ko/auth/login')
        page.get_by_label('이메일', exact=True).fill(fixture['email'])
        page.get_by_label('비밀번호', exact=True).fill(config['testPassword'])
        page.get_by_role('button', name='로그인', exact=True).click()
        page.wait_for_url(base + '/ko', timeout=20000)
        page.goto(base + '/ko/courses/' + fixture['slug'] + '/lectures/' + fixture['lectureId'])
        page.get_by_role('button', name='재생', exact=True).first.click()
        page.wait_for_function("document.querySelector('video')?.currentTime > 1", timeout=20000)
        evidence['advancedPastOneSecond'] = True
        page.wait_for_function("document.querySelector('video')?.ended === true", timeout=20000)
        evidence['ended'] = True
        evidence['media'] = page.locator('video').evaluate('(v) => ({duration:v.duration,currentTime:v.currentTime,readyState:v.readyState})')
        page.get_by_text('학습 완료', exact=False).first.wait_for(timeout=15000)
        evidence['completionVisible'] = True
        page.get_by_text('0:08 / 0:08', exact=False).first.wait_for(timeout=5000)
        evidence['durationLabelCorrect'] = True
        evidence['progressStatuses'] = progress_statuses
        assert 409 in progress_statuses and 200 in progress_statuses, 'Expected delayed-progress rejection and automatic recovery'
        verify_code = "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();(async()=>{const p=await db.progress.findUnique({where:{userId_lectureId:{userId:process.env.QA_USER_ID,lectureId:process.env.QA_LECTURE_ID}}});const e=await db.enrollment.findUnique({where:{userId_courseId:{userId:process.env.QA_USER_ID,courseId:process.env.QA_COURSE_ID}}});const certificates=await db.certificate.count({where:{userId:process.env.QA_USER_ID,courseId:process.env.QA_COURSE_ID}});console.log(JSON.stringify({completed:p?.completed,watchedSec:p?.watchedSec,progressPercent:e?.progressPercent,certificates}))})().finally(()=>db.$disconnect());"
        evidence['serverRecord']=json.loads(subprocess.check_output(['node','-e',verify_code],cwd=root/'packages/db',env={**qa_env,'QA_COURSE_ID':fixture['courseId'],'QA_USER_ID':fixture['userId'],'QA_LECTURE_ID':fixture['lectureId']},text=True))
        assert evidence['serverRecord'] == {'completed':True,'watchedSec':8,'progressPercent':100,'certificates':1}
        evidence['passed'] = True
        page.screenshot(path='output/qa-headless-video-completed.png')
    except Exception as error:
        evidence['failureType'] = type(error).__name__
        evidence['failure'] = str(error).replace(config['testPassword'], '[QA password]')[:1200]
        if page.locator('video').count():
            evidence['media'] = page.locator('video').first.evaluate('(v)=>({duration:v.duration,currentTime:v.currentTime,readyState:v.readyState,error:v.error?.message})')
        raise
    finally:
        browser.close()
        video_file.unlink(missing_ok=True)
        cleanup_code = "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();(async()=>{const userId=process.env.QA_USER_ID,courseId=process.env.QA_COURSE_ID;await db.$transaction([db.certificate.deleteMany({where:{userId,courseId}}),db.progress.deleteMany({where:{userId,lecture:{section:{courseId}}}}),db.enrollment.deleteMany({where:{userId,courseId}}),db.course.delete({where:{id:courseId}}),db.user.delete({where:{id:userId}})])})().finally(()=>db.$disconnect());"
        try:
            subprocess.run(['node','-e',cleanup_code],cwd=root/'packages/db',env={**qa_env,'QA_COURSE_ID':fixture['courseId'],'QA_USER_ID':fixture['userId']},check=True,stdout=subprocess.DEVNULL)
            evidence['fixturesCleaned'] = True
        except Exception:
            evidence['passed'] = False
            evidence['fixturesCleaned'] = False
            raise
        finally:
            Path('output/qa-headless-video-evidence.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2,allow_nan=False),encoding='utf-8')
print(json.dumps(evidence,ensure_ascii=False))
