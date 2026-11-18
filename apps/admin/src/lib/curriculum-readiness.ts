export interface ReadyLecture {
  title: string;
  type: string;
  videoUrl: string | null;
  duration: number | null;
  content: string | null;
  quiz: { questions: { id: string }[] } | null;
}
/** 게시할 때 실제 학습 가능한 자료가 있는지 확인한다. */
export function curriculumIssues(lectures: ReadyLecture[]): string[] {
  if (!lectures.length) return ["레슨 1개 이상 필요"];
  return lectures.flatMap((lecture) => {
    const issues: string[] = [];
    if (lecture.type === "VIDEO") {
      if (!lecture.videoUrl?.trim()) issues.push("영상 주소");
      if (!lecture.duration || !Number.isFinite(lecture.duration) || lecture.duration <= 0) issues.push("영상 길이");
    }
    if (lecture.type === "TEXT" && !lecture.content?.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim() && !/<img\b[^>]*\bsrc\s*=\s*["']?(?:https?:\/\/|\/(?!\/))/i.test(lecture.content ?? "")) issues.push("읽기 본문");
    if (lecture.type === "QUIZ" && !lecture.quiz?.questions.length) issues.push("퀴즈 문항");
    return issues.length ? [`${lecture.title}: ${issues.join("·")} 필요`] : [];
  });
}
