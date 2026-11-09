import type { Metadata } from "next";
import { Award, BookOpen, ShieldCheck } from "lucide-react";
import { COVER_PALETTES, CoverPattern } from "@bayada/ui/cover";

export const metadata: Metadata = {
  title: "로그인",
  description: "BAYADA Academy에 로그인하여 다양한 헬스케어 교육을 수강하세요.",
  robots: { index: false, follow: true },
};

const POINTS = [
  { icon: BookOpen, text: "직군별 실무 교육을 영상·읽기·퀴즈로" },
  { icon: Award, text: "모든 강의를 마치면 수료증 자동 발급" },
  { icon: ShieldCheck, text: "QR 검증 링크로 누구나 발급 사실 확인" },
];

/** 로그인·가입·비밀번호 화면 공용: 데스크톱은 왼쪽 브랜드 면 + 오른쪽 폼, 모바일은 폼만 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const p = COVER_PALETTES.red;
  return (
    <div className="container-page grid gap-8 py-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:py-10">
      <aside
        aria-hidden
        className="relative hidden min-h-[560px] overflow-hidden rounded-[28px] p-10 text-white lg:flex lg:flex-col lg:justify-between"
        style={{ background: p.bg }}
      >
        <CoverPattern kind="rings" color={p.pattern} />
        <p className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-caption font-bold">
          BAYADA Academy
        </p>
        <div className="relative">
          <p className="text-[40px] font-black leading-[1.15] tracking-[-0.04em]">
            돌봄의 전문성,
            <br />
            커리어가 되다
          </p>
          <ul className="mt-8 space-y-3">
            {POINTS.map((pt) => (
              <li key={pt.text} className="flex items-center gap-3 text-body font-semibold text-white/90">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <pt.icon className="h-4 w-4" />
                </span>
                {pt.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
