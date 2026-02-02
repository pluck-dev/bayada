import type { PrismaClient, CourseStatus } from "@prisma/client";
import { paginationParams, paginatedResult } from "../utils";
import { NotFoundError } from "../errors";

export class CourseService {
  constructor(private prisma: PrismaClient) {}

  async list(params: {
    page?: number;
    limit?: number;
    status?: CourseStatus;
    categoryId?: string;
    search?: string;
  }) {
    const { page, limit, skip } = paginationParams(params);

    const where: Record<string, unknown> = {};
    if (params.status) where.status = params.status;
    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.search) {
      where.title = { contains: params.search, mode: "insensitive" };
    }

    const [items, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          category: true,
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.course.count({ where }),
    ]);

    return paginatedResult(items, total, page, limit);
  }

  /** 공개 목록 (PUBLISHED만) */
  async listPublished(params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    sort?: string;
  }) {
    const { page, limit, skip } = paginationParams(params);

    const where: Record<string, unknown> = { status: "PUBLISHED" as CourseStatus };
    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.search) {
      where.title = { contains: params.search, mode: "insensitive" };
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (params.sort === "price_asc") orderBy = { price: "asc" };
    else if (params.sort === "price_desc") orderBy = { price: "desc" };
    else if (params.sort === "title") orderBy = { title: "asc" };

    const [items, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          category: true,
          _count: { select: { enrollments: true } },
          sections: {
            include: { lectures: { select: { duration: true } } },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.course.count({ where }),
    ]);

    return paginatedResult(items, total, page, limit);
  }

  async getById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        sections: {
          orderBy: { order: "asc" },
          include: {
            lectures: { orderBy: { order: "asc" } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundError("강의", id);
    return course;
  }

  async getBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        category: true,
        sections: {
          orderBy: { order: "asc" },
          include: {
            lectures: { orderBy: { order: "asc" } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundError("강의", slug);
    return course;
  }

  async create(data: {
    title: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    price?: number;
    status?: CourseStatus;
    categoryId?: string;
  }) {
    return this.prisma.course.create({
      data,
      include: { category: true },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      slug?: string;
      description?: string;
      thumbnail?: string;
      price?: number;
      status?: CourseStatus;
      categoryId?: string | null;
    }
  ) {
    return this.prisma.course.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }

  async updateStatus(id: string, status: CourseStatus) {
    return this.prisma.course.update({
      where: { id },
      data: { status },
    });
  }

  async getStats() {
    const [total, published, draft] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.count({ where: { status: "PUBLISHED" } }),
      this.prisma.course.count({ where: { status: "DRAFT" } }),
    ]);
    return { total, published, draft };
  }
}
