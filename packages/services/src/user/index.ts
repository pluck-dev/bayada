import type { PrismaClient, Role } from "@prisma/client";
import { NotFoundError } from "../errors";
import { paginationParams, paginatedResult } from "../utils";

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async list(params: {
    page?: number;
    limit?: number;
    role?: Role;
    search?: string;
  }) {
    const { page, limit, skip } = paginationParams(params);

    const where: Record<string, unknown> = {};
    if (params.role) where.role = params.role;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          organizationId: true,
          organization: { select: { id: true, name: true } },
          _count: { select: { enrollments: true } },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginatedResult(items, total, page, limit);
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        organizationId: true,
        organization: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, orders: true } },
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundError("사용자", id);
    return user;
  }

  async getProfile(id: string) {
    return this.getById(id);
  }

  async update(id: string, data: { name?: string; phone?: string; role?: Role; organizationId?: string | null }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        organizationId: true,
      },
    });
  }

  async getStats() {
    const [total, students, admins, orgAdmins] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: "STUDENT" } }),
      this.prisma.user.count({ where: { role: "ADMIN" } }),
      this.prisma.user.count({ where: { role: "ORG_ADMIN" } }),
    ]);
    return { total, students, admins, orgAdmins };
  }
}
