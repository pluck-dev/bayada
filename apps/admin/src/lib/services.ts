import { prisma } from "@bayada/db";
import {
  CategoryService,
  CourseService,
  SectionService,
  LectureService,
  EnrollmentService,
  OrderService,
  InvoiceService,
  OrganizationService,
  UserService,
  DashboardService,
} from "@bayada/services";

// 서비스 인스턴스 싱글턴
export const categoryService = new CategoryService(prisma);
export const courseService = new CourseService(prisma);
export const sectionService = new SectionService(prisma);
export const lectureService = new LectureService(prisma);
export const enrollmentService = new EnrollmentService(prisma);
export const orderService = new OrderService(prisma);
export const invoiceService = new InvoiceService(prisma);
export const organizationService = new OrganizationService(prisma);
export const userService = new UserService(prisma);
export const dashboardService = new DashboardService(prisma);
