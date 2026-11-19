"""Exercise the real HTML controls and submit handler against isolated local QA."""
import json
import os
import time
import ipaddress
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[3]
BASE = os.environ.get('KOREA_TEST_URL', 'http://127.0.0.1:3300').rstrip('/')
if urlsplit(BASE).hostname not in ['127.0.0.1', 'localhost']:
    raise RuntimeError('Only isolated local QA is allowed for automatic form submissions')


def main():
    output = ROOT / 'output/korea-inquiry-e2e'
    output.mkdir(parents=True, exist_ok=True)
    run_id = 'qa-korea-form-' + str(int(time.time()))
    receipts = []
    test_ip = str(ipaddress.IPv6Address(int(ipaddress.IPv6Address('2001:db8::')) + (time.time_ns() & ((1 << 64) - 1))))
    with sync_playwright() as p:
        browser = p.chromium.launch()
        mobile = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, locale='ko-KR', extra_http_headers={'X-Forwarded-For': test_ip})
        page = mobile.new_page()
        page.goto(BASE + '/서비스상담/', wait_until='domcontentloaded')
        page.locator('input[name="you-sub"]').fill(run_id + '-email')
        page.locator('input[name="your-name"]').fill('QA 신청 테스트')
        page.locator('input[name="your-contact"]').fill('not-a-contact')
        page.locator('input[name="loct"]').fill('QA 강남')
        page.locator('input[name="checkbox-446[]"]').first.check()
        page.locator('input[name="privacyConsent"]').check()
        with page.expect_response(lambda r: r.url.endswith('/api/inquiries')) as response:
            page.locator('input[type="submit"]').click()
        assert response.value.status == 400
        expect(page.locator('input[name="your-contact"]')).to_have_attribute('aria-invalid', 'true')
        expect(page.locator('.korea-field-error')).to_contain_text('이메일 또는 전화번호')
        expect(page.locator('.korea-field-error')).to_be_in_viewport(ratio=1)
        expect(page.locator('input[name="you-sub"]')).to_have_value(run_id + '-email')
        assert page.locator('.korea-submission-success').count() == 0
        page.screenshot(path=str(output / 'mobile-field-error.png'))
        page.locator('input[name="your-contact"]').fill('qa-consultation@example.test')
        with page.expect_response(lambda r: r.url.endswith('/api/inquiries')) as response:
            page.locator('input[type="submit"]').click()
        assert response.value.status == 201
        data = response.value.json()
        panel = page.locator('.korea-submission-success')
        expect(panel).to_be_visible()
        expect(panel.locator('h2')).to_have_text('상담 신청이 완료되었습니다.')
        expect(panel.locator('h2')).to_be_in_viewport(ratio=1)
        expect(panel).to_be_in_viewport(ratio=1)
        expect(panel.locator('dd')).to_have_text(data['reference'])
        expect(page.locator('form[data-korea-inquiry]')).to_be_hidden()
        expect(page.locator('input[name="your-contact"]')).to_have_value('')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
        page.screenshot(path=str(output / 'mobile-email-success.png'))
        receipts.append({'reference': data['reference'], 'title': run_id + '-email', 'email': 'qa-consultation@example.test', 'phone': '', 'formType': 'CONSULTATION'})
        panel.locator('button.korea-new-inquiry').click()
        expect(page.locator('input[name="your-contact"]')).to_have_value('')
        page.locator('input[name="you-sub"]').fill(run_id + '-phone')
        page.locator('input[name="your-name"]').fill('QA 신청 테스트')
        page.locator('input[name="your-contact"]').fill('010.1234.5678')
        page.locator('input[name="privacyConsent"]').check()
        with page.expect_response(lambda r: r.url.endswith('/api/inquiries')) as response:
            page.locator('input[type="submit"]').click()
        assert response.value.status == 201
        data = response.value.json()
        expect(page.locator('.korea-submission-success')).to_be_visible()
        receipts.append({'reference': data['reference'], 'title': run_id + '-phone', 'email': '', 'phone': '01012345678', 'formType': 'CONSULTATION'})
        desktop = browser.new_context(viewport={'width': 1280, 'height': 900}, locale='ko-KR', extra_http_headers={'X-Forwarded-For': test_ip})
        page = desktop.new_page()
        page.goto(BASE + '/jab/', wait_until='domcontentloaded')
        page.locator('input[name="your-name"]').fill('QA 채용 테스트')
        page.locator('input[name="tel-309"]').fill('010-1234-5678')
        page.locator('input[name="your-email"]').fill('qa-careers@example.test')
        page.locator('input[name="text-712"]').fill('QA 간호사')
        page.locator('input[name="privacyConsent"]').check()
        with page.expect_response(lambda r: r.url.endswith('/api/inquiries')) as response:
            page.locator('input[type="submit"]').click()
        assert response.value.status == 201
        data = response.value.json()
        expect(page.locator('.korea-submission-success h2')).to_have_text('지원이 완료되었습니다.')
        expect(page.locator('.korea-submission-success h2')).to_be_in_viewport(ratio=1)
        expect(page.locator('.korea-submission-success')).to_be_in_viewport(ratio=1)
        page.screenshot(path=str(output / 'desktop-careers-success.png'))
        receipts.append({'reference': data['reference'], 'email': 'qa-careers@example.test', 'phone': '01012345678', 'formType': 'CAREERS'})
        browser.close()
    (output / 'result.json').write_text(json.dumps({'passed': True, 'runId': run_id, 'invalidContactInline': True, 'formHiddenAfterSuccess': True, 'additionalInquiryReset': True, 'receipts': receipts}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'passed': True, 'realBrowserSubmissions': len(receipts), 'invalidContactInline': True}))


if __name__ == '__main__':
    main()
