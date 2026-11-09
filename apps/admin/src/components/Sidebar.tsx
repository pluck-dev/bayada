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
  type LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { can, type Permission } from "@/lib/rbac";
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
  badgeKey?: "queue" | "signups" | "reports" | "credentials";
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
  counts: { queue: number; signups: number; reports: number; credentials?: number };
}) {
  const pathname = usePathname();
  const base = `/${locale}`;

  const isActive = (path: string) => {
    const href = base + path;
    return path === "" ? pathname === base : pathname === href || pathname.startsWith(href + "/");
  };

  // 2차 예정 항목은 운영 역할에게만 보여 준다 (파트너 콘솔에는 불필요)
  const visible = (items: NavItem[]) =>
    items.filter((i) => (i.phase ? !isPartner : !!i.permission && can({ permissions }, i.permission)));
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
          <p className="text-caption font-semibold text-white">Bayada Academy</p>
          <p className="text-micro text-zinc-500">{isPartner ? "Partner Console" : "Admin Console"}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="주 메뉴">
        <ul className="flex flex-col gap-0.5">{primary.map(renderItem)}</ul>
        {commerce.length > 0 && (
          <>
            <p className="mb-1 mt-5 px-2.5 text-micro font-medium uppercase tracking-wider text-zinc-600">B2B · 결제</p>
            <ul className="flex flex-col gap-0.5">{commerce.map(renderItem)}</ul>
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
