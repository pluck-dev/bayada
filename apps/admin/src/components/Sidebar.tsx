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
  Palette,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { can, type Permission } from "@/lib/rbac";
import { cx } from "./ui";
import { Segmented } from "./ui/kit/Segmented";

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
  { path: "/web", label: "웹사이트 대시보드", icon: Globe, permission: ["web.inquiries", "web.content"] },
  { path: "/web/inquiries", label: "문의 CRM", icon: Inbox, permission: "web.inquiries", badgeKey: "inquiries", group: "고객" },
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

export function Sidebar({
  locale,
  permissions,
  roleName,
  isPartner,
  isSuperAdmin,
  userName,
  userEmail,
  counts,
}: {
  locale: string;
  /** DB 기준 실효 권한 — 메뉴 노출은 이것만 본다 */
  permissions: Permission[];
  roleName: string;
  isPartner: boolean;
  /** 스타일 가이드는 Super Admin(ADMIN)에게만 */
  isSuperAdmin?: boolean;
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

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const count = item.badgeKey ? (counts[item.badgeKey] ?? 0) : 0;
    return (
      <li key={item.path || "home"}>
        <Link
          href={base + item.path}
          aria-current={active ? "page" : undefined}
          className={cx(
            "group/nav relative flex h-10 items-center gap-2.5 rounded-full px-3.5 text-[13.5px] font-bold tracking-[-0.01em] transition-colors duration-150",
            active
              ? "bg-brand text-white shadow-[0_8px_20px_-10px_rgb(227_27_52/0.9)]"
              : "text-side-fg hover:bg-side-hover hover:text-white",
          )}
        >
          <Icon className={cx("size-[18px] shrink-0", active ? "text-white" : "text-white/45 group-hover/nav:text-white/85")} strokeWidth={2.1} aria-hidden />
          <span className="flex-1 truncate">{item.label}</span>
          {count > 0 && (
            <span
              className={cx(
                "num inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold",
                active ? "bg-white text-brand" : "bg-brand text-white",
              )}
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Link>
      </li>
    );
  };

  const renderGroups = (items: NavItem[]) =>
    groupItems(items).map((g, i) => (
      <div key={`${g.group}-${i}`}>
        {g.group && <p className="mb-1.5 px-3.5 text-[11px] font-bold tracking-[0.02em] text-side-label">{g.group}</p>}
        <ul className="flex flex-col gap-0.5">{g.items.map(renderItem)}</ul>
      </div>
    ));

  return (
    <aside className="scroll-dark sticky top-0 flex h-screen w-[256px] shrink-0 flex-col overflow-y-auto bg-side px-3 pb-4 pt-6 text-side-fg">
      <Link href={workspace === "web" ? webHome : academyHome} className="mb-6 flex items-center gap-2 px-3.5" aria-label="BAYADA 관리자 홈">
        <span className="text-[22px] font-black leading-none tracking-[-0.045em] text-white">
          BAYADA<span className="text-brand">.</span>
        </span>
        <span className="rounded-full bg-brand px-2 py-[3px] text-[10.5px] font-extrabold leading-none tracking-[0.02em] text-white">
          {isPartner ? "PARTNER" : "ADMIN"}
        </span>
      </Link>

      {hasAcademy && website.length > 0 && (
        <div className="mb-6 px-1">
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
      )}

      <nav className="flex flex-1 flex-col gap-5" aria-label="주 메뉴">
        {workspace === "web" ? renderGroups(website) : renderGroups([...primary, ...commerce, ...system])}
      </nav>

      <div className="mt-6 border-t border-side-line pt-4">
        <div className="flex items-center gap-2.5 rounded-2xl px-2 py-1.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-side-raised text-[13px] font-extrabold text-white">
            {userName.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-bold text-white">
              {userName} <span className="font-medium text-side-label">님</span>
            </p>
            <p className="mt-0.5 truncate text-[11.5px] text-side-label" data-tip={userEmail}>
              {roleName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: `/${locale}/auth/login` })}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-side-label transition-colors hover:bg-side-hover hover:text-white"
            aria-label="로그아웃"
            data-tip="로그아웃"
          >
            <LogOut className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  );
}
