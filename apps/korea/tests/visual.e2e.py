"""Automated headless regression suite (AGENTS.md's project-test exception).

Public pages only. No login, private records, form submission or external email.
"""
import json
import os
from pathlib import Path
from urllib.parse import quote

from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
OUTPUT = ROOT / os.environ.get('KOREA_VISUAL_OUTPUT', 'output/korea-visual')
ORIGINAL = 'https://www.bayadakorea.com'
CLONE = os.environ.get('KOREA_TEST_URL', 'http://localhost:3300').rstrip('/')
PATHS = ['/', '/aboutus/', '/visit-medical-care/', '/방문간호2/', '/공지사항2/', '/영상자료실/', '/서비스상담/', '/jab/']
if os.environ.get('KOREA_VISUAL_ALL') == '1':
    PATHS = [p['path'] for p in json.loads((ROOT / 'packages/korea/content/templates.json').read_text(encoding='utf-8'))['pages']]
if os.environ.get('KOREA_VISUAL_PATHS'):
    PATHS = json.loads(os.environ['KOREA_VISUAL_PATHS'])


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for width, height, label in [(1440, 900, 'desktop'), (390, 844, 'mobile')]:
            context = browser.new_context(viewport={'width': width, 'height': height}, locale='ko-KR', device_scale_factor=1)
            # Avoid adding QA pageviews to the client's analytics property.
            context.route('**/*', lambda route: route.abort() if any(x in route.request.url for x in ['googletagmanager.com', 'google-analytics.com', 'stats.wp.com']) else route.continue_())
            for index, path in enumerate(PATHS):
                pages = []
                record = {'viewport': label, 'path': path}
                for name, base in [('original', ORIGINAL), ('clone', CLONE)]:
                    page = context.new_page()
                    response = page.goto(base + quote(path, safe='/'), wait_until='domcontentloaded', timeout=60000)
                    assert response and response.status == 200, (name, path, response.status if response else None)
                    page.locator('.elementor-location-header img').first.wait_for()
                    page.wait_for_function('document.fonts.status === "loaded"', timeout=20000)
                    page.wait_for_timeout(2500)
                    record[name + 'Geometry'] = page.evaluate('''() => ({
                      header: Math.round(document.querySelector('.elementor-location-header').getBoundingClientRect().height),
                      width: document.documentElement.clientWidth,
                      overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
                      scrollY: window.scrollY,
                      firstHeadingTop: Math.round(document.querySelector('h1,h2')?.getBoundingClientRect().top || 0),
                      heading: [...document.querySelectorAll('h1,h2')].map(x=>x.textContent.trim()).filter(Boolean).slice(0,3),
                    })''')
                    target = OUTPUT / f'{label}-{index}-{name}.png'
                    page.screenshot(path=str(target), full_page=False)
                    pages.append((page, target))
                original, clone = (Image.open(x[1]).convert('RGB') for x in pages)
                # Timing-dependent carousels/video are not pixel-stable; compare the header/hero region.
                region_height = min(690 if path == '/' and width > 1000 else height, original.height, clone.height)
                diff = ImageChops.difference(original.crop((0, 0, width, region_height)), clone.crop((0, 0, width, region_height)))
                pixels = list(diff.getdata())
                record['nearPixelMatchRatio'] = round(sum(max(v) <= 16 for v in pixels) / len(pixels), 4)
                record['cloneNoHorizontalOverflow'] = not record['cloneGeometry']['overflow']
                if label == 'mobile' and index == 0:
                    clone_page = pages[1][0]
                    toggle = clone_page.locator('.elementor-menu-toggle:visible').first
                    toggle.click()
                    record['mobileMenuExpanded'] = toggle.get_attribute('aria-expanded') == 'true'
                    assert record['mobileMenuExpanded'], 'Mobile navigation did not open'
                    toggle.click()
                results.append(record)
                for page, _ in pages:
                    page.close()
                print(json.dumps({'completed': label + path, 'nearPixelMatchRatio': record['nearPixelMatchRatio'], 'overflow': record['cloneGeometry']['overflow']}, ensure_ascii=False), flush=True)
            context.close()
        browser.close()
    # Ratios are measured evidence, not a claim of absolute 100% pixel equality.
    (OUTPUT / 'results.json').write_text(json.dumps({'completed': True, 'cases': results, 'limit': 'Pixel metric covers viewport/header region; dynamic slider/video timing excluded for homepage.'}, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
