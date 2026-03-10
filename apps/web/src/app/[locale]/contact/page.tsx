"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/layout/Container";
import { NeedsReview } from "@/components/shared/NeedsReview";

// ── 상수 ──────────────────────────────────────────────────────────────────────

const PHONE = "1670-1379";
const EMAIL = "info@bayada.co.kr";

const SERVICES = [
  { id: "home-health", label: "Home Health (방문간호)" },
  { id: "companion-care", label: "Companion Care (동행 돌봄)" },
  { id: "personal-care", label: "Personal Care (일상생활 지원)" },
  { id: "private-duty-nursing", label: "Private Duty Nursing (전담 간호)" },
  { id: "habilitation", label: "Habilitation (기능향상)" },
  { id: "hospice-care", label: "Hospice Care (호스피스)" },
  { id: "autism-aba", label: "Autism & ABA Therapy (자폐 및 ABA 치료)" },
  { id: "pediatric", label: "Pediatric Home Health (소아 방문간호)" },
  { id: "veterans", label: "Veterans (국가유공자 지원)" },
] as const;

type ServiceId = (typeof SERVICES)[number]["id"];
const GRADE_REQUIRED: ServiceId[] = ["companion-care", "personal-care"];

const RELATIONS = ["본인", "가족", "기타"] as const;
type Relation = (typeof RELATIONS)[number];

const FAQS = [
  {
    q: "돌봄 계획은 어떻게 수립되나요?",
    a: "바야다 서비스 네트워크의 임상 전문 인력이 가족 및 주치의와 협력하여 어르신 또는 가족의 건강 상태를 종합적으로 평가하고, 맞춤형 케어 계획을 수립합니다.",
    needsReview: false,
  },
  {
    q: "초기 사정을 위한 방문간호 시에 어떤 일을 하시나요?",
    a: "간호사가 가정을 방문하여 건강 상태 평가를 진행하고 필요에 따라 돌봄 계획을 조정합니다.",
    needsReview: false,
  },
  {
    q: "재택의료 서비스는 누가 제공하나요?",
    a: "팀 기반 돌봄 체계로 운영됩니다. 간호사와 돌봄 인력이 협력하며 간호사(임상 케어 매니저) 감독 하에 이루어집니다.",
    needsReview: true,
    note: "한국 의료법상 '재택의료' 용어 및 제공 인력 자격 기준 확인 필요",
  },
  {
    q: "방문 사이 기간에도 관리가 이루어지나요?",
    a: "지원팀이 정기적으로 전화 확인을 진행합니다.",
    needsReview: false,
  },
  {
    q: "부모님의 돌봄 상황을 어떻게 확인할 수 있나요?",
    a: "전담 팀이 전화 및 이메일로 정기 안내드립니다.",
    needsReview: false,
  },
  {
    q: "복합·중증 질환에 대한 간호도 가능한가요?",
    a: "온·오프라인을 통한 지속적 교대 간호도 가능합니다. 자세한 내용은 1670-1379로 문의해 주세요.",
    needsReview: true,
    note: "한국 법인의 중증 간호 서비스 제공 범위 확인 후 문구 조정 필요",
  },
];

// ── 유틸 ──────────────────────────────────────────────────────────────────────

/** 오늘로부터 최소 2주 뒤 날짜를 YYYY-MM-DD 형식으로 반환 */
function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

// ── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-[color:var(--fg)]">
      {label}
      {required && <span className="ml-0.5 text-[#ce0e2d]">*</span>}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-white px-4 py-2.5 text-sm focus:border-[#ce0e2d] focus:outline-none"
    />
  );
}

function FaqItem({ faq, open, onToggle }: { faq: (typeof FAQS)[number]; open: boolean; onToggle: () => void }) {
  const inner = (
    <div className="border-b border-[color:var(--border)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="font-medium text-[color:var(--fg)] text-sm pr-4">{faq.q}</span>
        <span className="shrink-0 text-[#ce0e2d] text-lg leading-none">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="pb-5 text-sm text-[color:var(--muted)] leading-relaxed">{faq.a}</p>
      )}
    </div>
  );

  return faq.needsReview ? (
    <NeedsReview show={true} note={faq.note}>
      {inner}
    </NeedsReview>
  ) : (
    inner
  );
}

// ── 메인 폼 컴포넌트 (Client) ─────────────────────────────────────────────────

function ContactForm() {
  const [agreed, setAgreed] = useState(false);
  const [relation, setRelation] = useState<Relation>("본인");
  const [otherRelation, setOtherRelation] = useState("");
  const [selectedServices, setSelectedServices] = useState<ServiceId[]>([]);
  const [hasGrade, setHasGrade] = useState<"yes" | "no" | "">("");
  const [currentlyReceiving, setCurrentlyReceiving] = useState<"yes" | "no" | "">("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const needsGradeQuestion = selectedServices.some((s) => GRADE_REQUIRED.includes(s));

  function toggleService(id: ServiceId) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: API 연동
    alert("상담 신청이 접수되었습니다. 24시간 이내에 연락드리겠습니다.");
  }

  return (
    <>
      {/* ── 연락 채널 카드 ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-14">
        {[
          { icon: "📞", title: "전화 문의", value: PHONE, sub: "평일 09:00 - 18:00" },
          { icon: "📧", title: "이메일 문의", value: EMAIL, sub: "영업일 기준 24시간 내 답변" },
          { icon: "🤖", title: "AI 상담", value: "DeiBud", sub: "24시간 이용 가능" },
        ].map((ch) => (
          <div key={ch.title} className="rounded-2xl border border-[color:var(--border)] p-6 text-center">
            <span className="text-3xl">{ch.icon}</span>
            <h3 className="mt-3 font-bold text-[color:var(--fg)]">{ch.title}</h3>
            <p className="mt-2 text-sm font-medium text-[#ce0e2d]">{ch.value}</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">{ch.sub}</p>
          </div>
        ))}
      </div>

      {/* ── 상담 신청 폼 ────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-[color:var(--surface)] p-8">
        <h2 className="text-2xl font-bold text-[color:var(--fg)]">서비스 문의 신청 <span className="text-[#ce0e2d]">Contact Us</span></h2>
        <p className="mt-3 text-sm text-[color:var(--muted)] leading-relaxed max-w-2xl">
          대한민국에서 제공되는 BAYADA 재가의료·방문간호 서비스에 대해 더 알고 싶으시다면, 아래 상담 신청서를 작성하시거나{" "}
          <strong className="text-[#ce0e2d]">{PHONE}</strong>으로 전화해 주세요.
          문의 접수 후 <strong>24시간 이내</strong>에 담당자가 연락드리겠습니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* ① 개인민감정보 동의 */}
          <div className="rounded-xl border-2 border-[#ce0e2d]/30 bg-red-50/50 p-5">
            <p className="text-sm font-semibold text-[color:var(--fg)] mb-3">개인(민감)정보 수집·이용 동의 <span className="text-[#ce0e2d]">*</span></p>
            <p className="text-xs text-[color:var(--muted)] leading-relaxed mb-4">
              바야다홈헬스케어는 서비스 상담 및 안내를 위해 아래와 같이 개인정보를 수집·이용합니다.
              수집 항목: 이름, 연락처, 이메일, 거주지, 건강 관련 정보(필요서비스, 등급 여부 등).
              보유기간: 상담 완료 후 3년. 동의를 거부하실 수 있으나, 거부 시 서비스 상담이 불가합니다.
            </p>
            <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--fg)] cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="accent-[#ce0e2d] w-4 h-4"
                required
              />
              위 내용을 확인하였으며, 개인(민감)정보 수집·이용에 동의합니다.
            </label>
          </div>

          {/* 동의 전 폼 블로킹 안내 */}
          {!agreed && (
            <p className="text-xs text-[color:var(--muted)] text-center py-2">
              개인정보 수집·이용에 동의하시면 아래 신청서를 작성하실 수 있습니다.
            </p>
          )}

          <fieldset disabled={!agreed} className="space-y-6 disabled:opacity-40 disabled:pointer-events-none transition-opacity">
            {/* ② 이름 */}
            <div>
              <FieldLabel label="이름" required />
              <Input type="text" placeholder="홍길동" required />
            </div>

            {/* ③ 환자와의 관계 */}
            <div>
              <FieldLabel label="환자와의 관계" required />
              <div className="mt-2 flex flex-wrap gap-4">
                {RELATIONS.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm text-[color:var(--fg)] cursor-pointer">
                    <input
                      type="radio"
                      name="relation"
                      value={r}
                      checked={relation === r}
                      onChange={() => setRelation(r)}
                      className="accent-[#ce0e2d]"
                    />
                    {r}
                  </label>
                ))}
              </div>
              {relation !== "본인" && (
                <div className="mt-3">
                  <FieldLabel label="구체적인 관계를 입력해 주세요" />
                  <Input
                    type="text"
                    placeholder="예: 아들, 딸, 배우자 등"
                    value={otherRelation}
                    onChange={(e) => setOtherRelation(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* ④ 전화번호 */}
            <div>
              <FieldLabel label="전화번호" required />
              <Input type="tel" placeholder="010-0000-0000" required />
            </div>

            {/* ⑤ 이메일 */}
            <div>
              <FieldLabel label="이메일" required />
              <Input type="email" placeholder="example@email.com" required />
            </div>

            {/* ⑥ 거주지 (동까지) */}
            <div>
              <FieldLabel label="거주지 (동까지)" required />
              <Input type="text" placeholder="예: 서울특별시 강남구 역삼동" required />
              <p className="mt-1 text-xs text-[color:var(--muted)]">정확한 서비스 가능 지역 확인을 위해 동 단위까지 입력해 주세요.</p>
            </div>

            {/* ⑦ 필요 서비스 */}
            <div>
              <FieldLabel label="필요 서비스 (복수 선택 가능)" required />
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SERVICES.map((svc) => (
                  <label key={svc.id} className="flex items-center gap-2 text-sm text-[color:var(--fg)] cursor-pointer rounded-lg border border-[color:var(--border)] px-4 py-3 hover:border-[#ce0e2d] hover:bg-red-50/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(svc.id)}
                      onChange={() => toggleService(svc.id)}
                      className="accent-[#ce0e2d] w-4 h-4 shrink-0"
                    />
                    {svc.label}
                  </label>
                ))}
              </div>
            </div>

            {/* ⑧ 등급 여부 (조건부) */}
            {needsGradeQuestion && (
              <div className="rounded-xl border border-[#ce0e2d]/40 bg-red-50/40 p-5">
                <FieldLabel label="장기요양등급(노인장기요양보험) 판정을 받으셨나요?" required />
                <div className="mt-2 flex gap-6">
                  {(["yes", "no"] as const).map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm text-[color:var(--fg)] cursor-pointer">
                      <input
                        type="radio"
                        name="hasGrade"
                        value={v}
                        checked={hasGrade === v}
                        onChange={() => setHasGrade(v)}
                        className="accent-[#ce0e2d]"
                      />
                      {v === "yes" ? "예, 등급 판정을 받았습니다" : "아니오, 받지 않았습니다"}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ⑨ 현재 서비스 수급 여부 */}
            <div>
              <FieldLabel label="현재 다른 재가 서비스를 받고 계신가요?" required />
              <div className="mt-2 flex gap-6">
                {(["yes", "no"] as const).map((v) => (
                  <label key={v} className="flex items-center gap-2 text-sm text-[color:var(--fg)] cursor-pointer">
                    <input
                      type="radio"
                      name="currentlyReceiving"
                      value={v}
                      checked={currentlyReceiving === v}
                      onChange={() => setCurrentlyReceiving(v)}
                      className="accent-[#ce0e2d]"
                    />
                    {v === "yes" ? "예" : "아니오"}
                  </label>
                ))}
              </div>
            </div>

            {/* ── 선택 입력 구분선 ─────────────────────────────────── */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-[color:var(--border)]" />
              <span className="text-xs text-[color:var(--muted)] shrink-0">이하 선택 입력</span>
              <div className="flex-1 border-t border-[color:var(--border)]" />
            </div>

            {/* ⑩ 서비스 개시 요청일 */}
            <div>
              <FieldLabel label="서비스 개시 요청일 (선택)" />
              <Input type="date" min={getMinDate()} />
              <p className="mt-1 text-xs text-[color:var(--muted)]">최소 2주 이후 날짜부터 선택 가능합니다.</p>
            </div>

            {/* ⑪ 동거 가족 유무 */}
            <div>
              <FieldLabel label="동거 가족이 있으신가요? (선택)" />
              <div className="mt-2 flex gap-6">
                {(["yes", "no"] as const).map((v) => (
                  <label key={v} className="flex items-center gap-2 text-sm text-[color:var(--fg)] cursor-pointer">
                    <input
                      type="radio"
                      name="hasFamily"
                      value={v}
                      className="accent-[#ce0e2d]"
                    />
                    {v === "yes" ? "예" : "아니오"}
                  </label>
                ))}
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="pt-2">
              <button
                type="submit"
                className="rounded-full bg-[#ce0e2d] px-10 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#b00c27] disabled:opacity-50"
              >
                상담 신청하기
              </button>
            </div>
          </fieldset>
        </form>
      </div>

      {/* ── 오시는 길 ──────────────────────────────────────────────── */}
      <div className="mt-14">
        <h2 className="text-xl font-bold text-[color:var(--fg)]">오시는 길</h2>
        <div className="mt-4 rounded-2xl border border-[color:var(--border)] p-6">
          <p className="text-sm text-[color:var(--fg)] font-medium">바야다홈헬스케어 코리아</p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">서울특별시 강남구 테헤란로 (본사 주소 확인 필요)</p>
        </div>
      </div>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <div className="mt-14">
        <h2 className="text-2xl font-bold text-[color:var(--fg)] mb-2">자주 묻는 질문</h2>
        <p className="text-sm text-[color:var(--muted)] mb-8">서비스 신청 전에 궁금하신 점을 확인해 보세요.</p>
        <div className="rounded-2xl border border-[color:var(--border)] px-6">
          {FAQS.map((faq, i) => (
            <FaqItem
              key={i}
              faq={faq}
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// ── 페이지 (Server Component wrapper) ────────────────────────────────────────

export default function ContactPage() {
  return (
    <>
      <PageHero title="Contact Us" subtitle="서비스 문의 신청" />
      <section className="py-[var(--section-gap)]">
        <Container>
          <ContactForm />
        </Container>
      </section>
    </>
  );
}
