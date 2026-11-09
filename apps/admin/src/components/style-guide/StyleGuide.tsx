"use client";

import { useEffect, useState } from "react";
import { Bell, ClipboardCheck, Download, GraduationCap, Plus, Search, Trash2, Users } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  DatePicker,
  DescList,
  Disclosure,
  EmptyState,
  Field,
  FileDrop,
  IconButton,
  Notice,
  NumberInput,
  PageHeader,
  ProgressBar,
  Radio,
  Segmented,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Stat,
  Switch,
  TextLink,
  ToggleChip,
  Tooltip,
  cx,
  inputClass,
  inputSmClass,
  tableClass,
  tableWrap,
  tdClass,
  textareaClass,
  thClass,
  trClass,
} from "@/components/ui";
import { useFeedback } from "@/components/ui/feedback";
import type { Tone } from "@/lib/labels";

const SECTIONS = [
  ["color", "색"],
  ["type", "글자"],
  ["shape", "모서리·간격·그림자"],
  ["button", "버튼"],
  ["badge", "상태 알약"],
  ["input", "입력"],
  ["choice", "선택 컨트롤"],
  ["date", "날짜·파일"],
  ["stat", "지표 카드"],
  ["data", "카드·표"],
  ["feedback", "피드백·상태"],
] as const;

/** 토큰 이름으로 실제 계산된 값을 읽어 보여 준다 (코드에 색 값을 다시 적지 않는다) */
function useTokenValues(names: string[]) {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    setValues(Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(`--color-${n}`).trim()])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return values;
}

function Swatch({ name, value, dark }: { name: string; value?: string; dark?: boolean }) {
  return (
    <div className="min-w-0">
      <div
        className={cx("h-16 rounded-2xl", name === "canvas" && "shadow-[inset_0_0_0_1px_var(--color-line)]")}
        style={{ background: `var(--color-${name})` }}
      />
      <p className={cx("mt-2 truncate text-[12.5px] font-bold", dark && "text-white")}>{name}</p>
      <p className="num truncate text-[11.5px] text-muted">{value || "…"}</p>
    </div>
  );
}

function Section({ id, title, desc, children }: { id: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-12 scroll-mt-6 first:mt-0">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-[22px] font-extrabold tracking-[-0.03em]">{title}</h2>
        {desc && <p className="text-[13px] text-muted">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[132px_minmax(0,1fr)] items-center gap-4 border-b border-hairline py-4 last:border-0">
      <span className="text-[12.5px] font-bold text-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const BRAND = ["brand-50", "brand-100", "brand-200", "brand-300", "brand-400", "brand-500", "brand-600", "brand-700", "brand-800", "brand-900"];
const SURFACES = ["console", "canvas", "wash", "wash-strong", "hairline", "side", "side-raised"];
const TEXT = ["ink", "ink-soft", "muted", "subtle", "disabled"];
const STATUS = ["success", "warning", "info", "danger"];
const PILLS = ["pill-neutral", "pill-success", "pill-warning", "pill-info", "pill-danger", "pill-brand", "kpi-rose", "kpi-sand"];
const TONES: { tone: Tone | "brand" | "ink"; label: string }[] = [
  { tone: "zinc", label: "초안·보관" },
  { tone: "blue", label: "심사 중" },
  { tone: "amber", label: "승인 대기" },
  { tone: "green", label: "게시 중" },
  { tone: "red", label: "반려" },
  { tone: "brand", label: "신규" },
  { tone: "ink", label: "관리자" },
];

export function StyleGuide() {
  const values = useTokenValues([...BRAND, ...SURFACES, ...TEXT, ...STATUS, ...PILLS]);
  const { toast, confirm } = useFeedback();
  const [sel, setSel] = useState("PUBLISHED");
  const [role, setRole] = useState("");
  const [date, setDate] = useState("2026-11-09");
  const [dt, setDt] = useState("2026-11-12T14:30");
  const [seg, setSeg] = useState<"academy" | "web">("academy");
  const [segSm, setSegSm] = useState<"INTERNAL" | "PUBLIC">("INTERNAL");
  const [chk, setChk] = useState(true);
  const [sw, setSw] = useState(true);
  const [radio, setRadio] = useState("a");
  const [chips, setChips] = useState<string[]>(["nurse"]);
  const [slider, setSlider] = useState(70);
  const [num, setNum] = useState(30);

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[180px_minmax(0,1fr)]">
      <nav aria-label="스타일 가이드 목차" className="hidden xl:block">
        <ul className="sticky top-8 flex flex-col gap-0.5">
          {SECTIONS.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="block rounded-full px-3.5 py-2 text-[13px] font-bold text-ink-soft transition-colors hover:bg-canvas hover:text-ink">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0">
        <Section id="color" title="색" desc="토큰은 packages/ui/src/theme.css 하나. 코드에는 이름만 쓴다">
          <Card title="브랜드 레드" description="레드는 현재 위치(메뉴 알약)·핵심 지표·화면당 결정적 행동 1개·선택 표시에만">
            <div className="grid grid-cols-5 gap-3 lg:grid-cols-10">
              {BRAND.map((n) => (
                <Swatch key={n} name={n} value={values[n]} />
              ))}
            </div>
          </Card>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="면" description="콘솔 회색 바탕 → 흰 카드 → 카드 안 wash 입력">
              <div className="grid grid-cols-4 gap-3">
                {SURFACES.map((n) => (
                  <Swatch key={n} name={n} value={values[n]} />
                ))}
              </div>
            </Card>
            <Card title="글자 · 상태" description="muted 이상만 읽는 글자에 쓴다">
              <div className="grid grid-cols-5 gap-3">
                {[...TEXT, ...STATUS].map((n) => (
                  <Swatch key={n} name={n} value={values[n]} />
                ))}
              </div>
            </Card>
          </div>
          <Card className="mt-4" title="알약·지표 채움" description="상태 알약은 옅은 채움 + 진한 상태 글자, 지표 보조 채움은 rose·sand">
            <div className="grid grid-cols-4 gap-3 lg:grid-cols-8">
              {PILLS.map((n) => (
                <Swatch key={n} name={n} value={values[n]} />
              ))}
            </div>
          </Card>
        </Section>

        <Section id="type" title="글자" desc="Pretendard · 한국어 어절 줄바꿈 · 숫자는 고정폭(num)">
          <Card>
            {(
              [
                ["페이지 제목", "text-[30px] font-extrabold tracking-[-0.035em]", "30 / 800 — PageHeader"],
                ["카드 제목", "text-[16px] font-extrabold tracking-[-0.02em]", "16 / 800 — Card title"],
                ["지표 숫자 1,284", "num text-[28px] font-extrabold tracking-[-0.04em]", "28 / 800 — Stat"],
                ["본문 · 표 셀", "text-[13.5px]", "13.5 / 400 — 표·목록"],
                ["라벨 · 버튼", "text-[13px] font-bold", "13 / 700 — Field label, 버튼"],
                ["설명 · 도움말", "text-[12.5px] text-muted", "12.5 / 400 — 힌트·메타"],
                ["표 머리글 · 알약", "text-[12px] font-bold text-muted", "12 / 700 — th, Badge"],
                ["메뉴 묶음 제목", "text-[11px] font-bold text-subtle", "11 / 700 — 사이드바 그룹"],
              ] as const
            ).map(([text, cls, note]) => (
              <div key={note} className="flex items-baseline justify-between gap-6 border-b border-hairline py-3.5 last:border-0">
                <span className={cls}>{text}</span>
                <span className="num shrink-0 text-[12px] text-muted">{note}</span>
              </div>
            ))}
          </Card>
        </Section>

        <Section id="shape" title="모서리·간격·그림자">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card title="모서리">
              <div className="flex flex-wrap items-end gap-3">
                {[
                  ["rounded-xl", "입력 12"],
                  ["rounded-2xl", "패널 18"],
                  ["rounded-[22px]", "카드 22"],
                  ["rounded-[24px]", "대화상자 24"],
                  ["rounded-full", "버튼·알약"],
                ].map(([c, l]) => (
                  <div key={c} className="text-center">
                    <div className={cx("size-14 bg-wash-strong", c)} />
                    <p className="mt-1.5 text-[11.5px] text-muted">{l}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="간격" description="4px 단위 — 카드 안 24, 카드 사이 16, 섹션 사이 28">
              <div className="flex items-end gap-2">
                {[4, 8, 12, 16, 24, 28, 40].map((n) => (
                  <div key={n} className="text-center">
                    <div className="w-6 rounded-md bg-brand-200" style={{ height: n * 1.5 }} />
                    <p className="num mt-1.5 text-[11.5px] text-muted">{n}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="그림자" description="떠 있는 것에만 — 카드는 그림자 없음">
              <div className="flex gap-4 pt-1">
                <div className="flex h-16 flex-1 items-center justify-center rounded-2xl bg-canvas text-[12px] font-bold shadow-float">float</div>
                <div className="flex h-16 flex-1 items-center justify-center rounded-2xl bg-canvas text-[12px] font-bold shadow-pop">pop</div>
              </div>
            </Card>
          </div>
        </Section>

        <Section id="button" title="버튼" desc="알약 모양. primary(잉크)가 기본 주 행동, brand(레드)는 화면당 최대 1개">
          <Card>
            <Row label="종류">
              <Button variant="primary">저장</Button>
              <Button variant="brand">승인 · 게시</Button>
              <Button variant="secondary">취소</Button>
              <Button variant="outline">CSV 내려받기</Button>
              <Button variant="ghost">선택 해제</Button>
              <Button variant="danger">삭제</Button>
            </Row>
            <Row label="크기 lg · md · sm">
              <Button variant="primary" size="lg">
                로그인
              </Button>
              <Button variant="primary">
                <Plus aria-hidden />새 프로그램
              </Button>
              <Button variant="primary" size="sm">
                적용
              </Button>
              <Button variant="secondary" size="sm">
                <Download aria-hidden />
                내려받기
              </Button>
            </Row>
            <Row label="상태">
              <Button variant="primary" loading>
                저장 중…
              </Button>
              <Button variant="primary" disabled>
                비활성
              </Button>
              <Tooltip content="필수 항목을 먼저 채우세요">
                <Button variant="brand" disabled>
                  툴팁 있는 비활성
                </Button>
              </Tooltip>
            </Row>
            <Row label="아이콘 버튼">
              <IconButton label="알림" variant="ghost">
                <Bell aria-hidden />
              </IconButton>
              <IconButton label="검색" variant="secondary">
                <Search aria-hidden />
              </IconButton>
              <IconButton label="추가" variant="outline">
                <Plus aria-hidden />
              </IconButton>
              <IconButton label="삭제" variant="primary" size="sm">
                <Trash2 aria-hidden />
              </IconButton>
              <TextLink href="#button">텍스트 링크</TextLink>
            </Row>
          </Card>
        </Section>

        <Section id="badge" title="상태 알약" desc="상태 뜻은 DESIGN-SYSTEM §6 매핑 그대로 — 색만으로 구분하지 않고 항상 글자와 함께">
          <Card>
            <Row label="기본">
              {TONES.map((t) => (
                <Badge key={t.tone} tone={t.tone}>
                  {t.label}
                </Badge>
              ))}
            </Row>
            <Row label="점 포함">
              {TONES.slice(0, 5).map((t) => (
                <Badge key={t.tone} tone={t.tone} dot>
                  {t.label}
                </Badge>
              ))}
            </Row>
            <Row label="설명 툴팁">
              <Badge tone="amber" tip="운영자가 검토해 게시하기 전 상태입니다">
                승인 대기
              </Badge>
              <span className="text-[12.5px] text-muted">← 마우스를 올려 보세요 (커스텀 툴팁)</span>
            </Row>
          </Card>
        </Section>

        <Section id="input" title="입력" desc="흰 카드 위 wash 채움, 테두리 없음. 포커스 = 흰 바탕 + 잉크 2px">
          <Card>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <Field label="기본" htmlFor="sg-1" hint="도움말은 입력 아래 12.5px">
                <input id="sg-1" className={inputClass} placeholder="프로그램명" />
              </Field>
              <Field label="필수" required htmlFor="sg-2">
                <input id="sg-2" className={inputClass} defaultValue="요양보호사 실기 실습" />
              </Field>
              <Field label="오류" htmlFor="sg-3" error="slug 는 소문자·숫자·하이픈만 씁니다">
                <input id="sg-3" aria-invalid className={inputClass} defaultValue="Dementia Care" />
              </Field>
              <Field label="비활성" htmlFor="sg-4">
                <input id="sg-4" disabled className={inputClass} defaultValue="수정할 수 없음" />
              </Field>
              <Field label="숫자 (−/+ 스테퍼)" htmlFor="sg-5">
                <NumberInput id="sg-5" min={0} max={100} value={num} onChange={(e) => setNum(Number(e.target.value))} unit="분" />
              </Field>
              <Field label="필터용 sm" htmlFor="sg-6">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden />
                  <input id="sg-6" className={cx(inputSmClass, "pl-10")} placeholder="이름·이메일 검색" />
                </div>
              </Field>
              <Field label="여러 줄" htmlFor="sg-7" className="lg:col-span-3">
                <textarea id="sg-7" rows={3} className={textareaClass} placeholder="처리 메모" />
              </Field>
            </div>
          </Card>
        </Section>

        <Section id="choice" title="선택 컨트롤" desc="Select · Segmented · Checkbox · Radio · Switch · 칩 · Slider — name 을 주면 숨은 입력으로 폼에 실린다">
          <Card>
            <Row label="Select md">
              <Select
                className="max-w-[260px]"
                aria-label="상태"
                value={sel}
                onChange={setSel}
                options={[
                  { value: "DRAFT", label: "초안" },
                  { value: "IN_REVIEW", label: "검토 중" },
                  { value: "PUBLISHED", label: "게시 중" },
                  { value: "ARCHIVED", label: "보관", disabled: true },
                ]}
              />
              <Select
                className="max-w-[260px]"
                aria-label="역할"
                placeholder="역할 선택"
                value={role}
                onChange={setRole}
                options={[
                  { value: "ADMIN", label: "Super Admin", group: "시스템 역할" },
                  { value: "CONTENT_MANAGER", label: "콘텐츠 운영자", group: "시스템 역할" },
                  { value: "edu", label: "교육 운영 보조", hint: "권한 2개", group: "사용자 정의 역할" },
                ]}
              />
              <Select className="max-w-[200px]" aria-label="비활성" disabled value="" options={[{ value: "", label: "선택할 수 없음" }]} />
            </Row>
            <Row label="Select sm (필터)">
              <Select size="sm" aria-label="유형" value="" onChange={() => {}} options={[{ value: "", label: "모든 유형" }, { value: "bug", label: "오류" }]} />
            </Row>
            <Row label="Segmented">
              <Segmented
                aria-label="공개범위"
                value={segSm}
                onChange={setSegSm}
                options={[
                  { value: "INTERNAL", label: "사내 전용" },
                  { value: "PUBLIC", label: "외부 공개" },
                ]}
              />
              <div className="w-[232px] rounded-2xl bg-side p-3">
                <Segmented
                  aria-label="관리할 사이트"
                  tone="dark"
                  size="lg"
                  fullWidth
                  value={seg}
                  onChange={setSeg}
                  options={[
                    { value: "academy", label: "아카데미", icon: <GraduationCap aria-hidden /> },
                    { value: "web", label: "웹사이트", icon: <Users aria-hidden /> },
                  ]}
                />
              </div>
            </Row>
            <Row label="Checkbox">
              <Checkbox checked={chk} onChange={setChk} label="메인 큐레이션에 노출" desc="게시 상태일 때만 보입니다." />
              <Checkbox checked={false} label="꺼짐" />
              <Checkbox checked={false} indeterminate label="일부 선택" />
              <Checkbox checked disabled label="비활성" />
            </Row>
            <Row label="Radio">
              {["a", "b", "c"].map((v, i) => (
                <Radio key={v} checked={radio === v} onChange={() => setRadio(v)} label={`보기 ${i + 1}`} />
              ))}
              <Radio checked={false} disabled label="비활성" />
            </Row>
            <Row label="Switch">
              <Switch checked={sw} onChange={setSw} label="홈페이지에 보이기" />
              <Switch checked={false} label="꺼짐" />
              <Switch checked size="sm" label="작게" />
              <Switch checked disabled label="비활성" />
            </Row>
            <Row label="칩 (여러 개)">
              {[
                ["nurse", "간호사"],
                ["caregiver", "요양보호사"],
                ["social", "사회복지사"],
              ].map(([v, l]) => (
                <ToggleChip key={v} on={chips.includes(v)} onToggle={() => setChips((c) => (c.includes(v) ? c.filter((x) => x !== v) : [...c, v]))}>
                  {l}
                </ToggleChip>
              ))}
            </Row>
            <Row label="Slider">
              <Slider className="w-[320px]" aria-label="합격 점수" min={0} max={100} step={5} value={slider} onChange={setSlider} format={(v) => `${v}점`} />
              <span className="num text-[14px] font-extrabold">{slider}점</span>
            </Row>
            <Row label="Disclosure">
              <Disclosure className="w-full max-w-[520px]" summary="요소·스타일 정보">
                <DescList
                  items={[
                    { label: "선택자", value: "main > section:nth-child(2) h2" },
                    { label: "폰트", value: "Pretendard 24px / 700" },
                  ]}
                />
              </Disclosure>
            </Row>
          </Card>
        </Section>

        <Section id="date" title="날짜·파일" desc="한국어 달력(일요일 레드·토요일 파랑, 오늘 점), 일시는 시·분 열. 파일은 끌어다 놓기">
          <Card>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <Field label="날짜">
                <DatePicker value={date} onChange={setDate} aria-label="날짜" />
              </Field>
              <Field label="날짜 · 시간 (KST)">
                <DatePicker mode="datetime" value={dt} onChange={setDt} aria-label="일시" />
              </Field>
              <Field label="비어 있음 · 필터 sm">
                <div className="flex items-center gap-1.5">
                  <DatePicker size="sm" aria-label="시작일" placeholder="시작일" />
                  <span className="text-subtle">~</span>
                  <DatePicker size="sm" aria-label="종료일" placeholder="종료일" />
                </div>
              </Field>
              <Field label="파일" className="lg:col-span-3">
                <FileDrop accept="image/*,.pdf" hint="JPG·PNG·PDF, 최대 5MB" onFile={(f) => toast("info", `${f.name} 선택됨`)} />
              </Field>
            </div>
          </Card>
        </Section>

        <Section id="stat" title="지표 카드" desc="화면의 핵심 지표 1~2개만 brand·ink 로 채운다">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            <Stat tone="brand" label="승인 대기" value="12" unit="개" hint="제출 ~ 게시 대기" icon={<ClipboardCheck />} href="#stat" />
            <Stat tone="ink" label="11월 신규 수강" value="1,284" unit="건" hint="이번 달" />
            <Stat label="11월 수료" value="342" unit="명" hint="이번 달" />
            <Stat tone="rose" label="미처리 신고" value="3" hint="게시 중 · 신고" />
            <Stat tone="sand" label="다가오는 실습" value="5" hint="14일 안" />
          </div>
        </Section>

        <Section id="data" title="카드·표">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className={tableWrap}>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>프로그램</th>
                    <th className={thClass}>상태</th>
                    <th className={cx(thClass, "text-right")}>수강생</th>
                    <th className={thClass}>수정일</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["치매 어르신 행동 이해", "green", "게시 중", 1284, "26. 11. 2."],
                    ["낙상 예방 실기", "amber", "승인 대기", 0, "26. 11. 8."],
                    ["임종 돌봄 기초", "blue", "임상 검토", 0, "26. 11. 9."],
                  ].map(([t, tone, l, n, d]) => (
                    <tr key={t as string} className={trClass}>
                      <td className={cx(tdClass, "font-bold")}>{t}</td>
                      <td className={tdClass}>
                        <Badge tone={tone as Tone} dot>
                          {l}
                        </Badge>
                      </td>
                      <td className={cx(tdClass, "num text-right")}>{(n as number).toLocaleString()}</td>
                      <td className={cx(tdClass, "num text-subtle")}>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Card title="카드 제목" description="설명 한 줄" actions={<TextLink href="#data">전체 보기</TextLink>}>
              <DescList
                items={[
                  { label: "접수번호", value: "WC-20261109-003" },
                  { label: "담당자", value: "김바야다" },
                  { label: "상태", value: <Badge tone="blue">상담 중</Badge> },
                ]}
              />
            </Card>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card padded={false}>
              <EmptyState title="조건에 맞는 프로그램이 없습니다" description="검색어나 필터를 바꿔 보세요." action={<Button variant="secondary">필터 초기화</Button>} />
            </Card>
            <Card title="불러오는 중 (스켈레톤)">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex items-center gap-2 pt-1 text-[12.5px] text-muted">
                  <Spinner /> 데이터를 불러오는 중
                </div>
              </div>
            </Card>
          </div>
        </Section>

        <Section id="feedback" title="피드백·상태" desc="토스트·확인 대화상자·툴팁·검증 말풍선 — 브라우저 기본 대화상자 대신">
          <Card>
            <Row label="토스트">
              <Button variant="secondary" onClick={() => toast("success", "저장했습니다.")}>
                성공
              </Button>
              <Button variant="secondary" onClick={() => toast("error", "권한이 없습니다.")}>
                오류
              </Button>
              <Button variant="secondary" onClick={() => toast("info", "웹사이트 재생성을 요청했습니다.")}>
                안내
              </Button>
            </Row>
            <Row label="확인 대화상자">
              <Button
                variant="secondary"
                onClick={async () => toast("info", (await confirm({ title: "외부에 공개할까요?", body: "게시 상태인 프로그램은 외부 학습자에게도 노출됩니다.", confirmLabel: "외부 공개" })) ? "확인" : "취소")}
              >
                기본
              </Button>
              <Button
                variant="danger"
                onClick={async () =>
                  toast("info", (await confirm({ title: "이 역할을 삭제할까요?", body: "되돌릴 수 없습니다.", confirmLabel: "삭제", danger: true })) ? "삭제 확인" : "취소")
                }
              >
                위험
              </Button>
            </Row>
            <Row label="안내 띠">
              <div className="grid w-full gap-2">
                <Notice>기본 안내 — WEB_PUBLIC_URL 환경변수가 없어 위치 보기를 만들 수 없습니다.</Notice>
                <Notice tone="warning">저장하지 않은 변경 사항이 있습니다.</Notice>
                <Notice tone="danger">반려 사유를 입력해야 합니다.</Notice>
                <Notice tone="success">수료증 34장을 발급했습니다.</Notice>
              </div>
            </Row>
            <Row label="진행 막대">
              <ProgressBar className="w-full max-w-[420px]" value={72} showValue label="처리율 · 50건 중 36건" />
              <ProgressBar className="w-[160px]" size="sm" value={100} />
            </Row>
            <Row label="검증 말풍선">
              <form
                className="flex flex-wrap items-end gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast("success", "검증 통과");
                }}
              >
                <input required aria-label="이름" placeholder="비우고 제출" className={cx(inputClass, "w-[200px]")} />
                <Select required aria-label="카테고리" className="w-[200px]" placeholder="카테고리" options={[{ value: "a", label: "치매 케어" }]} />
                <Button type="submit" variant="primary">
                  제출
                </Button>
              </form>
            </Row>
          </Card>
        </Section>
      </div>
    </div>
  );
}
