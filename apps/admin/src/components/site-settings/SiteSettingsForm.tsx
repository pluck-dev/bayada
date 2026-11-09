"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import {
  HOME_SECTION_LABEL,
  SITE_SETTING_DEFAULTS,
  type HomeSectionKey,
  type SiteSettingKey,
  type SiteSettings,
} from "@bayada/shared/site-settings";
import { resetSiteSetting, saveSiteSetting } from "@/lib/actions/site-settings";
import { formatDateTime } from "@/lib/labels";
import { Badge, Button, Card, Field, cx, inputClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

const NAV: { key: SiteSettingKey; label: string }[] = [
  { key: "home.hero", label: "홈 히어로" },
  { key: "home.sections", label: "홈 섹션 표시·순서" },
  { key: "faq", label: "자주 묻는 질문" },
  { key: "footer", label: "푸터" },
  { key: "inquiry", label: "기관 도입 문의" },
  { key: "seo", label: "SEO 기본값" },
];

const anchor = (key: string) => `ss-${key.replace(".", "-")}`;

function move<T>(list: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** 섹션 하나의 편집 상태 + 저장·기본값 되돌리기 */
function useSection<K extends SiteSettingKey>(key: K, initial: SiteSettings[K], savedAt: string | null) {
  const { run, isPending } = useAction();
  const [v, setV] = useState<SiteSettings[K]>(initial);
  const [justSaved, setJustSaved] = useState(false);
  const sig = JSON.stringify(initial);
  // 저장 후 서버 값으로 다시 맞춘다
  useEffect(() => setV(JSON.parse(sig) as SiteSettings[K]), [sig]);
  const dirty = JSON.stringify(v) !== sig;
  const isDefault = savedAt === null;

  const save = () =>
    run(() => saveSiteSetting(key, v, savedAt), {
      onSuccess: (r) => r.ok && setJustSaved(true),
    });
  const reset = () =>
    run(() => resetSiteSetting(key), {
      confirm: {
        title: "기본값으로 되돌릴까요?",
        body: "저장된 값을 지우고 처음 문구로 돌아갑니다. 아카데미에 바로 반영됩니다.",
        confirmLabel: "되돌리기",
        danger: true,
      },
      onSuccess: (r) => r.ok && setJustSaved(true),
    });

  const footer = (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
      <p className="text-caption text-muted">
        {justSaved && !dirty ? (
          <Badge tone="green" dot>
            아카데미에 반영됨
          </Badge>
        ) : dirty ? (
          <span className="text-warning">저장하지 않은 변경이 있습니다</span>
        ) : isDefault ? (
          "기본값 사용 중"
        ) : (
          `마지막 저장 ${formatDateTime(savedAt)}`
        )}
      </p>
      <div className="flex gap-2">
        {dirty && (
          <Button size="sm" variant="ghost" disabled={isPending} onClick={() => setV(JSON.parse(sig) as SiteSettings[K])}>
            취소
          </Button>
        )}
        <Button size="sm" variant="secondary" disabled={isPending || isDefault} onClick={reset}>
          기본값으로
        </Button>
        <Button size="sm" variant="primary" disabled={isPending || !dirty} onClick={save}>
          저장
        </Button>
      </div>
    </div>
  );

  return { v, setV, isPending, footer, dirty };
}

type Props = { settings: SiteSettings; savedAt: Record<string, string>; academyUrl: string };

export function SiteSettingsForm({ settings, savedAt, academyUrl }: Props) {
  const at = (k: SiteSettingKey) => savedAt[k] ?? null;
  return (
    <div className="grid grid-cols-[180px_minmax(0,1fr)] items-start gap-6">
      <nav data-tour="settings-nav" aria-label="설정 섹션" className="sticky top-0 flex flex-col gap-0.5 text-caption">
        {NAV.map((n) => (
          <a key={n.key} href={`#${anchor(n.key)}`} className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-muted hover:bg-surface-sunken hover:text-ink">
            {n.label}
            {savedAt[n.key] && <span className="h-1.5 w-1.5 rounded-full bg-brand" data-tip="기본값에서 바뀜" aria-label="변경됨" />}
          </a>
        ))}
        <a href={academyUrl} target="_blank" rel="noopener noreferrer" className="mt-3 px-2.5 text-caption text-muted underline-offset-2 hover:text-ink transition-colors hover:text-brand">
          아카데미에서 보기 ↗
        </a>
      </nav>
      <div className="flex max-w-[820px] flex-col gap-5">
        <HeroSection initial={settings["home.hero"]} savedAt={at("home.hero")} />
        <SectionsSection initial={settings["home.sections"]} savedAt={at("home.sections")} />
        <FaqSection initial={settings.faq} savedAt={at("faq")} />
        <FooterSection initial={settings.footer} savedAt={at("footer")} />
        <InquirySection initial={settings.inquiry} savedAt={at("inquiry")} />
        <SeoSection initial={settings.seo} savedAt={at("seo")} />
      </div>
    </div>
  );
}

const LINK_HINT = "/courses 처럼 / 로 시작하면 아카데미 안 경로, #org 는 홈 안 위치, 외부는 https://";

function HeroSection({ initial, savedAt }: { initial: SiteSettings["home.hero"]; savedAt: string | null }) {
  const { v, setV, isPending, footer } = useSection("home.hero", initial, savedAt);
  const set = <F extends keyof typeof v>(f: F, val: (typeof v)[F]) => setV({ ...v, [f]: val });
  return (
    <section data-tour="settings-sections" id={anchor("home.hero")} className="scroll-mt-4">
      <Card title="홈 히어로">
        <fieldset disabled={isPending} className="grid grid-cols-2 gap-4">
          <Field label="상단 라벨" htmlFor="hero-eyebrow" className="col-span-2">
            <input id="hero-eyebrow" className={inputClass} maxLength={80} value={v.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
          </Field>
          <Field label="제목" htmlFor="hero-title" className="col-span-2" hint="줄을 바꾸면 화면에서도 줄이 바뀝니다. 120자 이내.">
            <textarea id="hero-title" rows={2} maxLength={120} className={cx(textareaClass, "text-body font-semibold")} value={v.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="부제" htmlFor="hero-subtitle" className="col-span-2">
            <textarea id="hero-subtitle" rows={2} maxLength={300} className={textareaClass} value={v.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          </Field>
          <Field label="주 버튼 문구" htmlFor="hero-cta1-label" hint="비우면 버튼을 숨깁니다.">
            <input id="hero-cta1-label" className={inputClass} maxLength={40} value={v.primaryCta.label} onChange={(e) => set("primaryCta", { ...v.primaryCta, label: e.target.value })} />
          </Field>
          <Field label="주 버튼 링크" htmlFor="hero-cta1-href" hint={LINK_HINT}>
            <input id="hero-cta1-href" className={cx(inputClass, "font-mono text-caption")} value={v.primaryCta.href} onChange={(e) => set("primaryCta", { ...v.primaryCta, href: e.target.value })} />
          </Field>
          <Field label="보조 버튼 문구" htmlFor="hero-cta2-label">
            <input id="hero-cta2-label" className={inputClass} maxLength={40} value={v.secondaryCta.label} onChange={(e) => set("secondaryCta", { ...v.secondaryCta, label: e.target.value })} />
          </Field>
          <Field label="보조 버튼 링크" htmlFor="hero-cta2-href">
            <input id="hero-cta2-href" className={cx(inputClass, "font-mono text-caption")} value={v.secondaryCta.href} onChange={(e) => set("secondaryCta", { ...v.secondaryCta, href: e.target.value })} />
          </Field>
        </fieldset>
        {footer}
      </Card>
    </section>
  );
}

function SectionsSection({ initial, savedAt }: { initial: SiteSettings["home.sections"]; savedAt: string | null }) {
  const { v, setV, isPending, footer } = useSection("home.sections", initial, savedAt);
  const toggle = (k: HomeSectionKey) =>
    setV({ ...v, hidden: v.hidden.includes(k) ? v.hidden.filter((x) => x !== k) : [...v.hidden, k] });
  return (
    <section id={anchor("home.sections")} className="scroll-mt-4">
      <Card title="홈 섹션 표시·순서">
        <p className="mb-3 text-caption text-muted">
          히어로 아래 섹션 순서입니다. 데이터가 없는 섹션(게시된 패스웨이 0건, 파트너 로고 없음 등)은 켜 두어도 보이지 않습니다. 업셀·FAQ 를 끄면 상단 메뉴의 바로가기도 숨겨집니다.
        </p>
        <ol className="divide-y divide-hairline rounded-2xl bg-wash px-1">
          {v.order.map((k, i) => {
            const off = v.hidden.includes(k);
            return (
              <li key={k} className={cx("flex items-center gap-3 px-3 py-2", off && "bg-surface")}>
                <span className="tabular w-5 text-caption text-subtle">{i + 1}</span>
                <span className={cx("flex-1 text-caption", off ? "text-muted line-through" : "font-medium text-ink")}>{HOME_SECTION_LABEL[k]}</span>
                <Button size="sm" variant="ghost" disabled={isPending} onClick={() => toggle(k)} aria-label={`${HOME_SECTION_LABEL[k]} ${off ? "표시" : "숨김"}`}>
                  {off ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {off ? "숨김" : "표시"}
                </Button>
                <Button size="sm" variant="ghost" disabled={isPending || i === 0} onClick={() => setV({ ...v, order: move(v.order, i, -1) })} aria-label={`${HOME_SECTION_LABEL[k]} 위로`}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" disabled={isPending || i === v.order.length - 1} onClick={() => setV({ ...v, order: move(v.order, i, 1) })} aria-label={`${HOME_SECTION_LABEL[k]} 아래로`}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </li>
            );
          })}
        </ol>
        {footer}
      </Card>
    </section>
  );
}

function FaqSection({ initial, savedAt }: { initial: SiteSettings["faq"]; savedAt: string | null }) {
  const { v, setV, isPending, footer } = useSection("faq", initial, savedAt);
  const setItem = (i: number, patch: Partial<{ q: string; a: string }>) =>
    setV({ ...v, items: v.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  return (
    <section id={anchor("faq")} className="scroll-mt-4">
      <Card title="자주 묻는 질문">
        <fieldset disabled={isPending} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="섹션 제목" htmlFor="faq-title">
              <input id="faq-title" className={inputClass} maxLength={60} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
            </Field>
            <Field label="섹션 설명" htmlFor="faq-subtitle">
              <input id="faq-subtitle" className={inputClass} maxLength={200} value={v.subtitle} onChange={(e) => setV({ ...v, subtitle: e.target.value })} />
            </Field>
          </div>
          <ol className="flex flex-col gap-3">
            {v.items.map((it, i) => (
              <li key={i} className="panel-inset rounded-2xl p-4">
                <div className="mb-2 flex items-center gap-1">
                  <span className="tabular flex-1 text-caption font-medium text-muted">질문 {i + 1}</span>
                  <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => setV({ ...v, items: move(v.items, i, -1) })} aria-label={`질문 ${i + 1} 위로`}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" disabled={i === v.items.length - 1} onClick={() => setV({ ...v, items: move(v.items, i, 1) })} aria-label={`질문 ${i + 1} 아래로`}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setV({ ...v, items: v.items.filter((_, j) => j !== i) })} aria-label={`질문 ${i + 1} 삭제`}>
                    <Trash2 className="h-3.5 w-3.5 text-danger" />
                  </Button>
                </div>
                <input className={cx(inputClass, "font-medium")} placeholder="질문" maxLength={200} value={it.q} onChange={(e) => setItem(i, { q: e.target.value })} aria-label={`질문 ${i + 1}`} />
                <textarea className={cx(textareaClass, "mt-2")} rows={3} placeholder="답변" maxLength={2000} value={it.a} onChange={(e) => setItem(i, { a: e.target.value })} aria-label={`답변 ${i + 1}`} />
              </li>
            ))}
          </ol>
          <div>
            <Button size="sm" onClick={() => setV({ ...v, items: [...v.items, { q: "", a: "" }] })} disabled={v.items.length >= 50}>
              <Plus className="h-3.5 w-3.5" /> 질문 추가
            </Button>
            {v.items.length === 0 && <span className="ml-3 text-caption text-warning">질문이 없으면 홈 FAQ 섹션과 바로가기가 숨겨집니다.</span>}
          </div>
        </fieldset>
        {footer}
      </Card>
    </section>
  );
}

function FooterSection({ initial, savedAt }: { initial: SiteSettings["footer"]; savedAt: string | null }) {
  const { v, setV, isPending, footer } = useSection("footer", initial, savedAt);
  const set = <F extends keyof typeof v>(f: F, val: (typeof v)[F]) => setV({ ...v, [f]: val });
  return (
    <section id={anchor("footer")} className="scroll-mt-4">
      <Card title="푸터">
        <fieldset disabled={isPending} className="grid grid-cols-2 gap-4">
          <Field label="소개 문구" htmlFor="ft-tagline" className="col-span-2">
            <input id="ft-tagline" className={inputClass} maxLength={200} value={v.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="회사 정보" htmlFor="ft-company" className="col-span-2" hint="상호·대표자·주소 등. 줄마다 한 줄로 표시됩니다. 비우면 숨김.">
            <textarea id="ft-company" rows={3} maxLength={500} className={textareaClass} placeholder={"(주)바야다홈헬스케어 · 대표 OOO\n서울특별시 …"} value={v.companyInfo} onChange={(e) => set("companyInfo", e.target.value)} />
          </Field>
          <Field label="사업자 정보 한 줄" htmlFor="ft-biz" className="col-span-2" hint="사업자등록번호·통신판매업 신고번호 등">
            <input id="ft-biz" className={inputClass} maxLength={300} placeholder="사업자등록번호 000-00-00000 · 통신판매업 신고 제0000-서울-0000호" value={v.businessLine} onChange={(e) => set("businessLine", e.target.value)} />
          </Field>
          <Field label="운영 문의 메일" htmlFor="ft-email">
            <input id="ft-email" type="email" className={inputClass} maxLength={120} value={v.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
          </Field>
          <Field label="운영 문의 전화" htmlFor="ft-phone">
            <input id="ft-phone" className={cx(inputClass, "tabular")} maxLength={40} placeholder="02-000-0000" value={v.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
          </Field>
          <Field label="저작권 문구" htmlFor="ft-copy" className="col-span-2" hint="© 연도 뒤에 붙습니다.">
            <input id="ft-copy" className={inputClass} maxLength={120} value={v.copyright} onChange={(e) => set("copyright", e.target.value)} />
          </Field>
          <div className="col-span-2 flex flex-col gap-2">
            <span className="text-caption font-medium text-ink-soft">SNS 링크</span>
            {v.sns.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input className={cx(inputClass, "w-40")} placeholder="이름 (예: 인스타그램)" maxLength={30} value={s.label} onChange={(e) => set("sns", v.sns.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} aria-label={`SNS ${i + 1} 이름`} />
                <input className={cx(inputClass, "font-mono text-caption")} placeholder="https://" value={s.url} onChange={(e) => set("sns", v.sns.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} aria-label={`SNS ${i + 1} 주소`} />
                <Button size="sm" variant="ghost" className="h-8" onClick={() => set("sns", v.sns.filter((_, j) => j !== i))} aria-label={`SNS ${i + 1} 삭제`}>
                  <Trash2 className="h-3.5 w-3.5 text-danger" />
                </Button>
              </div>
            ))}
            <div>
              <Button size="sm" onClick={() => set("sns", [...v.sns, { label: "", url: "" }])} disabled={v.sns.length >= 10}>
                <Plus className="h-3.5 w-3.5" /> SNS 추가
              </Button>
            </div>
          </div>
        </fieldset>
        {footer}
      </Card>
    </section>
  );
}

function InquirySection({ initial, savedAt }: { initial: SiteSettings["inquiry"]; savedAt: string | null }) {
  const { v, setV, isPending, footer } = useSection("inquiry", initial, savedAt);
  return (
    <section id={anchor("inquiry")} className="scroll-mt-4">
      <Card title="기관 도입 문의">
        <p className="mb-3 text-caption text-muted">홈 업셀·히어로의 ‘기관 도입 문의’, 푸터 고객센터, 기관 대시보드 안내에서 쓰는 연결 주소입니다.</p>
        <fieldset disabled={isPending} className="grid grid-cols-2 gap-4">
          <Field label="문의 메일" htmlFor="iq-email">
            <input id="iq-email" type="email" className={inputClass} maxLength={120} value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
          </Field>
          <Field label="메일 제목" htmlFor="iq-subject">
            <input id="iq-subject" className={inputClass} maxLength={120} value={v.subject} onChange={(e) => setV({ ...v, subject: e.target.value })} />
          </Field>
          <Field label="별도 문의 링크" htmlFor="iq-url" className="col-span-2" hint="문의 폼 등 링크가 있으면 메일 대신 이 주소로 연결합니다. 비우면 메일.">
            <input id="iq-url" className={cx(inputClass, "font-mono text-caption")} placeholder="https://" value={v.url} onChange={(e) => setV({ ...v, url: e.target.value })} />
          </Field>
        </fieldset>
        {footer}
      </Card>
    </section>
  );
}

function SeoSection({ initial, savedAt }: { initial: SiteSettings["seo"]; savedAt: string | null }) {
  const { v, setV, isPending, footer } = useSection("seo", initial, savedAt);
  const d = SITE_SETTING_DEFAULTS.seo;
  return (
    <section id={anchor("seo")} className="scroll-mt-4">
      <Card title="SEO 기본값">
        <fieldset disabled={isPending} className="grid grid-cols-2 gap-4">
          <Field label="사이트 이름" htmlFor="seo-name" hint="각 페이지 제목 뒤에 ‘| 사이트 이름’으로 붙습니다.">
            <input id="seo-name" className={inputClass} maxLength={60} placeholder={d.siteName} value={v.siteName} onChange={(e) => setV({ ...v, siteName: e.target.value })} />
          </Field>
          <Field label="기본 제목" htmlFor="seo-title" hint="홈·공유 카드 제목">
            <input id="seo-title" className={inputClass} maxLength={120} placeholder={d.title} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
          </Field>
          <Field label="설명" htmlFor="seo-desc" className="col-span-2" hint={`검색 결과·공유 카드 설명 · ${v.description.length}/300자`}>
            <textarea id="seo-desc" rows={2} maxLength={300} className={textareaClass} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
          </Field>
          <Field label="OG 이미지 URL" htmlFor="seo-og" className="col-span-2" hint="1200×630 권장. 비우면 자동 생성 이미지를 씁니다.">
            <input id="seo-og" className={cx(inputClass, "font-mono text-caption")} placeholder="https://…/og.png" value={v.ogImageUrl} onChange={(e) => setV({ ...v, ogImageUrl: e.target.value })} />
          </Field>
          {/^https?:\/\//i.test(v.ogImageUrl) && (
            // 운영자가 입력한 원격 이미지 미리보기
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.ogImageUrl} alt="OG 이미지 미리보기" className="col-span-2 aspect-[1200/630] w-full max-w-[360px] rounded-2xl object-cover" />
          )}
        </fieldset>
        {footer}
      </Card>
    </section>
  );
}
