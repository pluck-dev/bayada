import type { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../errors";
import { paginationParams, paginatedResult } from "../utils";

export class OrganizationService {
  constructor(private prisma: PrismaClient) {}

  async list(params: { page?: number; limit?: number; search?: string }) {
    const { page, limit, skip } = paginationParams(params);

    const where: Record<string, unknown> = {};
    if (params.search) {
      where.name = { contains: params.search, mode: "insensitive" };
    }

    const [items, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        include: {
          _count: { select: { users: true, orders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    return paginatedResult(items, total, page, limit);
  }

  async getById(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, orders: true } },
      },
    });
    if (!org) throw new NotFoundError("기관", id);
    return org;
  }

  async create(data: { name: string; bizNo?: string; contact?: string }) {
    return this.prisma.organization.create({ data });
  }

  async update(id: string, data: { name?: string; bizNo?: string; contact?: string }) {
    return this.prisma.organization.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.organization.delete({ where: { id } });
  }

  async getMembers(id: string) {
    return this.prisma.user.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getStats() {
    const [total, totalMembers, totalRevenue] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.user.count({ where: { organizationId: { not: null } } }),
      this.prisma.order.aggregate({
        where: { type: "B2B", status: "CONFIRMED" },
        _sum: { totalAmount: true },
      }),
    ]);
    return {
      total,
      totalMembers,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
    };
  }
}
