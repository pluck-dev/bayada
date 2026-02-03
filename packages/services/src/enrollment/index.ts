import type { PrismaClient } from "@bayada/db";
import { ConflictError, NotFoundError } from "../errors";

export class EnrollmentService {
  constructor(private prisma: PrismaClient) {}

  async enroll(userId: string, courseId: string) {
    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) throw new ConflictError("이미 수강 중인 강의입니다");

    return this.prisma.enrollment.create({
      data: { userId, courseId },
      include: { course: true },
    });
  }

  /** B2B 대량 수강 등록 */
  async enrollBulk(userIds: string[], courseId: string) {
    const data = userIds.map((userId) => ({ userId, courseId }));
    return this.prisma.enrollment.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async getByUser(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            category: true,
            sections: {
              include: { lectures: { select: { id: true, duration: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async isEnrolled(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    return !!enrollment;
  }

  async getCourseProgress(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: { lectures: { select: { id: true } } },
        },
      },
    });
    if (!course) throw new NotFoundError("강의", courseId);

    const lectureIds = course.sections.flatMap((s) => s.lectures.map((l) => l.id));
    const totalLectures = lectureIds.length;

    if (totalLectures === 0) {
      return { courseId, totalLectures: 0, completedLectures: 0, progressPercent: 0 };
    }

    const completedCount = await this.prisma.progress.count({
      where: {
        userId,
        lectureId: { in: lectureIds },
        completed: true,
      },
    });

    return {
      courseId,
      totalLectures,
      completedLectures: completedCount,
      progressPercent: Math.round((completedCount / totalLectures) * 100),
    };
  }

  async updateProgress(userId: string, lectureId: string, data: { completed?: boolean; watchedSec?: number }) {
    return this.prisma.progress.upsert({
      where: { userId_lectureId: { userId, lectureId } },
      create: { userId, lectureId, ...data },
      update: data,
    });
  }

  /** 학생 대시보드 요약 */
  async getProgressSummary(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            sections: {
              include: { lectures: { select: { id: true, duration: true } } },
            },
          },
        },
      },
    });

    let totalLectures = 0;
    let completedLectures = 0;
    let totalDuration = 0;

    const lectureIds: string[] = [];
    for (const enrollment of enrollments) {
      for (const section of enrollment.course.sections) {
        for (const lecture of section.lectures) {
          lectureIds.push(lecture.id);
          totalLectures++;
          totalDuration += lecture.duration ?? 0;
        }
      }
    }

    if (lectureIds.length > 0) {
      completedLectures = await this.prisma.progress.count({
        where: { userId, lectureId: { in: lectureIds }, completed: true },
      });
    }

    const watchedTotal = await this.prisma.progress.aggregate({
      where: { userId },
      _sum: { watchedSec: true },
    });

    return {
      totalEnrollments: enrollments.length,
      inProgress: enrollments.length - (totalLectures > 0 && completedLectures === totalLectures ? 1 : 0),
      completed: totalLectures > 0 && completedLectures === totalLectures ? 1 : 0,
      totalLectures,
      completedLectures,
      totalWatchedSec: watchedTotal._sum.watchedSec ?? 0,
    };
  }
}
