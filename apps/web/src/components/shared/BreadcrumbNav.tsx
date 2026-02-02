import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  locale: string;
}

export function BreadcrumbNav({ items, locale }: BreadcrumbNavProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        <li>
          <Link
            href={`/${locale}`}
            className="text-[color:var(--muted)] transition-colors hover:text-[color:var(--fg)]"
          >
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-[color:var(--muted)]" />
            {item.href ? (
              <Link
                href={`/${locale}${item.href}`}
                className="text-[color:var(--muted)] transition-colors hover:text-[color:var(--fg)]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-[color:var(--fg)]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
