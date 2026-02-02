import type { Dictionary } from "@bayada/shared/i18n";

interface PricingRow {
  duration: string;
  selfPay15: number;
  nhis85: number;
  total: number;
}

interface PricingTableProps {
  dict: Dictionary;
  rows: PricingRow[];
}

export function PricingTable({ dict, rows }: PricingTableProps) {
  const t = dict.web.services;

  return (
    <div className="overflow-x-auto rounded-xl border border-[color:var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[color:var(--surface)]">
            <th className="px-4 py-3 text-left font-semibold text-[color:var(--fg)]">{t.duration}</th>
            <th className="px-4 py-3 text-right font-semibold text-[color:var(--fg)]">{t.selfPay}</th>
            <th className="px-4 py-3 text-right font-semibold text-[color:var(--fg)]">{t.nhis}</th>
            <th className="px-4 py-3 text-right font-semibold text-[#ce0e2d]">{t.total}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-[color:var(--border)]">
              <td className="px-4 py-3 font-medium text-[color:var(--fg)]">{row.duration}</td>
              <td className="px-4 py-3 text-right text-[color:var(--muted)]">
                {row.selfPay15.toLocaleString()}원
              </td>
              <td className="px-4 py-3 text-right text-[color:var(--muted)]">
                {row.nhis85.toLocaleString()}원
              </td>
              <td className="px-4 py-3 text-right font-semibold text-[color:var(--fg)]">
                {row.total.toLocaleString()}원
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
