import assert from "node:assert/strict";
import { hash } from "bcryptjs";
import { prisma } from "@bayada/db";

const dbUrl = new URL(process.env.DATABASE_URL ?? "http://invalid");
if (dbUrl.hostname !== "127.0.0.1" || dbUrl.port !== "55433" || dbUrl.pathname !== "/bayada_functional_qa") throw new Error("Only isolated synthetic QA database is allowed.");
const password = process.env.QA_TEST_PASSWORD;
if (!password) throw new Error("QA_TEST_PASSWORD is required.");
const checks: string[] = [];
class Client {
  cookies = new Map<string, string>();
  constructor(public base: string) {}
  async request(path: string, method = "GET", body?: unknown) {
    const headers: Record<string, string> = {};
    if (this.cookies.size) headers.Cookie = [...this.cookies].map(([key, value]) => `${key}=${value}`).join("; ");
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetch(this.base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: "manual" });
    for (const cookie of response.headers.getSetCookie()) { const pair = cookie.split(";")[0]!; const index = pair.indexOf("="); this.cookies.set(pair.slice(0, index), pair.slice(index + 1)); }
    return response;
  }
  async login(email: string, expected = true) {
    const csrf = await (await this.request("/api/auth/csrf")).json();
    const headers = { Cookie: [...this.cookies].map(([key, value]) => `${key}=${value}`).join("; "), "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1" };
    const response = await fetch(this.base + "/api/auth/callback/credentials", { method: "POST", headers, body: new URLSearchParams({ email, password: password!, csrfToken: csrf.csrfToken, callbackUrl: this.base + "/ko" }), redirect: "manual" });
    for (const cookie of response.headers.getSetCookie()) { const pair = cookie.split(";")[0]!; const index = pair.indexOf("="); this.cookies.set(pair.slice(0, index), pair.slice(index + 1)); }
    const session = await (await this.request("/api/auth/session")).json();
    assert.equal(Boolean(session?.user), expected, `${email} login`);
    if (expected) assert.equal(session.user.email, email);
  }
}
async function status(client: Client, path: string, expected: number, label: string, method = "GET", body?: unknown) {
  const response = await client.request(path, method, body);
  assert.equal(response.status, expected, label);
  checks.push(label);
  return response;
}
async function main() {
  const suffix = Date.now().toString(36), prefix = `qa-api-${suffix}`;
  const secret = await hash(password!, 10);
  const orgA = await prisma.organization.create({ data: { name: `${prefix}-internal`, isInternal: true } });
  const orgB = await prisma.organization.create({ data: { name: `${prefix}-external` } });
  const user = async (tag: string, role: "STUDENT" | "ORG_ADMIN" | "ADMIN" | "CONTENT_MANAGER", organizationId?: string, customRoleKey?: string) => prisma.user.create({ data: { email: `${prefix}-${tag}@qa.invalid`, password: secret, name: `${prefix}-${tag}`, role, status: "APPROVED", jobRole: "RN", organizationId, customRoleKey } });
  await prisma.adminRoleDef.upsert({ where: { key: "custom_project_client" }, create: { key: "custom_project_client", name: "QA 협의 고객", permissions: ["project.workspace", "web.content", "organization"] }, update: {} });
  const [student, outsider, staff, manager, customer, content] = await Promise.all([user("student", "STUDENT"), user("outsider", "STUDENT", orgB.id), user("staff", "STUDENT", orgA.id), user("manager", "ORG_ADMIN", orgA.id), user("customer", "STUDENT", undefined, "custom_project_client"), user("content", "CONTENT_MANAGER")]);
  const course = await prisma.course.create({ data: { title: `${prefix} public`, slug: `${prefix}-public`, price: 0, status: "PUBLISHED", visibility: "PUBLIC", audiences: ["RN"], objectives: ["API QA"], durationMin: 2, sections: { create: { title: "QA", order: 0, lectures: { create: [{ title: "VIDEO", type: "VIDEO", order: 0, duration: 100, videoUrl: "/media/qa-fixture.mp4" }, { title: "TEXT", type: "TEXT", order: 1, content: "QA 읽기" }, { title: "QUIZ", type: "QUIZ", order: 2, quiz: { create: { passingScore: 80, questions: { create: { order: 0, type: "SINGLE", text: "QA", options: [{ text: "정답", correct: true }, { text: "오답" }] } } } } }] } } } }, include: { sections: { include: { lectures: { orderBy: { order: "asc" }, include: { quiz: { include: { questions: true } } } } } } } });
  const internal = await prisma.course.create({ data: { title: `${prefix} internal`, slug: `${prefix}-internal`, price: 0, status: "PUBLISHED", visibility: "INTERNAL", audiences: [], objectives: [] } });
  const draft = await prisma.course.create({ data: { title: `${prefix} draft`, slug: `${prefix}-draft`, price: 0, status: "DRAFT", audiences: [], objectives: [] } });
  const paid = await prisma.course.create({ data: { title: `${prefix} paid`, slug: `${prefix}-paid`, price: 100000, status: "PUBLISHED", visibility: "PUBLIC", audiences: [], objectives: [] } });
  const [video, text, quiz] = course.sections[0]!.lectures;
  const anonymous = new Client("http://127.0.0.1:3342"), learner = new Client(anonymous.base), other = new Client(anonymous.base), employee = new Client(anonymous.base), orgManager = new Client(anonymous.base);
  await status(anonymous, "/api/v1/enrollments", 401, "anonymous enrollment blocked", "POST", { courseId: course.id });
  await status(anonymous, `/api/v1/progress/${video!.id}`, 401, "anonymous progress blocked", "PUT", { completed: true });
  await learner.login(student.email); await other.login(outsider.email); await employee.login(staff.email); await orgManager.login(manager.email);
  await status(learner, `/api/v1/progress/${video!.id}`, 403, "unenrolled progress blocked", "PUT", { completed: true });
  await status(learner, "/api/v1/enrollments", 404, "external internal-course enrollment blocked", "POST", { courseId: internal.id });
  await status(learner, "/api/v1/enrollments", 404, "draft enrollment blocked", "POST", { courseId: draft.id });
  await status(employee, "/api/v1/enrollments", 201, "internal staff enrollment allowed", "POST", { courseId: internal.id });
  await status(learner, "/api/v1/enrollments", 402, "unpaid course enrollment blocked", "POST", { courseId: paid.id });
  const enrolled = await (await status(learner, "/api/v1/enrollments", 201, "free enrollment created", "POST", { courseId: course.id })).json();
  const again = await (await status(learner, "/api/v1/enrollments", 200, "repeat enrollment idempotent", "POST", { courseId: course.id })).json();
  assert.equal(enrolled.enrollmentId, again.enrollmentId);
  await status(learner, `/api/v1/lectures/${quiz!.id}/quiz`, 403, "quiz prerequisite enforced", "POST", { answers: [] });
  await status(learner, `/api/v1/progress/${video!.id}`, 409, "client duration spoof cannot complete video", "PUT", { completed: true, watchedSec: 10000, duration: 1 });
  const progress = await prisma.progress.findUniqueOrThrow({ where: { userId_lectureId: { userId: student.id, lectureId: video!.id } } });
  assert.ok(progress.watchedSec <= 5);
  await prisma.progress.update({ where: { id: progress.id }, data: { updatedAt: new Date(Date.now() - 60000) } });
  await status(learner, `/api/v1/progress/${video!.id}`, 200, "95 percent video completion", "PUT", { completed: true, watchedSec: 95 });
  await status(learner, `/api/v1/progress/${text!.id}`, 200, "reading completion", "PUT", { completed: true });
  const q = quiz!.quiz!.questions[0]!;
  const failed = await (await status(learner, `/api/v1/lectures/${quiz!.id}/quiz`, 200, "incorrect quiz submission", "POST", { answers: [{ questionId: q.id, choices: [1] }] })).json();
  assert.equal(failed.passed, false);
  const passed = await (await status(learner, `/api/v1/lectures/${quiz!.id}/quiz`, 200, "correct quiz completion", "POST", { answers: [{ questionId: q.id, choices: [0] }] })).json();
  assert.equal(passed.passed, true); assert.equal(passed.courseCompleted, true);
  const certificate = await prisma.certificate.findUniqueOrThrow({ where: { userId_courseId: { userId: student.id, courseId: course.id } } });
  await status(anonymous, `/ko/verify/${certificate.number}`, 200, "public certificate verification");
  await status(learner, `/ko/certificates/${certificate.number}/print`, 200, "owner certificate print");
  await status(other, `/ko/certificates/${certificate.number}/print`, 404, "other learner certificate blocked");
  const checkout = await (await status(learner, "/api/v1/checkout", 201, "server-priced checkout", "POST", { courseId: paid.id, amount: 1 })).json();
  assert.equal(checkout.amount, 100000);
  const order = await prisma.order.findUniqueOrThrow({ where: { orderNo: checkout.orderId } });
  await status(other, `/api/v1/orders/${order.id}`, 404, "other learner order blocked");
  await status(learner, `/api/v1/orders/${order.id}`, 200, "owner order allowed");
  await status(learner, "/api/v1/business/assignments", 403, "student institution assignment blocked", "POST", { courseIds: [course.id], userIds: [staff.id] });
  await status(orgManager, "/api/v1/business/assignments", 400, "cross-institution assignment blocked", "POST", { courseIds: [course.id], userIds: [outsider.id] });
  await status(orgManager, "/api/v1/business/assignments", 201, "own institution assignment", "POST", { courseIds: [course.id], userIds: [staff.id] });
  const clientAdmin = new Client("http://127.0.0.1:3340"), contentAdmin = new Client(clientAdmin.base), anonAdmin = new Client(clientAdmin.base), studentAdmin = new Client(clientAdmin.base);
  await status(anonAdmin, "/api/v1/organizations", 401, "anonymous administrator API blocked");
  await studentAdmin.login(student.email, false); checks.push("learner administrator login rejected");
  await clientAdmin.login(customer.email); await contentAdmin.login(content.email);
  await status(clientAdmin, "/ko/workspace", 200, "customer workspace available");
  const denied = await status(clientAdmin, "/ko/web/services", 307, "customer website manager blocked");
  assert.ok(denied.headers.get("location")?.endsWith("/ko/workspace"));
  await status(clientAdmin, "/api/v1/organizations", 403, "customer administrator API blocked");
  await status(contentAdmin, "/ko/web/services", 200, "content operator service manager allowed");
  await status(contentAdmin, "/api/v1/organizations", 403, "content operator admin-only API blocked");
  const session = await prisma.trainingSession.create({ data: { courseId: course.id, title: `${prefix} practice`, region: "QA", location: "QA", startsAt: new Date(Date.now() + 86400000), endsAt: new Date(Date.now() + 90000000), capacity: 1 } });
  const registrations = await Promise.all([learner.request(`/api/v1/sessions/${session.id}/registration`, "POST"), other.request(`/api/v1/sessions/${session.id}/registration`, "POST")]);
  assert.deepEqual(registrations.map((r) => r.status).sort(), [201, 409]); checks.push("parallel practice requests respect capacity");
  const winner = registrations[0]!.status === 201 ? learner : other;
  const loser = winner === learner ? other : learner;
  await status(loser, `/api/v1/sessions/${session.id}/registration`, 200, "practice cancel is ownership scoped", "DELETE");
  assert.equal(await prisma.sessionRegistration.count({ where: { sessionId: session.id } }), 1);
  await status(winner, `/api/v1/sessions/${session.id}/registration`, 201, "repeat practice registration idempotent", "POST");
  await status(winner, `/api/v1/sessions/${session.id}/registration`, 200, "practice registration cancel", "DELETE");
  assert.equal(await prisma.sessionRegistration.count({ where: { sessionId: session.id } }), 0);
  await status(learner, `/api/v1/wishlist/${internal.id}`, 404, "external internal-course wishlist blocked", "POST");
  await status(learner, `/api/v1/wishlist/${course.id}`, 200, "public course wishlist added", "POST");
  await status(learner, `/api/v1/wishlist/${course.id}`, 200, "wishlist removed", "DELETE");
  await status(other, `/api/v1/courses/${course.id}/review`, 403, "insufficient progress review blocked", "PUT", { rating: 5, content: "QA 미수강자의 유효한 길이 후기입니다." });
  const review = await (await status(learner, `/api/v1/courses/${course.id}/review`, 200, "completed learner review", "PUT", { rating: 5, content: "QA 수료 학습자의 유효한 길이 후기입니다." })).json();
  await status(other, `/api/v1/reviews/${review.id}/report`, 200, "review reporting", "POST");
  await status(other, `/api/v1/reviews/${review.id}/report`, 409, "duplicate review reporting blocked", "POST");
  const path = await prisma.pathway.create({ data: { slug: `${prefix}-path`, title: "QA 경로", country: "QA", published: false } });
  await status(learner, `/api/v1/pathways/${path.id}/goal`, 404, "unpublished pathway goal blocked", "POST");
  await prisma.pathway.update({ where: { id: path.id }, data: { published: true, infoAsOf: new Date(), steps: { create: { order: 0, title: "QA 단계", courseId: course.id } } } });
  await status(learner, `/api/v1/pathways/${path.id}/goal`, 200, "published pathway goal set", "POST");
  await status(learner, `/api/v1/pathways/${path.id}/goal`, 200, "pathway goal idempotent", "POST");
  assert.equal(await prisma.pathwayGoal.count({ where: { userId: student.id, pathwayId: path.id } }), 1);
  await status(learner, `/api/v1/pathways/${path.id}/goal`, 200, "pathway goal removed", "DELETE");
  const credential = await prisma.credentialProgram.create({ data: { slug: `${prefix}-credential`, title: "QA 인증", active: true, requiredCourseIds: [course.id] } });
  await status(other, `/api/v1/certifications/${credential.slug}/applications`, 403, "credential prerequisites enforced", "POST", {});
  const applications = await Promise.all([learner.request(`/api/v1/certifications/${credential.slug}/applications`, "POST", {}), learner.request(`/api/v1/certifications/${credential.slug}/applications`, "POST", {})]);
  assert.deepEqual(applications.map((r) => r.status).sort(), [201, 409]); checks.push("concurrent credential application idempotent");
  assert.equal(await prisma.credentialApplication.count({ where: { userId: student.id, programId: credential.id } }), 1);
  const plan = await prisma.passPlan.create({ data: { name: `${prefix} pass`, price: 10000, durationDays: 30, includes: ["COURSE"], active: true } });
  const subscription = await prisma.subscription.create({ data: { userId: student.id, planId: plan.id, startsAt: new Date(Date.now() - 1000), endsAt: new Date(Date.now() + 86400000) } });
  await status(learner, "/api/v1/enrollments", 201, "active pass paid enrollment", "POST", { courseId: paid.id, via: "pass" });
  const paidLecture = await prisma.lecture.create({ data: { title: "QA 유료 레슨", type: "TEXT", order: 0, content: "QA", section: { create: { title: "QA 유료 섹션", order: 0, courseId: paid.id } } } });
  const paidSession = await prisma.trainingSession.create({ data: { courseId: paid.id, title: `${prefix} paid practice`, region: "QA", location: "QA", startsAt: new Date(Date.now() + 86400000), endsAt: new Date(Date.now() + 90000000), capacity: 5 } });
  await status(learner, `/api/v1/sessions/${paidSession.id}/registration`, 201, "active pass practice allowed", "POST");
  await status(learner, `/api/v1/sessions/${paidSession.id}/registration`, 200, "active pass practice cancellation", "DELETE");
  await prisma.subscription.update({ where: { id: subscription.id }, data: { endsAt: new Date(Date.now() - 1000) } });
  await status(learner, `/api/v1/progress/${paidLecture.id}`, 403, "expired pass progress blocked", "PUT", { completed: true });
  await status(learner, `/api/v1/sessions/${paidSession.id}/registration`, 403, "expired pass practice blocked", "POST");
  assert.equal(await prisma.sessionRegistration.count({ where: { sessionId: paidSession.id } }), 0);
  await prisma.subscription.update({ where: { id: subscription.id }, data: { endsAt: new Date(Date.now() + 86400000) } });
  await status(learner, `/api/v1/sessions/${paidSession.id}/registration`, 201, "renewed pass practice allowed", "POST");
  console.log(JSON.stringify({ passed: true, count: checks.length, checks, externalPaymentConfirmation: "not_called", realVideoPlayback: "not_tested; elapsed time simulated in isolated QA record" }));
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "API integration failed"); console.error(JSON.stringify({ passedBeforeFailure: checks })); process.exitCode = 1; }).finally(() => prisma.$disconnect());
