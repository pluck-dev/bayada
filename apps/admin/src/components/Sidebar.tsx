"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  FileText,
  LogOut,
  MessageSquareWarning,
  CalendarDays,
  FileSignature,
  LayoutGrid,
  Route,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { can, type AdminRole, type Permission } from "@/lib/rbac";
import { ROLE_LABEL } from "@/lib/labels";
import { cx } from "./ui";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
  /** 2차 이후 기능 — 라우트 없이 비활성 표시 */
  phase?: string;
  /** 비활성 항목 툴팁 (기본: "{phase} 오픈 예정") */
  note?: string;
  badgeKey?: "queue" | "signups" | "reports";
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
  // 인증 모델·효력이 고객사 확인 대기(17_확인필요 "인증 효력")라 만들지 않는다
  { path: "", label: "인증 심사", icon: BadgeCheck, phase: "2차", note: "정책 확정 후 개발 (인증 효력·평가 기준 미정)" },
  { path: "/partners", label: "파트너", icon: Handshake, permission: "partner.manage" },
  { path: "/partner-console", label: "파트너 콘솔", icon: LayoutGrid, permission: "partner.console" },
  { path: "/pages", label: "문서 관리", icon: FileSignature, permission: "pages" },
  { path: "/audit", label: "감사 로그", icon: ScrollText, permission: "audit" },
];

const COMMERCE: NavItem[] = [
  { path: "/organizations", label: "기관", icon: Building2, permission: "commerce" },
  { path: "/orders", label: "주문", icon: ShoppingCart, permission: "commerce" },
  { path: "/invoices", label: "청구서", icon: FileText, permission: "commerce" },
];

export function Sidebar({
  locale,
  role,
  userName,
  userEmail,
  counts,
}: {
  locale: string;
  role: AdminRole;
  userName: string;
  userEmail: string;
  counts: { queue: number; signups: number; reports: number };
}) {
  const pathname = usePathname();
  const base = `/${locale}`;

  const isActive = (path: string) => {
    const href = base + path;
    return path === "" ? pathname === base : pathname === href || pathname.startsWith(href + "/");
  };

  // 2차 예정 항목은 운영 역할에게만 보여 준다 (파트너 콘솔에는 불필요)
  const visible = (items: NavItem[]) =>
    items.filter((i) => (i.phase ? role !== "PARTNER_ADMIN" : !!i.permission && can(role, i.permission)));
  const primary = visible(PRIMARY);
  const commerce = visible(COMMERCE);

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    if (item.phase) {
      return (
        <li key={item.label}>
          <span
            aria-disabled="true"
            title={item.note ?? `${item.phase} 오픈 예정`}
            className="flex h-8 cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 text-[13px] text-zinc-600"
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">{item.label}</span>
            <span className="rounded-full bg-amber-500/90 px-1.5 py-px text-[10px] font-semibold text-white">{item.phase}</span>
          </span>
        </li>
      );
    }
    const active = isActive(item.path);
    const count = item.badgeKey ? counts[item.badgeKey] : 0;
    return (
      <li key={item.path || "home"}>
        <Link
          href={base + item.path}
          aria-current={active ? "page" : undefined}
          className={cx(
            "relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors",
            active ? "bg-side-hover font-medium text-white" : "text-side-fg hover:bg-side-hover/60 hover:text-zinc-100",
          )}
        >
          {active && <span className="absolute -left-3 top-1.5 bottom-1.5 w-[3px] rounded-r bg-brand" aria-hidden />}
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="flex-1">{item.label}</span>
          {count > 0 && (
            <span className="tabular rounded-full bg-zinc-700 px-1.5 text-[11px] font-medium text-zinc-100">{count}</span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <aside className="flex h-screen w-[232px] shrink-0 flex-col bg-side text-side-fg">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-[13px] font-bold text-white">B</span>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold text-white">Bayada Academy</p>
          <p className="text-[11px] text-zinc-500">{role === "PARTNER_ADMIN" ? "Partner Console" : "Admin Console"}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="주 메뉴">
        <ul className="flex flex-col gap-0.5">{primary.map(renderItem)}</ul>
        {commerce.length > 0 && (
          <>
            <p className="mb-1 mt-5 px-2.5 text-[11px] font-medium uppercase tracking-wider text-zinc-600">B2B · 결제</p>
            <ul className="flex flex-col gap-0.5">{commerce.map(renderItem)}</ul>
          </>
        )}
      </nav>

      <div className="border-t border-[color:var(--side-border)] p-3">
        <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-[12px] font-semibold text-zinc-100">
            {userName.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[12.5px] font-medium text-zinc-100">{userName}</p>
            <p className="truncate text-[11px] text-zinc-500" title={userEmail}>
              {ROLE_LABEL[role]}
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
