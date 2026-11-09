"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  GalleryHorizontalEnd,
  Tags,
  Users,
  BadgeCheck,
  Handshake,
  ScrollText,
  Building2,
  ShoppingCart,
  Ticket,
  FileText,
  LogOut,
  MessageSquareWarning,
  MessageSquareText,
  CalendarDays,
  FileSignature,
  LayoutGrid,
  Route,
  ShieldCheck,
  Settings2,
  Inbox,
  Newspaper,
  HelpCircle,
  MessageSquareQuote,
  Images,
  Globe,
  CalendarCheck,
  ClipboardList,
  UserRound,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  CircleHelp,
  X,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { can, type Permission } from "@/lib/rbac";
import { cx } from "./ui";
import { Segmented } from "./ui/kit/Segmented";
import { useHelp } from "./help/HelpProvider";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  /** 배열이면 그중 하나만 있어도 보인다 */
  permission?: Permission | Permission[];
  /** 2차 이후 기능 — 라우트 없이 비활성 표시 */
  phase?: string;
  /** 비활성 항목 툴팁 (기본: "{phase} 오픈 예정") */
  note?: string;
  badgeKey?: "queue" | "signups" | "reports" | "credentials" | "inquiries" | "bookings" | "withdrawals";
  /** 사이드바 묶음 제목 (같은 group 끼리 연속으로 둔다) */
  group?: string;
}

const PRIMARY: NavItem[] = [
  { path: "", label: "대시보드", icon: LayoutDashboard, permission: "dashboard" },
  { path: "/programs", label: "프로그램", icon: BookOpen, permission: "program.read", group: "콘텐츠" },
  { path: "/approvals", label: "승인 대기", icon: ClipboardCheck, permission: "approval.queue", badgeKey: "queue", group: "콘텐츠" },
  { path: "/curation", label: "배너·메인 큐레이션", icon: GalleryHorizontalEnd, permission: "curation", group: "콘텐츠" },
  { path: "/taxonomy", label: "택소노미", icon: Tags, permission: "taxonomy", group: "콘텐츠" },
  { path: "/pathways", label: "커리어 패스웨이", icon: Route, permission: "pathway", group: "콘텐츠" },
  { path: "/pages", label: "문서 관리", icon: FileSignature, permission: "pages", group: "콘텐츠" },
  { path: "/members", label: "회원·수강", icon: Users, permission: "member.read", badgeKey: "signups", group: "학습자 운영" },
  { path: "/reviews", label: "후기 관리", icon: MessageSquareWarning, permission: "review", badgeKey: "reports", group: "학습자 운영" },
  { path: "/sessions", label: "실습·오프라인 일정", icon: CalendarDays, permission: "session", group: "학습자 운영" },
  // 인증 정책(효력·평가 기준)은 미확정 — 정책 값은 전부 인증 과정 데이터로 어드민에서 설정
  { path: "/credentials", label: "인증 심사", icon: BadgeCheck, permission: "credential.read", badgeKey: "credentials", group: "학습자 운영" },
  { path: "/partners", label: "파트너", icon: Handshake, permission: "partner.manage", group: "파트너" },
  { path: "/partner-console", label: "파트너 콘솔", icon: LayoutGrid, permission: "partner.console", group: "파트너" },
];

const COMMERCE: NavItem[] = [
  { path: "/organizations", label: "기관", icon: Building2, permission: "commerce", group: "B2B · 결제" },
  { path: "/orders", label: "주문", icon: ShoppingCart, permission: "commerce", group: "B2B · 결제" },
  { path: "/pass-plans", label: "패스 요금제", icon: Ticket, permission: "commerce", group: "B2B · 결제" },
  { path: "/invoices", label: "청구서", icon: FileText, permission: "commerce", group: "B2B · 결제" },
];

const SYSTEM: NavItem[] = [
  { path: "/site-settings", label: "사이트 설정", icon: Settings2, permission: "site.manage", group: "시스템" },
  { path: "/feedback", label: "피드백", icon: MessageSquareText, permission: "feedback", group: "시스템" },
  { path: "/roles", label: "역할·권한", icon: ShieldCheck, permission: "role.manage", group: "시스템" },
  { path: "/audit", label: "감사 로그", icon: ScrollText, permission: "audit", group: "시스템" },
];

// 웹사이트(홈페이지 apps/web) 작업 영역 — 경로는 /web/…
const WEBSITE: NavItem[] = [
  { path: "/web", label: "웹사이트 대시보드", icon: Globe, permission: ["web.inquiries", "web.content", "web.bookings", "web.members"] },
  { path: "/web/inquiries", label: "문의 CRM", icon: Inbox, permission: "web.inquiries", badgeKey: "inquiries", group: "고객" },
  { path: "/web/bookings", label: "서비스 예약", icon: CalendarCheck, permission: "web.bookings", badgeKey: "bookings", group: "고객" },
  { path: "/web/visits", label: "방문 기록", icon: ClipboardList, permission: "web.bookings", group: "고객" },
  { path: "/web/members", label: "홈페이지 회원", icon: UserRound, permission: "web.members", badgeKey: "withdrawals", group: "고객" },
  { path: "/web/blog", label: "블로그", icon: Newspaper, permission: "web.content", group: "콘텐츠" },
  { path: "/web/faq", label: "자주 묻는 질문", icon: HelpCircle, permission: "web.content", group: "콘텐츠" },
  { path: "/web/reviews", label: "이용자 후기", icon: MessageSquareQuote, permission: "web.content", group: "콘텐츠" },
  { path: "/web/hero", label: "메인 히어로", icon: Images, permission: "web.content", group: "콘텐츠" },
  { path: "/web/settings", label: "사이트 정보", icon: Settings2, permission: "web.settings", group: "설정" },
  { path: "/feedback", label: "피드백", icon: MessageSquareText, permission: "feedback", group: "설정" },
];

/** 연속된 같은 group 끼리 묶는다 */
function groupItems(items: NavItem[]) {
  const out: { group: string; items: NavItem[] }[] = [];
  for (const it of items) {
    const g = it.group ?? "";
    const last = out[out.length - 1];
    if (last && last.group === g) last.items.push(it);
    else out.push({ group: g, items: [it] });
  }
  return out;
}

export interface SidebarProps {
  locale: string;
  /** DB 기준 실효 권한 — 메뉴 노출은 이것만 본다 */
  permissions: Permission[];
  roleName: string;
  isPartner: boolean;
  /** 스타일 가이드는 Super Admin(ADMIN)에게만 */
  isSuperAdmin?: boolean;
  userName: string;
  userEmail: string;
  counts: { queue: number; signups: number; reports: number; credentials?: number; inquiries?: number; bookings?: number; withdrawals?: number };
}

/** 접기 단축키 표기 — 맥은 ⌘, 그 밖은 Ctrl */
function useShortcutLabel() {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  return mac ? "⌘ B" : "Ctrl B";
}

export function Sidebar({
  locale,
  permissions,
  roleName,
  isPartner,
  isSuperAdmin,
  userName,
  userEmail,
  counts,
  rail = false,
  drawer = false,
  open = false,
  onToggleRail,
  onClose,
}: SidebarProps & {
  /** 데스크톱 접힌 상태 — 아이콘만(72px) */
  rail?: boolean;
  /** 좁은 화면 — 화면 밖 서랍 */
  drawer?: boolean;
  /** 서랍이 열렸는지 (drawer 일 때만) */
  open?: boolean;
  onToggleRail?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const base = `/${locale}`;
  const help = useHelp();
  const shortcut = useShortcutLabel();
  const asideRef = useRef<HTMLElement>(null);

  // 서랍: 열리면 안으로 포커스, Tab 은 서랍 안에서만 돈다, Esc 로 닫힘
  useEffect(() => {
    if (!drawer || !open) return;
    const el = asideRef.current;
    const prev = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => el?.querySelector<HTMLElement>("[data-drawer-close]")?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      } else if (e.key === "Tab" && el) {
        const f = [...el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(
          (n) => n.offsetParent !== null,
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [drawer, open, onClose]);

  const isActive = (path: string) => {
    const href = base + path;
    // /web 은 하위 메뉴(/web/inquiries …)가 따로 있어 정확히 같을 때만 활성
    return path === "" || path === "/web" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  };

  const allowed = (perm: NavItem["permission"]) =>
    !!perm && (Array.isArray(perm) ? perm : [perm]).some((p) => can({ permissions }, p));
  // 2차 예정 항목은 운영 역할에게만 보여 준다 (파트너 콘솔에는 불필요)
  const visible = (items: NavItem[]) => items.filter((i) => (i.phase ? !isPartner : allowed(i.permission)));
  const primary = visible(PRIMARY);
  const commerce = visible(COMMERCE);
  const system = [
    ...visible(SYSTEM),
    ...(isSuperAdmin ? [{ path: "/style-guide", label: "스타일 가이드", icon: Palette, group: "시스템" } satisfies NavItem] : []),
  ];
  const website = visible(WEBSITE);

  // 작업 영역은 URL 로 정한다 (/web/… = 웹사이트). 한쪽 권한만 있으면 그쪽만 보인다
  const hasAcademy = primary.length + commerce.length + system.length > 0;
  const onWeb = pathname === `${base}/web` || pathname.startsWith(`${base}/web/`);
  // 피드백(/feedback)은 두 작업 영역 공용 메뉴 → 들어오기 직전 작업 영역을 유지한다
  const onShared = pathname === `${base}/feedback` || pathname.startsWith(`${base}/feedback/`);
  const [lastWorkspace, setLastWorkspace] = useState<"academy" | "web">("academy");
  useEffect(() => {
    if (onShared) {
      if (sessionStorage.getItem("bayada-admin.workspace") === "web") setLastWorkspace("web");
    } else {
      sessionStorage.setItem("bayada-admin.workspace", onWeb ? "web" : "academy");
    }
  }, [onShared, onWeb]);
  const workspace: "academy" | "web" =
    website.length > 0 && (onWeb || !hasAcademy || (onShared && lastWorkspace === "web")) ? "web" : "academy";
  // 첫 화면 순서는 예전 메뉴 순서(운영 메뉴 → 시스템 → B2B) 그대로
  const academyHome = base + ([...primary, ...system, ...commerce].find((i) => !i.phase)?.path ?? "");
  const webHome = base + (website[0]?.path ?? "/web");

  // 서랍은 언제나 펼친 모양
  const compact = rail && !drawer;
  const railTip = (label: string) => (compact ? { "data-tip": label, "data-tip-side": "right" } : {});

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const count = item.badgeKey ? (counts[item.badgeKey] ?? 0) : 0;
    const tip = count > 0 ? `${item.label} · ${count > 99 ? "99+" : count}건` : item.label;
    return (
      <li key={item.path || "home"}>
        <Link
          href={base + item.path}
          aria-current={active ? "page" : undefined}
          aria-label={compact ? tip : undefined}
          {...railTip(tip)}
          className={cx(
            "group/nav relative flex h-10 items-center gap-2.5 rounded-full px-3.5 text-[13.5px] font-bold tracking-[-0.01em] transition-colors duration-150",
            active
              ? "bg-brand text-white shadow-[0_8px_20px_-10px_rgb(227_27_52/0.9)]"
              : "text-side-fg hover:bg-side-hover hover:text-white",
          )}
        >
          <Icon className={cx("size-[18px] shrink-0", active ? "text-white" : "text-white/45 group-hover/nav:text-white/85")} strokeWidth={2.1} aria-hidden />
          <span className={cx("flex-1 truncate transition-opacity duration-200", compact && "pointer-events-none opacity-0")}>{item.label}</span>
          {count > 0 &&
            (compact ? (
              <span
                aria-hidden
                className={cx("absolute right-1.5 top-1.5 size-2 rounded-full ring-2", active ? "bg-white ring-brand" : "bg-brand ring-side")}
              />
            ) : (
              <span
                className={cx(
                  "num inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold",
                  active ? "bg-white text-brand" : "bg-brand text-white",
                )}
              >
                {count > 99 ? "99+" : count}
              </span>
            ))}
        </Link>
      </li>
    );
  };

  const renderGroups = (items: NavItem[]) =>
    groupItems(items).map((g, i) => (
      <div key={`${g.group}-${i}`}>
        {g.group &&
          (compact ? (
            i > 0 && <span aria-hidden className="mx-auto mb-2 block h-px w-6 bg-side-line" />
          ) : (
            <p className="mb-1.5 truncate px-3.5 text-[11px] font-bold tracking-[0.02em] text-side-label">{g.group}</p>
          ))}
        <ul className="flex flex-col gap-0.5">{g.items.map(renderItem)}</ul>
      </div>
    ));

  const footBtn =
    "flex h-10 shrink-0 items-center gap-2.5 rounded-full text-side-fg outline-none transition-colors hover:bg-side-hover hover:text-white focus-visible:shadow-[0_0_0_2px_#fff]";

  return (
    <aside
      ref={asideRef}
      id="admin-sidebar"
      aria-label="사이드바"
      data-rail={compact || undefined}
      {...(drawer ? { role: "dialog", "aria-modal": open ? true : undefined } : {})}
      className={cx(
        "scroll-dark h-dvh shrink-0 flex-col overflow-y-auto overflow-x-hidden bg-side px-3 pb-4 pt-6 text-side-fg",
        drawer
          ? cx(
              "fixed inset-y-0 left-0 z-dialog flex w-[280px] max-w-[86vw] shadow-[12px_0_40px_rgb(0_0_0/0.25)] transition-[transform,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              open ? "visible translate-x-0" : "invisible -translate-x-full",
            )
          : cx(
              // 서버·첫 렌더는 이 모양 — 좁은 화면에서는 CSS 로 숨겨 수화 전 깜빡임이 없다
              "sticky top-0 hidden transition-[width] lg:flex duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              compact ? "w-[72px]" : "w-[256px]",
            ),
      )}
    >
      <div className={cx("mb-6 flex h-[22px] items-center", compact ? "justify-center" : "justify-between gap-2")}>
        <Link
          href={workspace === "web" ? webHome : academyHome}
          className={cx("flex items-center gap-2", !compact && "px-3.5")}
          aria-label="BAYADA 관리자 홈"
          {...railTip("BAYADA 관리자 홈")}
        >
          {compact ? (
            <span className="text-[22px] font-black leading-none tracking-[-0.045em] text-white">
              B<span className="text-brand">.</span>
            </span>
          ) : (
            <>
              <span className="text-[22px] font-black leading-none tracking-[-0.045em] text-white">
                BAYADA<span className="text-brand">.</span>
              </span>
              <span className="rounded-full bg-brand px-2 py-[3px] text-[10.5px] font-extrabold leading-none tracking-[0.02em] text-white">
                {isPartner ? "PARTNER" : "ADMIN"}
              </span>
            </>
          )}
        </Link>
        {drawer && (
          <button type="button" onClick={onClose} data-drawer-close aria-label="메뉴 닫기" className={cx(footBtn, "w-10 justify-center")}>
            <X className="size-[18px]" aria-hidden />
          </button>
        )}
      </div>

      {hasAcademy &&
        website.length > 0 &&
        (compact ? (
          <div className="mb-6 flex flex-col items-center gap-1 rounded-[22px] bg-side-raised p-1" role="group" aria-label="관리할 사이트" data-tour="side-workspace">
            {(
              [
                { value: "academy", label: "아카데미", href: academyHome, Icon: GraduationCap },
                { value: "web", label: "웹사이트", href: webHome, Icon: Globe },
              ] as const
            ).map(({ value, label, href, Icon }) => (
              <Link
                key={value}
                href={href}
                aria-label={`관리할 사이트: ${label}`}
                aria-current={workspace === value ? "true" : undefined}
                data-tip={`관리할 사이트 · ${label}`}
                data-tip-side="right"
                className={cx(
                  "flex size-10 items-center justify-center rounded-full transition-colors",
                  workspace === value ? "bg-brand text-white shadow-[0_4px_14px_-4px_rgb(227_27_52/0.6)]" : "text-side-fg hover:text-white",
                )}
              >
                <Icon className="size-[18px]" aria-hidden />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mb-6 px-1" data-tour="side-workspace">
            <p className="mb-2 px-2.5 text-[11px] font-bold tracking-[0.02em] text-side-label" id="workspace-label">
              관리할 사이트
            </p>
            <Segmented
              aria-label="관리할 사이트"
              tone="dark"
              size="lg"
              fullWidth
              value={workspace}
              options={[
                { value: "academy", label: "아카데미", href: academyHome, icon: <GraduationCap aria-hidden /> },
                { value: "web", label: "웹사이트", href: webHome, icon: <Globe aria-hidden /> },
              ]}
            />
          </div>
        ))}

      <nav className="flex flex-1 flex-col gap-5" aria-label="주 메뉴" data-tour="side-nav">
        {workspace === "web" ? renderGroups(website) : renderGroups([...primary, ...commerce, ...system])}
      </nav>

      <div className={cx("mt-6 flex gap-1", compact ? "flex-col items-center" : "items-center")}>
        <button
          type="button"
          onClick={() => {
            if (drawer) onClose?.();
            help.openHelp();
          }}
          data-tour="side-help"
          aria-label="도움말"
          {...railTip("도움말 · 이 화면 안내와 매뉴얼")}
          className={cx(footBtn, compact ? "w-10 justify-center" : "flex-1 px-3.5 text-[13.5px] font-bold")}
        >
          <CircleHelp className="size-[18px] shrink-0 text-white/45" strokeWidth={2.1} aria-hidden />
          {!compact && <span className="flex-1 text-left">도움말</span>}
        </button>
        {!drawer && (
          <button
            type="button"
            onClick={onToggleRail}
            data-tour="side-collapse"
            aria-label={compact ? "사이드바 펼치기" : "사이드바 접기"}
            aria-expanded={!compact}
            aria-controls="admin-sidebar"
            data-tip={compact ? "사이드바 펼치기" : "사이드바 접기"}
            data-tip-kbd={shortcut}
            {...(compact ? { "data-tip-side": "right" } : {})}
            className={cx(footBtn, "w-10 justify-center")}
          >
            {compact ? <PanelLeftOpen className="size-[18px]" aria-hidden /> : <PanelLeftClose className="size-[18px]" aria-hidden />}
          </button>
        )}
      </div>

      <div className="mt-3 border-t border-side-line pt-4" data-tour="side-user">
        <div className={cx("flex items-center gap-2.5 rounded-2xl py-1.5", compact ? "flex-col px-0" : "px-2")}>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-side-raised text-[13px] font-extrabold text-white"
            {...railTip(`${userName} 님 · ${roleName}`)}
          >
            {userName.slice(0, 1)}
          </span>
          {!compact && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[13px] font-bold text-white">
                {userName} <span className="font-medium text-side-label">님</span>
              </p>
              <p className="mt-0.5 truncate text-[11.5px] text-side-label" data-tip={userEmail}>
                {roleName}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: `/${locale}/auth/login` })}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-side-label transition-colors hover:bg-side-hover hover:text-white"
            aria-label="로그아웃"
            data-tip="로그아웃"
            {...(compact ? { "data-tip-side": "right" } : {})}
          >
            <LogOut className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  );
}
