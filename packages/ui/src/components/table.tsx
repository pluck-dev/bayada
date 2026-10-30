import * as React from "react";

import { cn } from "../lib/cn";

/**
 * 표. density: compact(어드민 기본 — 32px 행) / comfortable(학습자 화면 — 48px 행).
 * 세로선 없음, 머리글은 옅은 회색 띠, 행 구분은 아주 옅은 선.
 */
type Density = "compact" | "comfortable";
// 서버 컴포넌트에서도 쓰므로 context 대신 data-density + group 선택자로 셀 여백을 바꾼다

export function TableWrap({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-auto rounded-xl border border-line bg-canvas", className)} {...props} />;
}

export function Table({
  density = "compact",
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement> & { density?: Density }) {
  return (
    <table
      data-density={density}
      className={cn("group/table w-full border-collapse", density === "compact" ? "text-caption" : "text-body-sm", className)}
      {...props}
    />
  );
}

export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}
export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function Tr({ className, interactive = true, ...props }: React.HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return <tr className={cn(interactive && "hover:bg-surface", className)} {...props} />;
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "sticky top-0 z-[1] whitespace-nowrap border-b border-line bg-surface px-3 py-2 text-left text-micro font-semibold text-muted group-data-[density=comfortable]/table:px-4 group-data-[density=comfortable]/table:py-3",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "border-b border-line-soft px-3 py-2 align-middle text-ink group-data-[density=comfortable]/table:px-4 group-data-[density=comfortable]/table:py-3.5",
        className,
      )}
      {...props}
    />
  );
}

/** 클래스 문자열이 필요한 곳(기존 마크업 유지)용 */
export const tableClasses = {
  wrap: "overflow-auto rounded-xl border border-line bg-canvas",
  table: "w-full border-collapse text-caption",
  th: "sticky top-0 z-[1] whitespace-nowrap border-b border-line bg-surface px-3 py-2 text-left text-micro font-semibold text-muted",
  td: "whitespace-nowrap border-b border-line-soft px-3 py-2 align-middle",
  tr: "hover:bg-surface",
};

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = "id",
  emptyMessage = "데이터가 없습니다.",
  density = "compact",
  className,
}: {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  emptyMessage?: React.ReactNode;
  density?: Density;
  className?: string;
}) {
  return (
    <TableWrap className={className}>
      <Table density={density}>
        <THead>
          <tr>
            {columns.map((c) => (
              <Th key={c.key} className={c.className}>
                {c.header}
              </Th>
            ))}
          </tr>
        </THead>
        <TBody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <Tr key={String(row[keyField] ?? i)}>
                {columns.map((c) => (
                  <Td key={c.key} className={c.className}>
                    {c.render ? c.render(row) : String(row[c.key] ?? "")}
                  </Td>
                ))}
              </Tr>
            ))
          )}
        </TBody>
      </Table>
    </TableWrap>
  );
}
