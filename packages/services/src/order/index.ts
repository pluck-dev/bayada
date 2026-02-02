import type { PrismaClient, OrderType } from "@prisma/client";
import { generateOrderNo } from "@bayada/shared/constants";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import { paginationParams, paginatedResult } from "../utils";

export class OrderService {
  constructor(private prisma: PrismaClient) {}

  /** B2C 주문 생성 */
  async createB2COrder(userId: string, courseIds: string[]) {
    if (courseIds.length === 0) throw new ValidationError("강의를 선택해주세요");

    // 이미 수강 중인 강의 검증
    const existingEnrollments = await this.prisma.enrollment.findMany({
      where: { userId, courseId: { in: courseIds } },
      select: { courseId: true },
    });
    if (existingEnrollments.length > 0) {
      throw new ConflictError("이미 수강 중인 강의가 포함되어 있습니다");
    }

    // 강의 가격 조회
    const courses = await this.prisma.course.findMany({
      where: { id: { in: courseIds }, status: "PUBLISHED" },
    });
    if (courses.length !== courseIds.length) {
      throw new ValidationError("유효하지 않은 강의가 포함되어 있습니다");
    }

    const totalAmount = courses.reduce((sum, c) => sum + c.price, 0);

    // 주문번호 생성
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const orderCount = await this.prisma.order.count({
      where: {
        orderNo: { startsWith: `ORD-${todayStr}` },
      },
    });
    const orderNo = generateOrderNo(today, orderCount + 1);

    return this.prisma.order.create({
      data: {
        orderNo,
        userId,
        type: "B2C",
        totalAmount,
        items: {
          create: courses.map((c) => ({
            courseId: c.id,
            quantity: 1,
            price: c.price,
          })),
        },
      },
      include: {
        items: { include: { course: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /** B2B 주문 생성 */
  async createB2BOrder(
    userId: string,
    organizationId: string,
    items: { courseId: string; quantity: number }[]
  ) {
    if (items.length === 0) throw new ValidationError("강의를 선택해주세요");

    const courseIds = items.map((i) => i.courseId);
    const courses = await this.prisma.course.findMany({
      where: { id: { in: courseIds }, status: "PUBLISHED" },
    });
    if (courses.length !== courseIds.length) {
      throw new ValidationError("유효하지 않은 강의가 포함되어 있습니다");
    }

    const courseMap = new Map(courses.map((c) => [c.id, c]));
    const totalAmount = items.reduce((sum, item) => {
      const course = courseMap.get(item.courseId)!;
      return sum + course.price * item.quantity;
    }, 0);

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const orderCount = await this.prisma.order.count({
      where: { orderNo: { startsWith: `ORD-${todayStr}` } },
    });
    const orderNo = generateOrderNo(today, orderCount + 1);

    return this.prisma.order.create({
      data: {
        orderNo,
        userId,
        organizationId,
        type: "B2B",
        totalAmount,
        items: {
          create: items.map((item) => ({
            courseId: item.courseId,
            quantity: item.quantity,
            price: courseMap.get(item.courseId)!.price * item.quantity,
          })),
        },
      },
      include: {
        items: { include: { course: true } },
        user: { select: { id: true, name: true, email: true } },
        organization: true,
      },
    });
  }

  async getById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { course: true } },
        user: { select: { id: true, name: true, email: true } },
        organization: true,
        invoice: true,
      },
    });
    if (!order) throw new NotFoundError("주문", id);
    return order;
  }

  async list(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: OrderType;
    search?: string;
  }) {
    const { page, limit, skip } = paginationParams(params);

    const where: Record<string, unknown> = {};
    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;
    if (params.search) {
      where.OR = [
        { orderNo: { contains: params.search, mode: "insensitive" } },
        { user: { name: { contains: params.search, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: { include: { course: { select: { id: true, title: true } } } },
          user: { select: { id: true, name: true, email: true } },
          organization: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return paginatedResult(items, total, page, limit);
  }

  async listByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { course: true } },
        invoice: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /** 주문 확정 → 수강 등록 */
  async confirm(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundError("주문", id);

    return this.prisma.$transaction(async (tx) => {
      // 주문 상태 변경
      const updated = await tx.order.update({
        where: { id },
        data: { status: "CONFIRMED" },
        include: {
          items: { include: { course: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      // 수강 등록 생성
      if (order.type === "B2C") {
        for (const item of order.items) {
          await tx.enrollment.create({
            data: { userId: order.userId, courseId: item.courseId },
          }).catch(() => {
            // 이미 등록된 경우 무시
          });
        }
      }

      return updated;
    });
  }

  async cancel(id: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        items: { include: { course: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getStats() {
    const [total, pending, confirmed, totalRevenue] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: "PENDING" } }),
      this.prisma.order.count({ where: { status: "CONFIRMED" } }),
      this.prisma.order.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { totalAmount: true },
      }),
    ]);
    return {
      total,
      pending,
      confirmed,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
    };
  }
}
