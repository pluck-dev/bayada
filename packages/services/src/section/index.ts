import type { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../errors";

export class SectionService {
  constructor(private prisma: PrismaClient) {}

  async listByCourse(courseId: string) {
    return this.prisma.section.findMany({
      where: { courseId },
      include: {
        lectures: { orderBy: { order: "asc" } },
      },
      orderBy: { order: "asc" },
    });
  }

  async create(courseId: string, data: { title: string }) {
    // 다음 order 값 계산
    const maxOrder = await this.prisma.section.aggregate({
      where: { courseId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? 0) + 1;

    return this.prisma.section.create({
      data: { ...data, courseId, order },
      include: { lectures: true },
    });
  }

  async update(id: string, data: { title?: string }) {
    return this.prisma.section.update({
      where: { id },
      data,
      include: { lectures: { orderBy: { order: "asc" } } },
    });
  }

  async delete(id: string) {
    const section = await this.prisma.section.findUnique({ where: { id } });
    if (!section) throw new NotFoundError("섹션", id);
    return this.prisma.section.delete({ where: { id } });
  }

  async reorder(courseId: string, sectionIds: string[]) {
    const updates = sectionIds.map((id, index) =>
      this.prisma.section.update({
        where: { id },
        data: { order: index + 1 },
      })
    );
    await this.prisma.$transaction(updates);
    return this.listByCourse(courseId);
  }
}
