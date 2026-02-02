import type { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { NotFoundError, ConflictError, ValidationError } from "../errors";
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

  async create(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    if (!data.email || !data.password || !data.name) {
      throw new ValidationError("이메일, 비밀번호, 이름은 필수입니다.");
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictError("이미 가입된 이메일입니다.");
    }

    const hashedPassword = await hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: "STUDENT",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    return user;
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
