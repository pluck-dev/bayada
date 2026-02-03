import type { PrismaClient, LectureType } from "@bayada/db";
import { NotFoundError } from "../errors";

export class LectureService {
  constructor(private prisma: PrismaClient) {}

  async listBySection(sectionId: string) {
    return this.prisma.lecture.findMany({
      where: { sectionId },
      orderBy: { order: "asc" },
    });
  }

  async getById(id: string) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id },
      include: { section: { include: { course: true } } },
    });
    if (!lecture) throw new NotFoundError("레슨", id);
    return lecture;
  }

  async create(
    sectionId: string,
    data: {
      title: string;
      type?: LectureType;
      videoUrl?: string;
      duration?: number;
      isFree?: boolean;
    }
  ) {
    const maxOrder = await this.prisma.lecture.aggregate({
      where: { sectionId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? 0) + 1;

    return this.prisma.lecture.create({
      data: { ...data, sectionId, order },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      type?: LectureType;
      videoUrl?: string;
      duration?: number;
      isFree?: boolean;
    }
  ) {
    return this.prisma.lecture.update({ where: { id }, data });
  }

  async delete(id: string) {
    const lecture = await this.prisma.lecture.findUnique({ where: { id } });
    if (!lecture) throw new NotFoundError("레슨", id);
    return this.prisma.lecture.delete({ where: { id } });
  }

  async reorder(sectionId: string, lectureIds: string[]) {
    const updates = lectureIds.map((id, index) =>
      this.prisma.lecture.update({
        where: { id },
        data: { order: index + 1 },
      })
    );
    await this.prisma.$transaction(updates);
    return this.listBySection(sectionId);
  }
}
