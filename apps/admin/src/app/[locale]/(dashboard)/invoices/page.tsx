import { Badge, DataTable, PageHeader, buttonVariants, type BadgeTone, type Column } from "@bayada/ui";
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

const statusTone: Record<InvoiceStatus, BadgeTone> = {
  DRAFT: "neutral",
  SENT: "info",
  PAID: "success",
  OVERDUE: "danger",
  CANCELLED: "neutral",
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

const columns: Column<InvoiceRow>[] = [
  {
    key: "invoiceNo",
    header: "청구서번호",
    render: (row) => (
      <span className="font-mono text-micro">{row.invoiceNo}</span>
    ),
  },
  {
    key: "organization",
    header: "기관",
    render: (row) => (
      <div>
        <p className="font-medium text-ink">
          {row.organization}
        </p>
        <p className="text-micro text-muted">{row.contactEmail}</p>
      </div>
    ),
  },
  {
    key: "items",
    header: "항목",
    render: (row) => (
      <span className="text-muted">{row.items}</span>
    ),
  },
  {
    key: "total",
    header: "총액 (VAT 포함)",
    render: (row) => (
      <div>
        <p className="font-medium">{formatPrice(row.total)}</p>
        <p className="text-micro text-muted">
          공급가 {formatPrice(row.amount)} + VAT {formatPrice(row.tax)}
        </p>
      </div>
    ),
  },
  {
    key: "status",
    header: "상태",
    render: (row) => (
      <Badge tone={statusTone[row.status]} dot>
        {invoiceStatusLabels[row.status]}
      </Badge>
    ),
  },
  {
    key: "dueDate",
    header: "납부기한",
  },
  {
    key: "actions",
    header: "",
    render: (row) => (
      <div className="flex gap-1">
        <Link href={`/invoices/${row.id}`} className={buttonVariants({ variant: "ghost", size: "xs" })}>
          상세
        </Link>
      </div>
    ),
  },
];

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
    <div className="space-y-4">
      <PageHeader size="compact" title="청구서 관리" description="B2B 기관 고객의 청구서를 관리합니다." />

      {/* 필터/검색 */}
      <SearchFilter
        searchPlaceholder="청구서번호 또는 기관명으로 검색..."
        filterKey="status"
        filters={statusFilters}
      />

      {/* 데이터 테이블 */}
      <DataTable<InvoiceRow>
        columns={columns}
        data={invoices}
        keyField="id"
      />

      <Pager page={result.page} pages={result.totalPages} total={result.total} />
    </div>
  );
}
