import { Users, BookOpen, ShoppingCart, DollarSign, TrendingUp, UserPlus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@bayada/ui";
import { formatPrice } from "@bayada/shared";
import { StatsCard } from "@/components/StatsCard";

// 대시보드 플레이스홀더 데이터
const stats = {
  totalStudents: 1_247,
  totalCourses: 38,
  totalOrders: 856,
  totalRevenue: 128_450_000,
};

const recentOrders = [
  {
    id: "ORD-20250201-001",
    customer: "김영희",
    course: "간호 실무 기초 과정",
    amount: 150_000,
    status: "확정",
    date: "2025-02-01",
  },
  {
    id: "ORD-20250201-002",
    customer: "(주)헬스케어코리아",
    course: "감염관리 전문가 과정",
    amount: 3_000_000,
    status: "대기",
    date: "2025-02-01",
  },
  {
    id: "ORD-20250131-003",
    customer: "박민수",
    course: "환자 안전 관리",
    amount: 89_000,
    status: "확정",
    date: "2025-01-31",
  },
  {
    id: "ORD-20250131-004",
    customer: "이수진",
    course: "재활간호 입문",
    amount: 120_000,
    status: "확정",
    date: "2025-01-31",
  },
  {
    id: "ORD-20250130-005",
    customer: "(주)메디랩",
    course: "간호 리더십 과정",
    amount: 5_400_000,
    status: "대기",
    date: "2025-01-30",
  },
];

const recentStudents = [
  { name: "최서연", email: "choi@example.com", joinedAt: "2025-02-01" },
  { name: "장현우", email: "jang@example.com", joinedAt: "2025-02-01" },
  { name: "윤지민", email: "yoon@example.com", joinedAt: "2025-01-31" },
  { name: "한도윤", email: "han@example.com", joinedAt: "2025-01-31" },
  { name: "정하은", email: "jung@example.com", joinedAt: "2025-01-30" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 페이지 제목 */}
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--fg)]">대시보드</h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          BAYADA 아카데미 운영 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="전체 수강생"
          value={stats.totalStudents.toLocaleString("ko-KR")}
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="전체 강의"
          value={stats.totalCourses}
          icon={BookOpen}
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="전체 주문"
          value={stats.totalOrders.toLocaleString("ko-KR")}
          icon={ShoppingCart}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="총 매출"
          value={formatPrice(stats.totalRevenue)}
          icon={DollarSign}
          trend={{ value: 15.3, isPositive: true }}
        />
      </div>

      {/* 하단 영역: 최근 주문 + 최근 가입 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 최근 주문 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#ce0e2d]" />
                최근 주문
              </CardTitle>
              <a
                href="/orders"
                className="text-sm font-medium text-[#ce0e2d] hover:underline"
              >
                전체 보기
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--border)]">
                    <th className="pb-3 text-left font-medium text-[color:var(--muted)]">
                      주문번호
                    </th>
                    <th className="pb-3 text-left font-medium text-[color:var(--muted)]">
                      고객
                    </th>
                    <th className="pb-3 text-left font-medium text-[color:var(--muted)]">
                      강의
                    </th>
                    <th className="pb-3 text-right font-medium text-[color:var(--muted)]">
                      금액
                    </th>
                    <th className="pb-3 text-center font-medium text-[color:var(--muted)]">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[color:var(--border)] last:border-0"
                    >
                      <td className="py-3 font-mono text-xs">{order.id}</td>
                      <td className="py-3">{order.customer}</td>
                      <td className="py-3 text-[color:var(--muted)]">
                        {order.course}
                      </td>
                      <td className="py-3 text-right">
                        {formatPrice(order.amount)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            order.status === "확정"
                              ? "bg-[color:var(--success-bg)] text-[color:var(--success)]"
                              : "bg-[color:var(--warning-bg)] text-[color:var(--warning)]"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 최근 가입 수강생 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#ce0e2d]" />
                최근 가입
              </CardTitle>
              <a
                href="/users"
                className="text-sm font-medium text-[#ce0e2d] hover:underline"
              >
                전체 보기
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentStudents.map((student) => (
                <li key={student.email} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--surface-3)] text-sm font-medium text-[color:var(--muted)]">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-[color:var(--fg)]">
                      {student.name}
                    </p>
                    <p className="truncate text-xs text-[color:var(--muted)]">
                      {student.email}
                    </p>
                  </div>
                  <span className="text-xs text-[color:var(--muted)]">
                    {student.joinedAt}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
