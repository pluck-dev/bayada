"use client";

import { useDeferredValue, useState } from "react";
import { Play, Search, SearchX, X } from "lucide-react";
import { cn } from "@bayada/ui";
import { Button, EmptyState, inputSmClass } from "../ui";
import { useHelp } from "./HelpProvider";
import { ManualArticle } from "./ManualArticle";
import { MANUAL, MANUAL_GROUPS, type ManualSection } from "./manual";
import { WELCOME_TOUR } from "./tours";

/** 글 전체 텍스트(검색용) */
const haystack = (s: ManualSection) =>
  [s.title, s.summary, s.why, ...(s.steps ?? []).flatMap((st) => [st.t, st.d, st.ui]), ...(s.tips ?? []), ...(s.warn ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

/** 운영 매뉴얼 본문 — 왼쪽 목차(검색 결과만) + 글. 검색은 제목·본문·팁 전체에서 띄어쓰기로 나눈 낱말이 모두 들어간 글 */
export function ManualView({ locale }: { locale: string }) {
  const { startTour } = useHelp();
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const words = dq.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const list = words.length ? MANUAL.filter((s) => words.every((w) => haystack(s).includes(w))) : MANUAL;
  const groups = MANUAL_GROUPS.map((g) => ({ g, items: list.filter((s) => s.group === g) })).filter((x) => x.items.length);

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div className="flex h-fit flex-col gap-3 lg:sticky lg:top-6">
        <div role="search" className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="매뉴얼 검색 (예: 승인, 문의, 권한)"
            aria-label="매뉴얼 검색"
            className={cn(inputSmClass, "pl-10 pr-9 font-medium")}
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="검색어 지우기"
              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-wash-strong hover:text-ink"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </div>
        <nav aria-label="매뉴얼 목차" className="surface-card flex flex-col gap-4 rounded-[22px] bg-canvas p-4 lg:max-h-[calc(100dvh-120px)] lg:overflow-y-auto">
          {groups.length === 0 && <p className="px-2 text-[13px] text-muted">맞는 글이 없어요.</p>}
          {groups.map(({ g, items }) => (
            <div key={g}>
              <p className="mb-1 px-2.5 text-[11px] font-bold tracking-[0.02em] text-muted">{g}</p>
              <ul>
                {items.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="block rounded-xl px-2.5 py-1.5 text-[13px] font-bold text-ink-soft transition-colors hover:bg-wash hover:text-ink">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        {!words.length && (
          <div className="flex flex-col gap-4 rounded-[22px] bg-side p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[16px] font-extrabold tracking-[-0.02em]">처음이라면 화면 안내부터</p>
              <p className="mt-1 text-[13px] leading-[1.6] text-white/65">
                사이드바·관리할 사이트 전환·도움말 위치를 1분 동안 짚어 드려요. 각 화면 사용법은 도움말 → &lsquo;이 화면 둘러보기&rsquo;.
              </p>
            </div>
            <Button variant="brand" onClick={() => startTour(WELCOME_TOUR)}>
              <Play aria-hidden />
              처음 안내 다시 보기
            </Button>
          </div>
        )}
        {list.length === 0 ? (
          <div className="surface-card rounded-[22px] bg-canvas">
            <EmptyState icon={<SearchX />} title={`'${dq.trim()}'에 맞는 글이 없어요`} description="다른 낱말(메뉴 이름·버튼 이름)로 찾아보세요." />
          </div>
        ) : (
          groups.map(({ g, items }) => (
            <section key={g} className="flex flex-col gap-4" aria-label={g}>
              <h2 className="mt-3 px-1 text-[12.5px] font-bold tracking-[0.04em] text-muted">{g}</h2>
              {items.map((s) => (
                <ManualArticle key={s.id} s={s} locale={locale} />
              ))}
            </section>
          ))
        )}
      </div>
    </div>
  );
}
