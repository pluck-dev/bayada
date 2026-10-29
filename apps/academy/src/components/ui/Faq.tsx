import { Plus } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex items-center justify-between gap-4 px-6 py-5 text-[15px] font-semibold text-ink transition-colors hover:bg-surface">
            {item.q}
            <Plus className="accordion-icon h-5 w-5 shrink-0 text-muted transition-transform duration-200" aria-hidden />
          </summary>
          <p className="px-6 pb-6 text-sm leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
