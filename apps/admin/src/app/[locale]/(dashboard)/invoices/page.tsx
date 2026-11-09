import {
  Badge,
  EmptyState,
  PageHeader,
  buttonClass,
  cx,
  tableClass,
  tableWrap,
  tdClass,
  thClass,
  trClass,
} from "@/components/ui";
import type { Tone } from "@/lib/labels";
import { formatPrice } from "@bayada/shared";
import { invoiceService } from "@/lib/services";
import { SearchFilter } from "@/components/SearchFilter";
import { Pager } from "@/components/Pager";
import Link from "next/link";

type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "작성중",
  SENT: "발송됨",
  PAID: "결제완료",
  OVERDUE: "연체",
  CANCELLED: "취소",
};

const statusTone: Record<InvoiceStatus, Tone> = {
  DRAFT: "zinc",
  SENT: "blue",
  PAID: "green",
  OVERDUE: "red",
  CANCELLED: "zinc",
};

const statusFilters = [
  { label: "작성중", value: "DRAFT" },
  { label: "발송됨", value: "SENT" },
  { label: "결제완료", value: "PAID" },
  { label: "연체", value: "OVERDUE" },
];

interface InvoiceRow {
  [key: string]: unknown;
  id: string;
  invoiceNo: string;
  organization: string;
  contactEmail: string;
  items: string;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedAt: string;
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search ?? "";
  const status = params.status as InvoiceStatus | undefined;

  const result = await invoiceService.list({
    page,
    limit: 20,
    search: search || undefined,
    status,
  });

  const invoices: InvoiceRow[] = result.items.map((inv) => {
    const i = inv as Record<string, unknown>;
    const order = i.order as Record<string, unknown> | null;
    const org = order?.organization as { name: string } | null;
    const user = order?.user as { email: string } | null;
    const orderItems = (order?.items as Array<{ course?: { title: string } }>) ?? [];
    const firstItem = orderItems[0]?.course?.title ?? "-";
    const itemLabel = orderItems.length > 1
      ? `${firstItem} 외 ${orderItems.length - 1}건`
      : firstItem;

    return {
      id: i.id as string,
      invoiceNo: (i.invoiceNo as string) ?? `INV-${(i.id as string).slice(0, 8)}`,
      organization: org?.name ?? "-",
      contactEmail: user?.email ?? "-",
      items: itemLabel,
      amount: i.totalAmount as number,
      tax: (i.taxAmount as number) ?? 0,
      total: (i.totalAmount as number) + ((i.taxAmount as number) ?? 0),
      status: (i.status as InvoiceStatus) ?? "DRAFT",
      dueDate: i.dueDate ? new Date(i.dueDate as string).toLocaleDateString("ko-KR") : "-",
      issuedAt: new Date(i.createdAt as string).toLocaleDateString("ko-KR"),
    };
  });

  return (
    <>
      <PageHeader title="청구서 관리" description="B2B 기관 고객의 청구서를 관리합니다." />

      <div className="mb-4">
        <SearchFilter searchPlaceholder="청구서번호 또는 기관명으로 검색" filterKey="status" filters={statusFilters} />
      </div>

      <div className={tableWrap}>
        {invoices.length === 0 ? (
          <EmptyState title="청구서가 없습니다" description="기관 주문에서 청구서를 발행하면 여기에 쌓입니다." />
        ) : (
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>청구서번호</th>
                <th className={thClass}>기관</th>
                <th className={thClass}>항목</th>
                <th className={cx(thClass, "text-right")}>총액 (VAT 포함)</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>납부기한</th>
                <th className={cx(thClass, "w-px")} aria-label="작업" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((row) => (
                <tr key={row.id} className={trClass}>
                  <td className={cx(tdClass, "font-mono text-[12px] font-semibold")}>{row.invoiceNo}</td>
                  <td className={tdClass}>
                    <p className="font-bold text-ink">{row.organization}</p>
                    <p className="text-[12px] text-muted">{row.contactEmail}</p>
                  </td>
                  <td className={cx(tdClass, "text-muted")}>{row.items}</td>
                  <td className={cx(tdClass, "num text-right")}>
                    <p className="font-bold">{formatPrice(row.total)}</p>
                    <p className="text-[12px] text-muted">
                      공급가 {formatPrice(row.amount)} + VAT {formatPrice(row.tax)}
                    </p>
                  </td>
                  <td className={tdClass}>
                    <Badge tone={statusTone[row.status]} dot>
                      {invoiceStatusLabels[row.status]}
                    </Badge>
                  </td>
                  <td className={cx(tdClass, "num text-muted")}>{row.dueDate}</td>
                  <td className={tdClass}>
                    <Link href={`/invoices/${row.id}`} className={buttonClass("secondary", "sm")}>
                      상세
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pager page={result.page} pages={result.totalPages} total={result.total} />
    </>
  );
}
