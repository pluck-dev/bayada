"use client";
import { useState } from 'react';
import type { InquirySettings } from '@bayada/korea';
import { saveKoreaInquirySettings } from '@/lib/actions/korea';
import { Card, Button, Field, inputClass } from '@/components/ui';
import { useAction } from '@/components/ui/feedback';
export function KoreaSettingsEditor({ initial, updatedAt, delivery }: { initial: InquirySettings; updatedAt: string | null; delivery: string }) {
  const [consultation, setConsultation] = useState(initial.consultationRecipients.join(', ')), [careers, setCareers] = useState(initial.careersRecipients.join(', ')), [enabled, setEnabled] = useState(initial.enabled);
  const { run, isPending } = useAction(); const list = (x: string) => x.split(/[;,\s]+/).filter(Boolean);
  return <Card title="접수·알림 설정"><form className="space-y-4" onSubmit={e => { e.preventDefault(); run(() => saveKoreaInquirySettings({ enabled, consultationRecipients: list(consultation), careersRecipients: list(careers) }, updatedAt)); }}><label><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} /> 상담·채용 접수 받기</label><Field label="상담 알림 받는 이메일 (쉼표로 구분)"><input className={inputClass} value={consultation} onChange={e => setConsultation(e.target.value)} /></Field><Field label="채용 알림 받는 이메일 (쉼표로 구분)"><input className={inputClass} value={careers} onChange={e => setCareers(e.target.value)} /></Field><p className="text-sm text-muted">메일 전송: {delivery}. 수신 주소가 비어 있으면 관리자에만 접수됩니다.</p><Button type="submit" variant="primary" disabled={isPending}>설정 저장</Button></form></Card>;
}
