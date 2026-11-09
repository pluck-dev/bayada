"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  type LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { can, type Permission } from "@/lib/rbac";
import { cx } from "./ui";

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
  badgeKey?: "queue" | "signups" | "reports" | "credentials" | "inquiries";
}

const PRIMARY: NavItem[] = [
  { path: "", label: "대시보드", icon: LayoutDashboard, permission: "dashboard" },
  { path: "/programs", label: "프로그램", icon: BookOpen, permission: "program.read" },
  { path: "/approvals", label: "승인 대기", icon: ClipboardCheck, permission: "approval.queue", badgeKey: "queue" },
  { path: "/curation", label: "배너·메인 큐레이션", icon: GalleryHorizontalEnd, permission: "curation" },
  { path: "/taxonomy", label: "택소노미", icon: Tags, permission: "taxonomy" },
  { path: "/members", label: "회원·수강", icon: Users, permission: "member.read", badgeKey: "signups" },
  { path: "/reviews", label: "후기 관리", icon: MessageSquareWarning, permission: "review", badgeKey: "reports" },
  { path: "/sessions", label: "실습·오프라인 일정", icon: CalendarDays, permission: "session" },
  { path: "/pathways", label: "커리어 패스웨이", icon: Route, permission: "pathway" },
  // 인증 정책(효력·평가 기준)은 미확정 — 정책 값은 전부 인증 과정 데이터로 어드민에서 설정
  { path: "/credentials", label: "인증 심사", icon: BadgeCheck, permission: "credential.read", badgeKey: "credentials" },
  { path: "/partners", label: "파트너", icon: Handshake, permission: "partner.manage" },
  { path: "/partner-console", label: "파트너 콘솔", icon: LayoutGrid, permission: "partner.console" },
  { path: "/pages", label: "문서 관리", icon: FileSignature, permission: "pages" },
  { path: "/site-settings", label: "사이트 설정", icon: Settings2, permission: "site.manage" },
  { path: "/feedback", label: "피드백", icon: MessageSquareText, permission: "feedback" },
  { path: "/roles", label: "역할·권한", icon: ShieldCheck, permission: "role.manage" },
  { path: "/audit", label: "감사 로그", icon: ScrollText, permission: "audit" },
];

const COMMERCE: NavItem[] = [
  { path: "/organizations", label: "기관", icon: Building2, permission: "commerce" },
  { path: "/orders", label: "주문", icon: ShoppingCart, permission: "commerce" },
  { path: "/pass-plans", label: "패스 요금제", icon: Ticket, permission: "commerce" },
  { path: "/invoices", label: "청구서", icon: FileText, permission: "commerce" },
];

// 웹사이트(홈페이지 apps/web) 작업 영역 — 경로는 /web/…
const WEBSITE: NavItem[] = [
  { path: "/web", label: "웹사이트 대시보드", icon: Globe, permission: ["web.inquiries", "web.content"] },
  { path: "/web/inquiries", label: "문의 CRM", icon: Inbox, permission: "web.inquiries", badgeKey: "inquiries" },
  { path: "/web/blog", label: "블로그", icon: Newspaper, permission: "web.content" },
  { path: "/web/faq", label: "자주 묻는 질문", icon: HelpCircle, permission: "web.content" },
  { path: "/web/reviews", label: "이용자 후기", icon: MessageSquareQuote, permission: "web.content" },
  { path: "/web/hero", label: "메인 히어로", icon: Images, permission: "web.content" },
  { path: "/web/settings", label: "사이트 정보", icon: Settings2, permission: "web.settings" },
  { path: "/feedback", label: "피드백", icon: MessageSquareText, permission: "feedback" },
];

export function Sidebar({
  locale,
  permissions,
  roleName,
  isPartner,
  userName,
  userEmail,
  counts,
}: {
  locale: string;
  /** DB 기준 실효 권한 — 메뉴 노출은 이것만 본다 */
  permissions: Permission[];
  roleName: string;
  isPartner: boolean;
  userName: string;
  userEmail: string;
  counts: { queue: number; signups: number; reports: number; credentials?: number; inquiries?: number };
}) {
  const pathname = usePathname();
  const base = `/${locale}`;

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
  const website = visible(WEBSITE);

  // 작업 영역은 URL 로 정한다 (/web/… = 웹사이트). 한쪽 권한만 있으면 그쪽만 보인다
  const hasAcademy = primary.length + commerce.length > 0;
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
  const academyHome = base + ([...primary, ...commerce].find((i) => !i.phase)?.path ?? "");
  const webHome = base + (website[0]?.path ?? "/web");

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    if (item.phase) {
      return (
        <li key={item.label}>
          <span
            aria-disabled="true"
            title={item.note ?? `${item.phase} 오픈 예정`}
            className="flex h-8 cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 text-caption text-zinc-600"
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">{item.label}</span>
            <span className="rounded-full bg-amber-500/90 px-1.5 py-px text-micro font-semibold text-white">{item.phase}</span>
          </span>
        </li>
      );
    }
    const active = isActive(item.path);
    const count = item.badgeKey ? (counts[item.badgeKey] ?? 0) : 0;
    return (
      <li key={item.path || "home"}>
        <Link
          href={base + item.path}
          aria-current={active ? "page" : undefined}
          className={cx(
            "relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-caption transition-colors",
            active ? "bg-side-hover font-medium text-white" : "text-side-fg hover:bg-side-hover/60 hover:text-zinc-100",
          )}
        >
          {active && <span className="absolute -left-3 top-1.5 bottom-1.5 w-[3px] rounded-r bg-brand" aria-hidden />}
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="flex-1">{item.label}</span>
          {count > 0 && (
            <span className="tabular rounded-full bg-zinc-700 px-1.5 text-micro font-medium text-zinc-100">{count}</span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <aside className="flex h-screen w-[232px] shrink-0 flex-col bg-side text-side-fg">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-caption font-bold text-white">B</span>
        <div className="leading-tight">
          <p className="text-caption font-semibold text-white">{workspace === "web" ? "Bayada Website" : "Bayada Academy"}</p>
          <p className="text-micro text-zinc-500">{isPartner ? "Partner Console" : "Admin Console"}</p>
        </div>
      </div>

      {hasAcademy && website.length > 0 && (
        <div className="mx-3 mb-3 mt-1">
          <p className="mb-1.5 px-1 text-micro font-medium text-zinc-400">관리할 사이트</p>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-black/30 p-1 ring-1 ring-white/10" role="group" aria-label="관리할 사이트">
            {(
              [
                { key: "academy", label: "아카데미", href: academyHome, icon: GraduationCap },
                { key: "web", label: "웹사이트", href: webHome, icon: Globe },
              ] as const
            ).map((w) => (
              <Link
                key={w.key}
                href={w.href}
                aria-current={workspace === w.key ? "true" : undefined}
                className={cx(
                  "flex h-10 items-center justify-center gap-1.5 rounded-md text-body-sm font-semibold transition-colors",
                  workspace === w.key ? "bg-brand text-white shadow-sm" : "text-zinc-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <w.icon className="h-4 w-4" aria-hidden />
                {w.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="주 메뉴">
        {workspace === "web" ? (
          <ul className="flex flex-col gap-0.5">{website.map(renderItem)}</ul>
        ) : (
          <>
            <ul className="flex flex-col gap-0.5">{primary.map(renderItem)}</ul>
            {commerce.length > 0 && (
              <>
                <p className="mb-1 mt-5 px-2.5 text-micro font-medium uppercase tracking-wider text-zinc-600">B2B · 결제</p>
                <ul className="flex flex-col gap-0.5">{commerce.map(renderItem)}</ul>
              </>
            )}
          </>
        )}
      </nav>

      <div className="border-t border-side-line p-3">
        <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-caption font-semibold text-zinc-100">
            {userName.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-caption font-medium text-zinc-100">{userName}</p>
            <p className="truncate text-micro text-zinc-500" title={userEmail}>
              {roleName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: `/${locale}/auth/login` })}
            className="rounded-md p-1.5 text-zinc-500 hover:bg-side-hover hover:text-zinc-100"
            aria-label="로그아웃"
            title="로그아웃"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
