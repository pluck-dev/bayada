import Link from "next/link";
import { Users, BookOpen, ShoppingCart, DollarSign, TrendingUp, UserPlus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@bayada/ui";
import { formatPrice } from "@bayada/shared";
import { StatsCard } from "@/components/StatsCard";
import { dashboardService, orderService, userService } from "@/lib/services";

export default async function DashboardPage() {
  const [stats, recentOrders, recentStudents] = await Promise.all([
    dashboardService.getAdminStats(),
    dashboardService.getRecentOrders(5),
    dashboardService.getRecentStudents(5),
  ]);

  const statusLabel: Record<string, string> = {
    PENDING: "대기",
    CONFIRMED: "확정",
    CANCELLED: "취소",
  };

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
        />
        <StatsCard
          title="전체 강의"
          value={stats.totalCourses}
          icon={BookOpen}
        />
        <StatsCard
          title="전체 주문"
          value={stats.totalOrders.toLocaleString("ko-KR")}
          icon={ShoppingCart}
        />
        <StatsCard
          title="총 매출"
          value={formatPrice(stats.totalRevenue)}
          icon={DollarSign}
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
              <Link
                href="/orders"
                className="text-sm font-medium text-[#ce0e2d] hover:underline"
              >
                전체 보기
              </Link>
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
                      <td className="py-3 font-mono text-xs">{order.orderNo}</td>
                      <td className="py-3">{order.user?.name ?? "-"}</td>
                      <td className="py-3 text-right">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            order.status === "CONFIRMED"
                              ? "bg-[color:var(--success-bg)] text-[color:var(--success)]"
                              : order.status === "CANCELLED"
                                ? "bg-[color:var(--error-bg)] text-[color:var(--error)]"
                                : "bg-[color:var(--warning-bg)] text-[color:var(--warning)]"
                          }`}
                        >
                          {statusLabel[order.status] ?? order.status}
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
              <Link
                href="/users"
                className="text-sm font-medium text-[#ce0e2d] hover:underline"
              >
                전체 보기
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentStudents.map((student) => (
                <li key={student.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--surface-3)] text-sm font-medium text-[color:var(--muted)]">
                    {(student.name ?? "?").charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-[color:var(--fg)]">
                      {student.name ?? "-"}
                    </p>
                    <p className="truncate text-xs text-[color:var(--muted)]">
                      {student.email}
                    </p>
                  </div>
                  <span className="text-xs text-[color:var(--muted)]">
                    {new Date(student.createdAt).toLocaleDateString("ko-KR")}
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
