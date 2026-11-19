"use client";
import { useState } from 'react';
import type { InquirySettings } from '@bayada/korea';
import { saveKoreaInquirySettings } from '@/lib/actions/korea';
import { Card, Switch, Field, inputClass } from '@/components/ui';
import { useAction } from '@/components/ui/feedback';
import { KoreaSaveBar, useKoreaDraft } from "./KoreaEditorTools";
export function KoreaSettingsEditor({ initial, updatedAt, delivery }: { initial: InquirySettings; updatedAt: string | null; delivery: string }) {
  const [consultation, setConsultation] = useState(initial.consultationRecipients.join(', ')), [careers, setCareers] = useState(initial.careersRecipients.join(', ')), [enabled, setEnabled] = useState(initial.enabled);
  const { run, isPending } = useAction(); const list = (x: string) => x.split(/[;,\s]+/).filter(Boolean);
  const dirty=Number(enabled!==initial.enabled)+Number(consultation!==initial.consultationRecipients.join(', '))+Number(careers!==initial.careersRecipients.join(', ')); useKoreaDraft(!!dirty);
  return <Card title="접수·알림 설정"><form className="space-y-4" onSubmit={e => { e.preventDefault(); run(() => saveKoreaInquirySettings({ enabled, consultationRecipients: list(consultation), careersRecipients: list(careers) }, updatedAt)); }}><Switch label="상담·채용 접수 받기" checked={enabled} onChange={setEnabled} /><Field label="상담 알림 받는 이메일 (쉼표로 구분)"><input className={inputClass} value={consultation} onChange={e => setConsultation(e.target.value)} /></Field><Field label="채용 알림 받는 이메일 (쉼표로 구분)"><input className={inputClass} value={careers} onChange={e => setCareers(e.target.value)} /></Field><p className="text-sm text-muted">메일 전송: {delivery}. 수신 주소가 비어 있으면 관리자에만 접수됩니다.</p><KoreaSaveBar dirty={dirty} pending={isPending} updatedAt={updatedAt} label="설정 저장" /></form></Card>;
}
