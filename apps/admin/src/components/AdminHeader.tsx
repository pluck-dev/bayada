"use client";

import { Avatar } from "@bayada/ui";
import { LogOut, Bell } from "lucide-react";
import { useDictionary } from "./DictionaryProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface AdminHeaderProps {
  userName?: string;
  userEmail?: string;
}

export function AdminHeader({
  userName = "관리자",
  userEmail = "admin@bayada.co.kr",
}: AdminHeaderProps) {
  const dict = useDictionary();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[color:var(--border)] bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-[color:var(--fg)]">
          {dict.admin.dashboard}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* 언어 선택 */}
        <LanguageSwitcher />

        {/* 알림 */}
        <button className="relative rounded-lg p-2 text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#ce0e2d]" />
        </button>

        {/* 사용자 정보 */}
        <div className="flex items-center gap-3">
          <Avatar fallback={userName} size="sm" />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-[color:var(--fg)]">
              {userName}
            </p>
            <p className="text-xs text-[color:var(--muted)]">{userEmail}</p>
          </div>
        </div>

        {/* 로그아웃 */}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="rounded-lg p-2 text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]"
            title={dict.common.logout}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </div>
    </header>
  );
}
