import assert from 'node:assert/strict';
import test from 'node:test';
import { validateInquiryFields } from '../src/inquiry';
const consultation = { title: '서비스 상담', name: '신청자', privacyConsent: true };

test('the consultation contact labelled email or phone accepts either and keeps their meaning', () => {
  const email = validateInquiryFields({ ...consultation, contact: 'applicant@example.test' });
  assert.ok(email.ok); assert.equal(email.data.email, 'applicant@example.test'); assert.equal(email.data.phone, ''); assert.equal(email.data.contactType, 'EMAIL');
  for (const phone of ['01012345678', '010-1234-5678', '010.1234.5678', '０１０－１２３４－５６７８', '010–1234–5678']) {
    const result = validateInquiryFields({ ...consultation, contact: phone });
    assert.ok(result.ok, phone); assert.equal(result.data.phone, '01012345678'); assert.equal(result.data.contactType, 'PHONE');
  }
  const cachedClient = validateInquiryFields({ ...consultation, phone: 'applicant@example.test' });
  assert.ok(cachedClient.ok); assert.equal(cachedClient.data.email, 'applicant@example.test');
});

test('invalid contacts and missing fields report the actual field without discarding entered data', () => {
  for (const contact of ['', '1234', 'not-an-email', '010hello12345678', 'name@example']) {
    const result = validateInquiryFields({ ...consultation, contact });
    assert.ok(!result.ok); assert.equal(result.field, 'contact'); assert.match(result.message, /이메일 또는 전화번호/);
  }
  assert.deepEqual(validateInquiryFields({ ...consultation, title: '', contact: '01012345678' }), { ok: false, field: 'title', message: '제목을 입력해 주세요.' });
});

test('careers still has separate phone, email and position fields and an optional message', () => {
  const data = { ...consultation, formType: 'CAREERS', contact: '010-1234-5678', email: 'applicant@example.test', position: '간호사' };
  const result = validateInquiryFields(data); assert.ok(result.ok); assert.equal(result.data.phone, '01012345678'); assert.equal(result.data.message, '');
  const bad = validateInquiryFields({ ...data, contact: 'applicant@example.test' }); assert.ok(!bad.ok); assert.equal(bad.field, 'contact');
  const missingEmail = validateInquiryFields({ ...data, email: '' }); assert.ok(!missingEmail.ok); assert.equal(missingEmail.field, 'email');
});
