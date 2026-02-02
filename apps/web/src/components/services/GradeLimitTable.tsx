import type { Dictionary } from "@bayada/shared/i18n";

interface GradeLimitRow {
  grade: string;
  limit: number;
}

interface GradeLimitTableProps {
  dict: Dictionary;
  rows: GradeLimitRow[];
}

export function GradeLimitTable({ dict, rows }: GradeLimitTableProps) {
  const t = dict.web.services;

  return (
    <div className="overflow-x-auto rounded-xl border border-[color:var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[color:var(--surface)]">
            <th className="px-4 py-3 text-left font-semibold text-[color:var(--fg)]">{t.grade}</th>
            <th className="px-4 py-3 text-right font-semibold text-[color:var(--fg)]">{t.limit}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-[color:var(--border)]">
              <td className="px-4 py-3 font-medium text-[color:var(--fg)]">{row.grade}</td>
              <td className="px-4 py-3 text-right font-semibold text-[#ce0e2d]">
                {row.limit.toLocaleString()}원
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
