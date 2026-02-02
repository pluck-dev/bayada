import { Check } from "lucide-react";

interface ServiceListProps {
  items: string[];
  title?: string;
}

export function ServiceList({ items, title }: ServiceListProps) {
  return (
    <div>
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-[color:var(--fg)]">{title}</h3>
      )}
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-[color:var(--muted)]">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
              <Check className="h-3 w-3 text-[#16a34a]" />
            </div>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
