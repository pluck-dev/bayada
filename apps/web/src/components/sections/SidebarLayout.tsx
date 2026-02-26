import { type ReactNode } from "react";

interface SidebarLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function SidebarLayout({ children, sidebar }: SidebarLayoutProps) {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
          {/* 메인 콘텐츠 */}
          <div className="min-w-0">{children}</div>

          {/* 사이드바 */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {sidebar}
          </aside>
        </div>
      </div>
    </section>
  );
}
