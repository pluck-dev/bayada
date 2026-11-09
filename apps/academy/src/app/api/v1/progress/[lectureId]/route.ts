import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-utils";
import { getViewer } from "@/lib/viewer";
import { prisma } from "@bayada/db";
import { getLectureEnrollment, markLectureComplete, saveWatchedSec, watchedEnough } from "@/lib/queries/learning";

/**
 * 영상·읽기 레슨 진도 저장. { completed: true } 면 완료 처리 후 수강 진도율·수료증까지 갱신.
 * - 영상: 서버에 쌓인 시청 지점(watchedSec)이 길이의 95% 이상일 때만 완료. 화면 버튼만으로는 완료되지 않는다.
 * - 읽기: 요청대로 완료.
 * - 퀴즈 레슨은 여기서 완료할 수 없다(채점 API 에서만).
 */
export async function PUT(request: Request, { params }: { params: Promise<{ lectureId: string }> }) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

    const { lectureId } = await params;
    const info = await getLectureEnrollment(viewer.id, lectureId);
    if (!info) return NextResponse.json({ error: "레슨을 찾을 수 없습니다" }, { status: 404 });
    if (!info.enrolled) return NextResponse.json({ error: "수강 신청 후 이용할 수 있어요" }, { status: 403 });

    const body = (await request.json().catch(() => ({}))) as { completed?: unknown; watchedSec?: unknown; duration?: unknown };
    if (typeof body.watchedSec === "number" && Number.isFinite(body.watchedSec)) {
      await saveWatchedSec(viewer.id, lectureId, body.watchedSec);
    }
    if (body.completed === true) {
      if (info.lecture.type === "QUIZ") {
        return NextResponse.json({ error: "퀴즈는 통과해야 완료됩니다" }, { status: 400 });
      }
      if (info.lecture.type === "VIDEO") {
        const row = await prisma.progress.findUnique({
          where: { userId_lectureId: { userId: viewer.id, lectureId } },
          select: { watchedSec: true, completed: true },
        });
        const clientDuration = typeof body.duration === "number" && Number.isFinite(body.duration) ? body.duration : undefined;
        if (!row?.completed && !watchedEnough(row?.watchedSec ?? 0, info.lecture.duration, clientDuration)) {
          return NextResponse.json({ error: "영상을 끝까지 시청해야 완료돼요" }, { status: 409 });
        }
      }
      const enrollment = await markLectureComplete(viewer.id, lectureId, info.courseId);
      return NextResponse.json({
        completed: true,
        progressPercent: enrollment?.progressPercent ?? 0,
        courseCompleted: !!enrollment?.completedAt,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
