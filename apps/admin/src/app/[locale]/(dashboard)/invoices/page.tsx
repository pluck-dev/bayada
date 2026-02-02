import { Search, Download, Plus, Send } from "lucide-react";
import { Button, Badge, DataTable, type Column, Input } from "@bayada/ui";
import { formatPrice } from "@bayada/shared";

// 청구서 상태
type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "작성중",
  SENT: "발송됨",
  PAID: "결제완료",
  OVERDUE: "연체",
  CANCELLED: "취소",
};

const statusBadgeVariant: Record<InvoiceStatus, "secondary" | "info" | "success" | "error" | "warning"> = {
  DRAFT: "secondary",
  SENT: "info",
  PAID: "success",
  OVERDUE: "error",
  CANCELLED: "warning",
};

// 플레이스홀더 데이터
const invoices = [
  {
    id: "1",
    invoiceNo: "INV-20250201-001",
    organization: "(주)헬스케어코리아",
    contactEmail: "jung@healthcorp.kr",
    items: "감염관리 전문가 과정 x 15명",
    amount: 3_000_000,
    tax: 300_000,
    total: 3_300_000,
    status: "SENT" as InvoiceStatus,
    dueDate: "2025-02-28",
    issuedAt: "2025-02-01",
  },
  {
    id: "2",
    invoiceNo: "INV-20250130-002",
    organization: "(주)메디랩",
    contactEmail: "jang@medilab.kr",
    items: "간호 리더십 과정 x 30명",
    amount: 5_400_000,
    tax: 540_000,
    total: 5_940_000,
    status: "DRAFT" as InvoiceStatus,
    dueDate: "2025-03-01",
    issuedAt: "2025-01-30",
  },
  {
    id: "3",
    invoiceNo: "INV-20250128-003",
    organization: "서울대병원",
    contactEmail: "kim@snuh.org",
    items: "환자 안전 관리 외 2건 x 50명",
    amount: 12_500_000,
    tax: 1_250_000,
    total: 13_750_000,
    status: "PAID" as InvoiceStatus,
    dueDate: "2025-02-28",
    issuedAt: "2025-01-28",
  },
  {
    id: "4",
    invoiceNo: "INV-20250115-004",
    organization: "(주)케어플러스",
    contactEmail: "park@careplus.kr",
    items: "간호 실무 기초 과정 x 18명",
    amount: 2_700_000,
    tax: 270_000,
    total: 2_970_000,
    status: "OVERDUE" as InvoiceStatus,
    dueDate: "2025-01-31",
    issuedAt: "2025-01-15",
  },
  {
    id: "5",
    invoiceNo: "INV-20250110-005",
    organization: "연세의료원",
    contactEmail: "lee@yonsei.ac.kr",
    items: "감염관리 전문가 과정 x 40명",
    amount: 8_000_000,
    tax: 800_000,
    total: 8_800_000,
    status: "PAID" as InvoiceStatus,
    dueDate: "2025-02-10",
    issuedAt: "2025-01-10",
  },
  {
    id: "6",
    invoiceNo: "INV-20241220-006",
    organization: "(주)헬스케어코리아",
    contactEmail: "jung@healthcorp.kr",
    items: "간호 리더십 과정 x 20명",
    amount: 3_600_000,
    tax: 360_000,
    total: 3_960_000,
    status: "CANCELLED" as InvoiceStatus,
    dueDate: "2025-01-20",
    issuedAt: "2024-12-20",
  },
];

type InvoiceRow = (typeof invoices)[number];

const columns: Column<InvoiceRow>[] = [
  {
    key: "invoiceNo",
    header: "청구서번호",
    render: (row) => (
      <span className="font-mono text-xs">{row.invoiceNo}</span>
    ),
  },
  {
    key: "organization",
    header: "기관",
    render: (row) => (
      <div>
        <p className="font-medium text-[color:var(--fg)]">
          {row.organization}
        </p>
        <p className="text-xs text-[color:var(--muted)]">{row.contactEmail}</p>
      </div>
    ),
  },
  {
    key: "items",
    header: "항목",
    render: (row) => (
      <span className="text-sm text-[color:var(--muted)]">{row.items}</span>
    ),
  },
  {
    key: "total",
    header: "총액 (VAT 포함)",
    render: (row) => (
      <div>
        <p className="font-medium">{formatPrice(row.total)}</p>
        <p className="text-xs text-[color:var(--muted)]">
          공급가 {formatPrice(row.amount)} + VAT {formatPrice(row.tax)}
        </p>
      </div>
    ),
  },
  {
    key: "status",
    header: "상태",
    render: (row) => (
      <Badge variant={statusBadgeVariant[row.status]}>
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
        {row.status === "DRAFT" && (
          <Button variant="ghost" size="sm" title="발송">
            <Send className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="sm">
          상세
        </Button>
      </div>
    ),
  },
];

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--fg)]">
            청구서 관리
          </h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            B2B 기관 고객의 청구서를 관리합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            엑셀 다운로드
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 청구서
          </Button>
        </div>
      </div>

      {/* 필터/검색 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
          <Input
            placeholder="청구서번호 또는 기관명으로 검색..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            전체
          </Button>
          <Button variant="ghost" size="sm">
            작성중
          </Button>
          <Button variant="ghost" size="sm">
            발송됨
          </Button>
          <Button variant="ghost" size="sm">
            결제완료
          </Button>
          <Button variant="ghost" size="sm">
            연체
          </Button>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <DataTable<InvoiceRow>
        columns={columns}
        data={invoices}
        keyField="id"
      />

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--muted)]">
          전체 {invoices.length}건
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            이전
          </Button>
          <Button variant="outline" size="sm" disabled>
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
