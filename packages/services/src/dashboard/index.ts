import type { PrismaClient } from "@bayada/db";

export class DashboardService {
  constructor(private prisma: PrismaClient) {}

  async getAdminStats() {
    const [totalStudents, totalCourses, totalOrders, revenueResult] = await Promise.all([
      this.prisma.user.count({ where: { role: "STUDENT" } }),
      this.prisma.course.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalStudents,
      totalCourses,
      totalOrders,
      totalRevenue: revenueResult._sum.totalAmount ?? 0,
    };
  }

  async getRecentOrders(limit = 5) {
    return this.prisma.order.findMany({
      include: {
        items: { include: { course: { select: { id: true, title: true } } } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getRecentStudents(limit = 5) {
    return this.prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getStudentDashboard(userId: string) {
    const [enrollments, recentProgress] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              category: true,
              sections: {
                include: {
                  lectures: { select: { id: true, duration: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.progress.findMany({
        where: { userId },
        include: {
          lecture: {
            include: {
              section: { include: { course: { select: { id: true, title: true, slug: true } } } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
    ]);

    // 각 강의별 진도 계산
    const courseProgresses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const lectureIds = enrollment.course.sections.flatMap((s) =>
          s.lectures.map((l) => l.id)
        );
        const totalLectures = lectureIds.length;
        const completedLectures =
          totalLectures > 0
            ? await this.prisma.progress.count({
                where: {
                  userId,
                  lectureId: { in: lectureIds },
                  completed: true,
                },
              })
            : 0;

        return {
          course: enrollment.course,
          enrolledAt: enrollment.createdAt,
          totalLectures,
          completedLectures,
          progressPercent: totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0,
        };
      })
    );

    const totalWatched = await this.prisma.progress.aggregate({
      where: { userId },
      _sum: { watchedSec: true },
    });

    return {
      enrolledCourses: courseProgresses,
      recentActivity: recentProgress,
      stats: {
        totalEnrollments: enrollments.length,
        inProgress: courseProgresses.filter((c) => c.progressPercent > 0 && c.progressPercent < 100).length,
        completed: courseProgresses.filter((c) => c.progressPercent === 100).length,
        totalWatchedSec: totalWatched._sum.watchedSec ?? 0,
      },
    };
  }
}
