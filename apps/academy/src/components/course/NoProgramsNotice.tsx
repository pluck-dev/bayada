import Link from "next/link";
import { ArrowRight, Building2, Lock, Mail, ShieldCheck } from "lucide-react";
import { buttonVariants, cn } from "@bayada/ui";
import { COVER_PALETTES, CoverPattern, type CoverPatternKind, type CoverTone } from "@bayada/ui/cover";

/**
 * 보는 사람이 열람할 수 있는 프로그램이 0개일 때(홈·카탈로그 공용).
 * 2026-11 기준 게시 프로그램이 전부 사내 전용(INTERNAL)이라 외부 회원·비로그인은 이 화면을 본다 — 공개 여부는 고객사가 정한다.
 * - 비로그인: 임직원 로그인으로 안내 (주요 행동 1개)
 * - 로그인한 외부 회원: 왜 비어 있는지 + 기관 도입 문의 / 바야다 인증 / 운영 문의
 */
export function NoProgramsNotice({
  locale,
  loggedIn,
  name,
  inquiryHref,
  contactEmail,
  callbackPath,
  className,
}: {
  locale: string;
  loggedIn: boolean;
  name?: string | null;
  inquiryHref: string;
  contactEmail?: string;
  /** 로그인 후 돌아올 경로 */
  callbackPath?: string;
  className?: string;
}) {
  const base = `/${locale}`;
  const loginHref = `${base}/auth/login${callbackPath ? `?callbackUrl=${encodeURIComponent(callbackPath)}` : ""}`;
  return (
    <section
      aria-labelledby="no-programs-title"
      className={cn("relative overflow-hidden rounded-[28px] bg-brand-50 px-6 py-10 md:px-12 md:py-14", className)}
    >
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-caption font-bold text-brand-700">
            <Lock className="h-3.5 w-3.5" aria-hidden /> 임직원 전용 운영 중
          </p>
          <h2 id="no-programs-title" className="mt-4 text-[26px] font-extrabold leading-[1.3] tracking-[-0.03em] text-ink md:text-[32px]">
            {loggedIn ? (
              <>
                {name ? `${name}님, ` : ""}아직 열람할 수 있는
                <br className="hidden sm:block" /> 공개 프로그램이 없어요
              </>
            ) : (
              <>
                지금은 바야다 임직원 대상
                <br className="hidden sm:block" /> 교육을 운영하고 있어요
              </>
            )}
          </h2>
          <p className="mt-4 max-w-lg text-body text-ink-soft">
            {loggedIn
              ? "현재 아카데미 프로그램은 바야다홈헬스케어 임직원(사내 전용)에게만 열려 있어요. 외부에 공개되는 프로그램이 생기면 이 화면에 바로 나타나요."
              : "바야다홈헬스케어 임직원이라면 회사 계정으로 로그인해 사내 교육을 수강하세요. 외부 공개 프로그램은 준비되는 대로 이곳에 소개할게요."}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {loggedIn ? (
              <a href={inquiryHref} className={buttonVariants({ variant: "primary", size: "lg" })}>
                <Building2 aria-hidden /> 기관 도입 문의
              </a>
            ) : (
              <Link href={loginHref} className={buttonVariants({ variant: "primary", size: "lg" })}>
                임직원 로그인 <ArrowRight aria-hidden />
              </Link>
            )}
            <Link href={`${base}/certifications`} className={buttonVariants({ variant: "outline", size: "lg" })}>
              <ShieldCheck aria-hidden /> 바야다 인증 알아보기
            </Link>
          </div>
          {loggedIn && contactEmail && (
            <p className="mt-5 flex flex-wrap items-center gap-1.5 text-body-sm text-muted">
              <Mail className="h-4 w-4" aria-hidden />
              임직원인데 프로그램이 보이지 않나요? 소속 확인을 요청해 주세요 —
              <a href={`mailto:${contactEmail}`} className="font-semibold text-ink underline underline-offset-4">
                {contactEmail}
              </a>
            </p>
          )}
          {!loggedIn && (
            <p className="mt-5 text-body-sm text-muted">
              기관·센터 단체 교육이 필요하신가요?{" "}
              <a href={inquiryHref} className="font-semibold text-ink underline underline-offset-4">
                기관 도입 문의
              </a>
            </p>
          )}
        </div>
        <CoverStack />
      </div>
    </section>
  );
}

/** 오른쪽 장식: 표지 색 세 장을 겹쳐 '잠긴 프로그램'을 암시 (데이터 아님) */
function CoverStack() {
  const tiles: Array<{ tone: CoverTone; pattern: CoverPatternKind; cls: string }> = [
    { tone: "sand", pattern: "rings", cls: "left-0 top-6 -rotate-6" },
    { tone: "ink", pattern: "dots", cls: "left-[18%] top-0 rotate-3" },
    { tone: "red", pattern: "cross", cls: "left-[36%] top-10 -rotate-2" },
  ];
  return (
    <div aria-hidden className="relative mx-auto hidden h-[240px] w-full max-w-[420px] sm:block">
      {tiles.map((t) => {
        const p = COVER_PALETTES[t.tone];
        return (
          <div
            key={t.tone}
            className={cn("absolute aspect-video w-[62%] overflow-hidden rounded-2xl shadow-md", t.cls)}
            style={{ background: p.bg }}
          >
            <CoverPattern kind={t.pattern} color={p.pattern} />
            <span
              className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-micro font-bold"
              style={{ background: p.chipBg, color: p.fg }}
            >
              <Lock className="h-3 w-3" /> 사내 전용
            </span>
            <span className="absolute bottom-4 left-4 right-4 flex flex-col gap-1.5">
              <span className="h-2.5 w-4/5 rounded-full" style={{ background: p.fg, opacity: 0.85 }} />
              <span className="h-2.5 w-1/2 rounded-full" style={{ background: p.fg, opacity: 0.5 }} />
            </span>
          </div>
        );
      })}
    </div>
  );
}
