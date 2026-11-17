"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function ProjectClientShell({ locale, name, children }: {
  locale: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex h-12 items-center gap-3 border-b border-line px-4 text-xs">
        <Link className="font-bold" href={`/${locale}/workspace`}>BAYADA 프로젝트 협의</Link>
        <span className="ml-auto max-w-40 truncate text-muted">{name}</span>
        <button onClick={() => signOut({ callbackUrl: `/${locale}/auth/login` })}>로그아웃</button>
      </header>
      {children}
    </div>
  );
}
