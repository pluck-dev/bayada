"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, Menu } from "lucide-react";
import { Sidebar, type SidebarProps } from "./Sidebar";
import { HelpProvider, useHelp } from "./help/HelpProvider";
import { SIDEBAR_COOKIE } from "@/lib/sidebar-pref";


const DESKTOP = "(min-width: 1024px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
/** 서버·첫 렌더는 데스크톱으로 가정 — 좁은 화면에서는 서랍이 닫힌 채라 차이가 보이지 않는다 */
const useDesktop = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );

/**
 * 어드민 화면 틀: 사이드바(데스크톱 = 펼침 256px / 접힘 72px, 1024px 미만 = 화면 밖 서랍) + 본문 + 도움말·둘러보기.
 * 단축키 Ctrl/⌘+B = 접기·펼치기(좁은 화면은 서랍 열기·닫기). 입력 중(텍스트 칸·편집기)에는 가로채지 않는다.
 */
export function AdminShell({
  sidebar,
  initialRail,
  userId,
  children,
}: {
  sidebar: SidebarProps;
  initialRail: boolean;
  userId: string;
  children: React.ReactNode;
}) {
  return (
    <HelpProvider userId={userId} locale={sidebar.locale}>
      <Shell sidebar={sidebar} initialRail={initialRail}>
        {children}
      </Shell>
    </HelpProvider>
  );
}

function Shell({ sidebar, initialRail, children }: { sidebar: SidebarProps; initialRail: boolean; children: React.ReactNode }) {
  const desktop = useDesktop();
  const pathname = usePathname();
  const help = useHelp();
  const [rail, setRail] = useState(initialRail);
  const [drawer, setDrawer] = useState(false);

  // 메뉴를 고르면(경로가 바뀌면) 서랍을 닫는다
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setDrawer(false);
  }
  // 데스크톱 폭으로 넓어지면 서랍 상태는 버린다
  if (desktop && drawer) setDrawer(false);

  const toggleRail = useCallback(() => {
    setRail((r) => {
      const next = !r;
      document.cookie = `${SIDEBAR_COOKIE}=${next ? "rail" : "full"}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, []);
  const closeDrawer = useCallback(() => setDrawer(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "b" || !(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || t.closest("input, textarea, select, [contenteditable='true']"))) return;
      e.preventDefault();
      if (window.matchMedia(DESKTOP).matches) toggleRail();
      else setDrawer((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleRail]);

  const home = `/${sidebar.locale}`;

  return (
    <div className="min-h-screen lg:flex">
      {/* 좁은 화면 상단 바 */}
      <header className="sticky top-0 z-header flex h-14 items-center gap-2 bg-side px-3 text-white lg:hidden">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          aria-label="메뉴 열기"
          aria-expanded={drawer}
          aria-controls="admin-sidebar"
          data-tour="topbar-menu"
          className="flex size-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-side-hover hover:text-white"
        >
          <Menu className="size-5" aria-hidden />
        </button>
        <Link href={home} className="flex flex-1 items-center gap-2" aria-label="BAYADA 관리자 홈">
          <span className="text-[19px] font-black leading-none tracking-[-0.045em]">
            BAYADA<span className="text-brand">.</span>
          </span>
          <span className="rounded-full bg-brand px-2 py-[3px] text-[10px] font-extrabold leading-none tracking-[0.02em]">
            {sidebar.isPartner ? "PARTNER" : "ADMIN"}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => help.openHelp()}
          aria-label="도움말"
          data-tour="topbar-help"
          className="flex size-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-side-hover hover:text-white"
        >
          <CircleHelp className="size-5" aria-hidden />
        </button>
      </header>

      {drawer && !desktop && (
        <div className="fixed inset-0 z-overlay animate-fade-in bg-[rgb(21_20_20/0.45)] backdrop-blur-[2px]" onClick={closeDrawer} aria-hidden />
      )}

      <Sidebar
        {...sidebar}
        rail={rail}
        drawer={!desktop}
        open={drawer}
        onToggleRail={toggleRail}
        onClose={closeDrawer}
      />

      <main className="min-w-0 flex-1" inert={drawer && !desktop ? true : undefined}>
        <div className="mx-auto max-w-[1360px] px-4 pb-16 pt-6 sm:px-6 md:px-8 lg:px-10 lg:pt-9">{children}</div>
      </main>
    </div>
  );
}
