import Link from "next/link";
import type { Metadata } from "next";
import { BadgeCheck, BookOpen, ClipboardCheck, GraduationCap, ShieldCheck } from "lucide-react";
import { getViewer } from "@/lib/viewer";
import { listActivePrograms } from "@/lib/queries/credentials";
import { validityText } from "@/lib/credentials";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "바야다 인증",
  description: "선수 프로그램을 수료하고 시험·실기 평가를 통과하면 바야다홈헬스케어가 발급하는 바야다 인증을 받을 수 있어요.",
};

const STEPS = [
  { icon: BookOpen, title: "선수 프로그램 수료", body: "인증마다 정해진 프로그램을 모두 수료해요" },
  { icon: ClipboardCheck, title: "인증 신청", body: "수료를 마치면 인증 페이지에서 신청해요" },
  { icon: GraduationCap, title: "시험 · 실기 평가", body: "심사위원이 평가 기준에 따라 평가해요" },
  { icon: BadgeCheck, title: "승인 · 발급", body: "운영자 승인 후 인증번호와 검증 QR이 발급돼요" },
];

export default async function CertificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const viewer = await getViewer();
  const programs = await listActivePrograms(viewer);

  return (
    <div className="container-page pb-20 pt-8 md:pt-10">
      <nav aria-label="현재 위치" className="text-xs text-muted">
        <Link href={`/${locale}`} className="hover:text-ink">
          홈
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-soft">바야다 인증</span>
      </nav>
      <h1 className="mt-3 text-[32px] font-bold tracking-[-0.02em] text-ink md:text-[40px]">바야다 인증</h1>
      <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-muted">
        수료증이 &lsquo;배웠다&rsquo;는 기록이라면, 바야다 인증은 &lsquo;현장에서 할 수 있다&rsquo;는 확인이에요. 선수 프로그램을 수료한 뒤
        평가를 통과하면 바야다홈헬스케어가 인증을 발급해요.
      </p>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-card ring-1 ring-line">
              <s.icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                <span className="mr-1 text-brand">{i + 1}</span>
                {s.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12">
        {programs.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="h-5 w-5" />}
            title="지금 신청할 수 있는 인증 과정이 없어요"
            description="인증 과정이 열리면 이곳에 안내할게요. 그동안 프로그램을 수료해 두면 열렸을 때 바로 신청할 수 있어요."
            action={{ label: "프로그램 둘러보기", href: `/${locale}/courses` }}
          />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {programs.map((p) => {
              const total = p.prerequisites.length;
              const pct = total ? Math.round((p.done / total) * 100) : 0;
              return (
                <li key={p.id}>
                  <Link
                    href={`/${locale}/certifications/${encodeURIComponent(p.slug)}`}
                    className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-lift"
                  >
                    <span className="inline-flex items-center gap-1 self-start rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> 바야다 인증
                    </span>
                    <p className="mt-4 text-xl font-bold leading-snug tracking-tight text-ink">{p.title}</p>
                    {p.summary && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{p.summary}</p>}
                    <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line-soft pt-4 text-xs">
                      <div>
                        <dt className="text-muted">선수 프로그램</dt>
                        <dd className="mt-1 font-semibold text-ink">{total}개</dd>
                      </div>
                      <div>
                        <dt className="text-muted">평가</dt>
                        <dd className="mt-1 font-semibold text-ink">{p.practicalRequired ? "시험 + 실기" : "시험"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">유효기간</dt>
                        <dd className="mt-1 font-semibold text-ink">{p.validityMonths == null ? "영구" : validityText(p.validityMonths).replace("발급일로부터 ", "")}</dd>
                      </div>
                    </dl>
                    {viewer && total > 0 && (
                      <div className="mt-5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-ink-soft">내 선수 프로그램 수료</span>
                          <span className="font-bold text-ink">
                            {p.done}/{total}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line-soft">
                          <div className={`h-full rounded-full ${p.done === total ? "bg-success" : "bg-brand"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}
                    <span className="mt-auto pt-6 text-sm font-semibold text-ink">자세히 보기 →</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
