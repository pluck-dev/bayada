"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { cn } from "@bayada/ui";

// 헤더 회원 메뉴 — 페이지는 정적 생성이라 서버에서 쿠키를 읽지 않고, 브라우저가 /api/auth/session 으로 로그인 상태를 받아 그린다.
const LINKS = [
  { href: "/my-page", label: "마이페이지 홈" },
  { href: "/my-page/inquiries", label: "내 상담·문의" },
  { href: "/my-page/settings", label: "회원 정보·설정" },
];

export function AccountMenu({ locale }: { locale: string }) {
  const { data, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status === "loading") return <span className="h-8 w-[76px] animate-pulse rounded-full bg-gray-100" aria-hidden />;

  if (!data?.user) {
    return (
      <Link
        href={`/${locale}/auth/login`}
        className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#ce0e2d] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#a50b24]"
      >
        <UserRound className="size-3.5" aria-hidden />
        로그인
      </Link>
    );
  }

  const name = data.user.name || data.user.email || "회원";
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-full border px-2 pr-2.5 text-xs font-semibold transition-colors",
          open ? "border-[#ce0e2d] text-[#ce0e2d]" : "border-gray-200 text-black/80 hover:border-gray-300",
        )}
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-[#ce0e2d] text-[10px] font-bold text-white">{name.slice(0, 1)}</span>
        <span className="max-w-[96px] truncate">{name}</span>
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div role="menu" className="member-pop absolute right-0 top-10 z-50 w-56 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
          <p className="truncate px-3 pb-2 pt-1.5 text-xs text-gray-500">{data.user.email}</p>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              role="menuitem"
              href={`/${locale}${l.href}`}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm text-black/80 hover:bg-[#f0f4f7]"
            >
              {l.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-gray-100" />
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-black/80 hover:bg-[#f0f4f7]"
          >
            <LogOut className="size-4" aria-hidden />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

/** 모바일 메뉴 하단 — 로그인/마이페이지·로그아웃 */
export function MobileAccount({ locale, onClose }: { locale: string; onClose: () => void }) {
  const { data, status } = useSession();
  if (status === "loading") return <div className="h-12 animate-pulse rounded-xl bg-gray-100" aria-hidden />;
  if (!data?.user) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/${locale}/auth/login`}
          onClick={onClose}
          className="block rounded-xl border border-[color:var(--border)] px-4 py-3 text-center text-sm font-medium text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
        >
          로그인
        </Link>
        <Link
          href={`/${locale}/auth/register`}
          onClick={onClose}
          className="block rounded-xl border border-[color:var(--border)] px-4 py-3 text-center text-sm font-medium text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
        >
          회원가입
        </Link>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/${locale}/my-page`}
        onClick={onClose}
        className="flex flex-1 items-center gap-2 rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm font-medium text-[color:var(--fg)] hover:bg-[color:var(--surface)]"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-[#ce0e2d] text-[11px] font-bold text-white">{(data.user.name || "회").slice(0, 1)}</span>
        <span className="truncate">{data.user.name ?? data.user.email} · 마이페이지</span>
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: `/${locale}` })}
        className="rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm font-medium text-[color:var(--muted)] hover:bg-[color:var(--surface)]"
      >
        로그아웃
      </button>
    </div>
  );
}
