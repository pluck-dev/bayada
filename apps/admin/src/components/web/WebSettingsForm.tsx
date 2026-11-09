"use client";

import { useEffect, useState } from "react";
import { WEB_SNS_KEYS, WEB_SNS_LABEL, type WebSettingKey, type WebSettings } from "@bayada/shared/web-content";
import { resetWebSetting, saveWebSetting } from "@/lib/actions/web-settings";
import { formatDateTime } from "@/lib/labels";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

/** 섹션 하나 — 편집 상태, 저장(동시 수정 검사), 기본값으로 */
function useSection<K extends WebSettingKey>(key: K, initial: WebSettings[K], savedAt: string | null) {
  const { run, isPending } = useAction();
  const [v, setV] = useState<WebSettings[K]>(initial);
  const sig = JSON.stringify(initial);
  useEffect(() => setV(JSON.parse(sig) as WebSettings[K]), [sig]);
  const dirty = JSON.stringify(v) !== sig;

  const footer = (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
      <p className="text-caption text-muted">
        {dirty ? <span className="text-warning">저장하지 않은 변경이 있습니다</span> : savedAt ? `마지막 저장 ${formatDateTime(savedAt)}` : "기본값 사용 중"}
      </p>
      <div className="flex gap-2">
        {dirty && (
          <Button size="sm" variant="ghost" disabled={isPending} onClick={() => setV(JSON.parse(sig) as WebSettings[K])}>
            취소
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          disabled={isPending || !savedAt}
          onClick={() =>
            run(() => resetWebSetting(key), {
              confirm: { title: "기본값으로 되돌릴까요?", body: "저장된 값을 지우고 처음 값으로 돌아갑니다.", confirmLabel: "되돌리기", danger: true },
            })
          }
        >
          기본값으로
        </Button>
        <Button size="sm" variant="primary" disabled={isPending || !dirty} onClick={() => run(() => saveWebSetting(key, v, savedAt))}>
          저장
        </Button>
      </div>
    </div>
  );
  return { v, setV, isPending, footer };
}

export function WebSettingsForm({ settings, savedAt }: { settings: WebSettings; savedAt: Record<string, string> }) {
  return (
    <div className="flex max-w-[820px] flex-col gap-5">
      <SiteSection initial={settings["web.site"]} savedAt={savedAt["web.site"] ?? null} />
      <InquirySection initial={settings["web.inquiry"]} savedAt={savedAt["web.inquiry"] ?? null} />
    </div>
  );
}

type Site = WebSettings["web.site"];
const TEXT_FIELDS: { key: Exclude<keyof Site, "sns">; label: string; hint?: string; wide?: boolean }[] = [
  { key: "legalName", label: "상호" },
  { key: "ceo", label: "대표" },
  { key: "businessRegistrationNo", label: "사업자등록번호" },
  { key: "serviceHotline", label: "대표 전화", hint: "푸터·문의 페이지 전화 문의" },
  { key: "headquarters", label: "푸터 주소", wide: true },
  { key: "email", label: "푸터 이메일" },
  { key: "contactEmail", label: "문의 페이지 이메일", hint: "'이메일 문의' 카드" },
  { key: "contactHours", label: "전화 운영 시간" },
  { key: "officeName", label: "오시는 길 — 이름" },
  { key: "officeAddress", label: "오시는 길 — 주소", wide: true },
  { key: "footerNote", label: "푸터 작은 글씨", hint: "SNS 아이콘 아래" },
  { key: "copyright", label: "저작권 문구", hint: "© 연도 뒤에 붙습니다" },
];

function SiteSection({ initial, savedAt }: { initial: Site; savedAt: string | null }) {
  const { v, setV, isPending, footer } = useSection("web.site", initial, savedAt);
  return (
    <Card title="회사·연락처 정보 (푸터·문의 페이지)">
      <fieldset disabled={isPending} className="grid grid-cols-2 gap-4">
        {TEXT_FIELDS.map((f) => (
          <Field key={f.key} label={f.label} hint={f.hint} htmlFor={`ws-${f.key}`} className={f.wide ? "col-span-2" : undefined}>
            <input id={`ws-${f.key}`} className={inputClass} value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
          </Field>
        ))}
        <p className="col-span-2 mt-2 text-caption font-medium text-ink">SNS 링크 — 비우거나 # 이면 아이콘만 보이고 이동하지 않습니다</p>
        {WEB_SNS_KEYS.map((k) => (
          <Field key={k} label={WEB_SNS_LABEL[k]} htmlFor={`ws-sns-${k}`}>
            <input
              id={`ws-sns-${k}`}
              className={inputClass}
              placeholder="https://"
              value={v.sns[k] === "#" ? "" : v.sns[k]}
              onChange={(e) => setV({ ...v, sns: { ...v.sns, [k]: e.target.value.trim() || "#" } })}
            />
          </Field>
        ))}
      </fieldset>
      {footer}
    </Card>
  );
}

function InquirySection({ initial, savedAt }: { initial: WebSettings["web.inquiry"]; savedAt: string | null }) {
  const { v, setV, isPending, footer } = useSection("web.inquiry", initial, savedAt);
  return (
    <Card title="문의 알림 메일">
      <fieldset disabled={isPending}>
        <Field
          label="새 문의 알림 받을 주소"
          htmlFor="wi-notify"
          hint="쉼표로 여러 개. 비우면 알림을 보내지 않습니다. 발송은 서버의 SMTP_URL 설정을 씁니다."
        >
          <input id="wi-notify" className={inputClass} placeholder="cs@bayadakorea.com, sales@bayadakorea.com" value={v.notifyEmails} onChange={(e) => setV({ notifyEmails: e.target.value })} />
        </Field>
      </fieldset>
      {footer}
    </Card>
  );
}
