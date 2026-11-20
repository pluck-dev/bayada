import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
# This suite is a local UI test. Inquiry POST is mocked, so no receipt or notification is created.
base='http://localhost:3300';checks=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 for width,label in [(1440,'desktop'),(390,'mobile')]:
  page=browser.new_page(viewport={'width':width,'height':950 if width==1440 else 844});page.set_default_timeout(15000);page.goto(base);page.evaluate('document.fonts.ready');expect(page.locator('.rn-hero h1')).to_contain_text('찾아가는 전문 간호');assert page.locator('.rn-hero-actions a').nth(1).get_attribute('href')=='tel:16701379';assert page.locator('.rn-hero-person').evaluate('(i)=>i.complete&&i.naturalWidth>0');assert page.evaluate('document.documentElement.scrollWidth <= innerWidth');assert page.evaluate('document.fonts.check("16px KoreaFigtree")');assert page.locator('.rn-partner-grid .psacp-post-slide').count()==24
  if width==390:
   page.get_by_role('button',name='메뉴 열기',exact=True).click();expect(page.get_by_role('navigation',name='주 메뉴')).to_be_visible();page.locator('.rn-nav-group summary').first.click();expect(page.locator('.rn-dropdown').first).to_be_visible();page.keyboard.press('Escape');expect(page.get_by_role('button',name='메뉴 열기',exact=True)).to_have_attribute('aria-expanded','false');assert page.evaluate('document.documentElement.scrollWidth <= innerWidth');checks.append('Mobile navigation opens by keyboard-accessible controls and Escape closes it')
  else:
   expect(page.get_by_role('navigation',name='주 메뉴')).to_be_visible();page.locator('.rn-nav-group summary').first.click();expect(page.locator('.rn-dropdown').first).to_be_visible();page.keyboard.press('Escape');assert page.locator('.rn-nav-group[open]').count()==0
  page.screenshot(path=f'output/renewal-final-{label}-home.png',full_page=True);checks.append(label+' home has local fonts, hero image, functional telephone link and CMS partner logos without overflow')
  for route,name in [('/aboutus/','about'),('/서비스상담/','contact'),('/공지사항2/','board'),('/faq-2/','faq')]:
   page.goto(base+route);assert page.locator('main#rn-main').count()==1;assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(label,name);assert page.locator('.rn-header').count()==1;page.screenshot(path=f'output/renewal-final-{label}-{name}.png',full_page=True)
  page.goto(base+'/서비스상담/');page.route('**/api/inquiries',lambda route:route.fulfill(status=201,content_type='application/json',body=json.dumps({'ok':True,'reference':'KR-20261120-00000000','message':'접수 완료'})));page.locator('[name="you-sub"]').fill('디자인 검증');page.locator('[name="your-name"]').fill('시안 검증');page.locator('[name="your-contact"]').fill('qa@example.test');page.locator('input[type=checkbox]').first.check();page.locator('input[name="privacyConsent"]').check();page.locator('input[type=submit],button[type=submit]').first.click();expect(page.get_by_role('heading',name='상담 신청이 완료되었습니다.',exact=True)).to_be_visible();page.get_by_role('button',name='추가 문의 작성',exact=True).click();expect(page.locator('[name="you-sub"]')).to_be_visible();checks.append(label+' inner pages fit viewport and mocked inquiry success/retry retains the existing form workflow')
 browser.close()
Path('output/korea-renewal-ui.json').write_text(json.dumps({'passed':True,'checks':checks,'productionWrites':False},ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({'passed':True,'groups':len(checks)}))
