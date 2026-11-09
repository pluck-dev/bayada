"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "../ui/feedback";
import { Tour } from "./Tour";
import { HelpPanel } from "./HelpPanel";
import { WELCOME_TOUR, tourById, type TourDef, type TourStep } from "./tours";

/**
 * 도움말·화면 둘러보기 상태. 어드민 셸(AdminShell) 안에서만 쓴다.
 * - 처음 안내(welcome)는 사용자별로 한 번 자동 시작 — localStorage `bayada-admin.tour.<사용자 id>` = "done".
 *   서버 기록이 아니라 브라우저별이다(다른 PC 에서는 한 번 더 뜬다). 다시 보기: 도움말 패널·운영 매뉴얼.
 * - 화면별 둘러보기는 자동으로 뜨지 않는다(도움말 → '이 화면 둘러보기').
 */
type HelpCtx = {
  openHelp: () => void;
  startTour: (id: string) => void;
};

const Ctx = createContext<HelpCtx>({ openHelp: () => {}, startTour: () => {} });

export const useHelp = () => useContext(Ctx);

const seenKey = (userId: string) => `bayada-admin.tour.${userId}`;

/** 화면에 실제로 보이는 대상 요소 ("a|b" 는 먼저 보이는 쪽) */
export function findTourTarget(target: string): HTMLElement | null {
  for (const name of target.split("|")) {
    for (const el of document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)) {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0 || r.right <= 0 || r.left >= window.innerWidth) continue;
      if (getComputedStyle(el).visibility === "hidden" || el.closest("[inert]")) continue;
      return el;
    }
  }
  return null;
}

export function HelpProvider({ userId, locale, children }: { userId: string; locale: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const toast = useToast();
  const [panel, setPanel] = useState(false);
  const [tour, setTour] = useState<{ def: TourDef; steps: TourStep[] } | null>(null);
  // 사용자가 먼저 도움말·둘러보기를 열었으면 처음 안내 자동 시작은 건너뛴다(열어 둔 패널을 닫지 않게)
  const touched = useRef(false);

  // 화면을 옮기면 도움말·둘러보기를 닫는다 (대상 요소가 사라지므로)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setPanel(false);
    setTour(null);
  }

  const startTour = useCallback(
    (id: string) => {
      const def = tourById(id);
      if (!def) return;
      setPanel(false);
      // 패널이 닫히고 화면이 그려진 뒤 대상을 찾는다 — 권한·상태로 안 그려진 단계는 건너뜀
      requestAnimationFrame(() => {
        const steps = def.steps.filter((s) => !s.target || findTourTarget(s.target));
        if (steps.filter((s) => s.target).length === 0 && def.steps.some((s) => s.target)) {
          toast("info", "이 화면에서는 안내할 항목이 보이지 않아요.");
          return;
        }
        setTour({ def, steps });
      });
    },
    [toast],
  );

  const finishTour = useCallback(() => {
    if (tour?.def.id === WELCOME_TOUR) {
      try {
        localStorage.setItem(seenKey(userId), "done");
      } catch {
        /* 저장소 차단 — 다음에 또 뜰 뿐 */
      }
    }
    setTour(null);
  }, [tour, userId]);

  // 처음 들어온 사용자 — 첫 화면이 그려지고 잠시 뒤 처음 안내
  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(seenKey(userId)) === "done";
    } catch {
      seen = true; // 저장소를 못 쓰면 매번 뜨지 않게
    }
    if (seen) return;
    const t = setTimeout(() => {
      if (!touched.current) startTour(WELCOME_TOUR);
    }, 700);
    return () => clearTimeout(t);
    // 사용자당 한 번 — startTour 가 바뀌어도 다시 돌지 않게
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const closePanel = useCallback(() => setPanel(false), []);
  const value = useMemo<HelpCtx>(
    () => ({
      openHelp: () => {
        touched.current = true;
        setPanel(true);
      },
      startTour: (id: string) => {
        touched.current = true;
        startTour(id);
      },
    }),
    [startTour],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <HelpPanel open={panel} onClose={closePanel} locale={locale} />
      {tour && <Tour key={tour.def.id} title={tour.def.title} steps={tour.steps} onFinish={finishTour} />}
    </Ctx.Provider>
  );
}
