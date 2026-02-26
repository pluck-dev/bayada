"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@bayada/ui";

interface ComparisonTableProps {
  title?: string;
  headers: string[];
  rows: { feature: string; values: (boolean | string)[] }[];
  highlightColumn?: number;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function ComparisonTable({
  title,
  headers,
  rows,
  highlightColumn,
}: ComparisonTableProps) {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-12 text-center font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            {title}
          </motion.h2>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="overflow-x-auto rounded-xl border border-gray-200"
        >
          <table className="w-full min-w-[600px] text-left">
            {/* 헤더 */}
            <thead>
              <tr className="border-b border-gray-200 bg-[#f0f4f7]">
                <th className="sticky left-0 bg-[#f0f4f7] px-6 py-4 text-sm font-semibold text-black/[0.87]">
                  기능
                </th>
                {headers.map((header, i) => (
                  <th
                    key={header}
                    className={cn(
                      "px-6 py-4 text-center text-sm font-semibold",
                      highlightColumn === i
                        ? "bg-[#ce0e2d] text-white"
                        : "text-black/[0.87]"
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* 바디 */}
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={row.feature}
                  className={cn(
                    "border-b border-gray-100 transition-colors hover:bg-gray-50/50",
                    rowIndex % 2 === 1 && "bg-gray-50/30"
                  )}
                >
                  <td className="sticky left-0 bg-white px-6 py-4 text-sm font-medium text-black/[0.87]">
                    {row.feature}
                  </td>
                  {row.values.map((value, colIndex) => (
                    <td
                      key={`${row.feature}-${colIndex}`}
                      className={cn(
                        "px-6 py-4 text-center",
                        highlightColumn === colIndex && "bg-[#ce0e2d]/5"
                      )}
                    >
                      {typeof value === "boolean" ? (
                        value ? (
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-gray-300" />
                        )
                      ) : (
                        <span className="text-sm text-black/[0.87]">
                          {value}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
