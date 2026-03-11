"use client";

import Link from "next/link";
import type { MegaMenuItem } from "@/types";
import { getLabel, getTitle, getDescription } from "@/data/navigation";

interface MegaMenuProps {
  item: MegaMenuItem;
  locale: string;
  onClose: () => void;
}

export function MegaMenu({ item, locale, onClose }: MegaMenuProps) {
  if (!item.children || item.children.length === 0) return null;

  return (
    <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
      <div className="min-w-[500px] rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-medium)]">
        <div className={`grid gap-8 ${item.children.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {item.children.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                {getTitle(group, locale)}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((link) => (
                  <Link
                    key={link.href}
                    href={`/${locale}${link.href}`}
                    className="group rounded-lg px-3 py-2.5 transition-colors hover:bg-[color:var(--surface)]"
                    onClick={onClose}
                  >
                    <span className="text-sm font-medium text-[color:var(--fg)] transition-colors group-hover:text-[#ce0e2d]">
                      {getLabel(link, locale)}
                    </span>
                    {getDescription(link, locale) && (
                      <p className="mt-0.5 text-xs text-[color:var(--muted)]">
                        {getDescription(link, locale)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
