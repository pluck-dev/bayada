import type { PrismaClient, InvoiceStatus } from "@prisma/client";
import { generateInvoiceNo } from "@bayada/shared/constants";
import { NotFoundError } from "../errors";
import { paginationParams, paginatedResult } from "../utils";

export class InvoiceService {
  constructor(private prisma: PrismaClient) {}

  async create(orderId: string, dueDate: Date) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { invoice: true },
    });
    if (!order) throw new NotFoundError("주문", orderId);

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await this.prisma.invoice.count({
      where: { invoiceNo: { startsWith: `INV-${todayStr}` } },
    });
    const invoiceNo = generateInvoiceNo(today, count + 1);

    const taxAmount = Math.round(order.totalAmount * 0.1);

    return this.prisma.invoice.create({
      data: {
        invoiceNo,
        orderId,
        totalAmount: order.totalAmount,
        taxAmount,
        dueDate,
      },
      include: {
        order: {
          include: {
            items: { include: { course: { select: { id: true, title: true } } } },
            user: { select: { id: true, name: true, email: true } },
            organization: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async getById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: { include: { course: true } },
            user: { select: { id: true, name: true, email: true } },
            organization: true,
          },
        },
      },
    });
    if (!invoice) throw new NotFoundError("청구서", id);
    return invoice;
  }

  async list(params: {
    page?: number;
    limit?: number;
    status?: InvoiceStatus;
    search?: string;
  }) {
    const { page, limit, skip } = paginationParams(params);

    const where: Record<string, unknown> = {};
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { invoiceNo: { contains: params.search, mode: "insensitive" } },
        { order: { organization: { name: { contains: params.search, mode: "insensitive" } } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          order: {
            include: {
              items: { include: { course: { select: { id: true, title: true } } } },
              user: { select: { id: true, name: true, email: true } },
              organization: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return paginatedResult(items, total, page, limit);
  }

  async getByOrder(orderId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            items: { include: { course: true } },
            organization: true,
          },
        },
      },
    });
    if (!invoice) throw new NotFoundError("청구서");
    return invoice;
  }

  async updateStatus(id: string, status: InvoiceStatus) {
    return this.prisma.invoice.update({
      where: { id },
      data: { status },
    });
  }

  async updatePdfUrl(id: string, pdfUrl: string) {
    return this.prisma.invoice.update({
      where: { id },
      data: { pdfUrl },
    });
  }

  async getStats() {
    const [total, draft, sent, paid, overdue] = await Promise.all([
      this.prisma.invoice.count(),
      this.prisma.invoice.count({ where: { status: "DRAFT" } }),
      this.prisma.invoice.count({ where: { status: "SENT" } }),
      this.prisma.invoice.count({ where: { status: "PAID" } }),
      this.prisma.invoice.count({ where: { status: "OVERDUE" } }),
    ]);
    return { total, draft, sent, paid, overdue };
  }
}
