import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-utils";
import { getViewer } from "@/lib/viewer";
import { prisma } from "@bayada/db";
import { getLectureEnrollment, gradeQuiz, markLectureComplete, quizBlockedBy, type QuizAnswer } from "@/lib/queries/learning";

function parseAnswers(raw: unknown): QuizAnswer[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((a) => {
    if (!a || typeof a !== "object" || typeof (a as QuizAnswer).questionId !== "string") return [];
    const { questionId, choices, texts } = a as QuizAnswer;
    return [
      {
        questionId,
        choices: Array.isArray(choices) ? choices.filter((c): c is number => Number.isInteger(c)) : undefined,
        texts: Array.isArray(texts) ? texts.map((t) => String(t).slice(0, 500)) : undefined,
      },
    ];
  });
}

/** 퀴즈 제출 → 서버 채점 → 시도 기록, 통과 시 레슨 완료 */
export async function POST(request: Request, { params }: { params: Promise<{ lectureId: string }> }) {
  try {
    const viewer = await getViewer();
    if (!viewer) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

    const { lectureId } = await params;
    const info = await getLectureEnrollment(viewer.id, lectureId);
    if (!info || info.lecture.type !== "QUIZ") {
      return NextResponse.json({ error: "퀴즈를 찾을 수 없습니다" }, { status: 404 });
    }
    if (!info.enrolled) return NextResponse.json({ error: "수강 신청 후 이용할 수 있어요" }, { status: 403 });

    // 앞 강의를 다 들어야 퀴즈를 풀 수 있다 (이미 통과·완료한 퀴즈는 다시 풀어도 된다)
    const passedBefore = await prisma.progress.findFirst({
      where: { userId: viewer.id, lectureId, completed: true },
      select: { id: true },
    });
    if (!passedBefore && (await quizBlockedBy(viewer.id, info.courseId, lectureId))) {
      return NextResponse.json({ error: "앞의 강의를 모두 완료해야 퀴즈를 풀 수 있어요" }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as { answers?: unknown };
    const result = await gradeQuiz(viewer.id, lectureId, parseAnswers(body.answers));
    if (!result) return NextResponse.json({ error: "퀴즈를 찾을 수 없습니다" }, { status: 404 });

    let courseCompleted = false;
    if (result.passed) {
      const enrollment = await markLectureComplete(viewer.id, lectureId, info.courseId);
      courseCompleted = !!enrollment?.completedAt;
    }
    return NextResponse.json({ ...result, courseCompleted });
  } catch (error) {
    return errorResponse(error);
  }
}
