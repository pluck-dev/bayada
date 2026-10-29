import { NextResponse } from "next/server";
import { prisma } from "@bayada/db";
import { errorResponse } from "@/lib/api-utils";
import { paymentService } from "@/lib/services";
import { getViewer } from "@/lib/viewer";
import { isCourseListed } from "@/lib/queries/courses";

/**
 * 결제 대기 주문 생성 → 토스 결제창에 넘길 orderId·금액·주문명.
 * 금액은 DB 가격으로 서버에서만 계산한다 (클라이언트가 보낸 금액은 받지 않는다).
 */
export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    const body = (await request.json().catch(() => ({}))) as { courseId?: unknown; planId?: unknown };

    if (typeof body.courseId === "string") {
      const course = await prisma.course.findUnique({
        where: { id: body.courseId },
        select: { id: true, status: true, visibility: true },
      });
      // 노출 규칙을 통과하지 못하면 존재 자체를 알리지 않는다
      if (!course || !isCourseListed(course, viewer)) {
        return NextResponse.json({ error: "프로그램을 찾을 수 없습니다" }, { status: 404 });
      }
      const { order, orderName } = await paymentService.createCheckoutOrder(viewer.id, { courseId: course.id });
      return NextResponse.json({ orderId: order.orderNo, amount: order.totalAmount, orderName }, { status: 201 });
    }
    if (typeof body.planId === "string") {
      const { order, orderName } = await paymentService.createCheckoutOrder(viewer.id, { planId: body.planId });
      return NextResponse.json({ orderId: order.orderNo, amount: order.totalAmount, orderName }, { status: 201 });
    }
    return NextResponse.json({ error: "구매할 상품을 선택해 주세요" }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}
