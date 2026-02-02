import type { PrismaClient } from "@prisma/client";

export class CategoryService {
  constructor(private prisma: PrismaClient) {}

  async list() {
    return this.prisma.category.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { name: "asc" },
    });
  }

  async create(data: { name: string; slug: string }) {
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: { name?: string; slug?: string }) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
