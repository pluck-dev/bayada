export type InquiryFields = {
  formType: 'CONSULTATION' | 'CAREERS'; title: string; name: string;
  contact: string; contactType: 'EMAIL' | 'PHONE'; phone: string; email: string;
  position: string; message: string;
};
type Invalid = { ok: false; field: 'formType' | 'title' | 'name' | 'contact' | 'email' | 'position'; message: string };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function phoneNumber(input: string) {
  const value = input.normalize('NFKC').replace(/[\s.()\-\u2010-\u2015\u2212]/g, '');
  return /^\+?\d{7,15}$/.test(value) ? value : '';
}

/** The consultation's single contact field accepts email OR phone, as labelled. */
export function validateInquiryFields(input: Record<string, unknown>): { ok: true; data: InquiryFields } | Invalid {
  const value = (key: string, max: number) => typeof input[key] === 'string' ? (input[key] as string).trim().slice(0, max) : '';
  const formType = input.formType === 'CAREERS' ? 'CAREERS' : input.formType === undefined || input.formType === 'CONSULTATION' ? 'CONSULTATION' : null;
  if (!formType) return { ok: false, field: 'formType', message: '신청 유형을 확인해 주세요.' };
  const title = value('title', 200), name = value('name', 80), position = value('position', 200);
  if (!title) return { ok: false, field: 'title', message: '제목을 입력해 주세요.' };
  if (!name) return { ok: false, field: 'name', message: '성함을 입력해 주세요.' };
  const contact = (value('contact', 200) || value('phone', 200)).normalize('NFKC');
  let phone = '', email = value('email', 200);
  if (formType === 'CAREERS') {
    if (!emailPattern.test(email)) return { ok: false, field: 'email', message: '이메일 주소를 확인해 주세요. (예: name@example.com)' };
    if (!position) return { ok: false, field: 'position', message: '지원 분야를 입력해 주세요.' };
    phone = phoneNumber(contact);
    if (!phone) return { ok: false, field: 'contact', message: '연락 가능한 전화번호를 입력해 주세요. (예: 010-1234-5678)' };
  } else if (emailPattern.test(contact)) {
    email = contact;
  } else {
    phone = phoneNumber(contact);
    if (!phone) return { ok: false, field: 'contact', message: '이메일 또는 전화번호를 확인해 주세요. (예: name@example.com, 010-1234-5678)' };
    email = '';
  }
  return { ok: true, data: { formType, title, name, contact, contactType: phone ? 'PHONE' : 'EMAIL', phone, email, position, message: value('message', 5000) } };
}
