"use client";

import { Button, buttonVariants, cn, controlClass, useFeedback } from "@bayada/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { ArrowRight, Award, Check, CheckCircle2, RotateCcw, X, XCircle } from "lucide-react";

/** 정답이 빠진 문항 (서버에서 가공해 내려준다) */
export type ClientQuestion =
  | { id: string; type: "SINGLE" | "MULTI" | "TRUE_FALSE"; text: string; options: string[] }
  | { id: string; type: "FILL_GAP"; text: string; segments: string[] } // segments 사이사이가 빈칸
  | { id: string; type: "KEYWORDS"; text: string };

interface Result {
  score: number;
  passed: boolean;
  passingScore: number;
  correctCount: number;
  total: number;
  results: { questionId: string; correct: boolean }[];
  courseCompleted: boolean;
}

const TYPE_HINT: Record<ClientQuestion["type"], string> = {
  SINGLE: "하나를 고르세요",
  TRUE_FALSE: "하나를 고르세요",
  MULTI: "정답을 모두 고르세요",
  FILL_GAP: "빈칸을 채우세요",
  KEYWORDS: "답을 입력하세요",
};

export function QuizRunner({
  lectureId,
  questions,
  passingScore,
  enrolled,
  alreadyPassed,
  nextHref,
  nextTitle,
  certificateHref,
}: {
  lectureId: string;
  questions: ClientQuestion[];
  passingScore: number;
  enrolled: boolean;
  alreadyPassed: boolean;
  nextHref: string | null;
  nextTitle: string | null;
  certificateHref: string;
}) {
  const router = useRouter();
  const { confirm } = useFeedback();
  const [choices, setChoices] = useState<Record<string, number[]>>({});
  const [texts, setTexts] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const correctMap = new Map(result?.results.map((r) => [r.questionId, r.correct]));

  const answered = (q: ClientQuestion) =>
    q.type === "FILL_GAP"
      ? (texts[q.id] ?? []).filter((t) => t?.trim()).length >= q.segments.length - 1
      : q.type === "KEYWORDS"
        ? !!texts[q.id]?.[0]?.trim()
        : (choices[q.id] ?? []).length > 0;
  const answeredCount = questions.filter(answered).length;

  function choose(q: ClientQuestion, idx: number) {
    if (result) return;
    setChoices((prev) => {
      const cur = prev[q.id] ?? [];
      if (q.type === "MULTI") {
        return { ...prev, [q.id]: cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx] };
      }
      return { ...prev, [q.id]: [idx] };
    });
  }

  function setText(qid: string, i: number, value: string) {
    if (result) return;
    setTexts((prev) => {
      const cur = [...(prev[qid] ?? [])];
      cur[i] = value;
      return { ...prev, [qid]: cur };
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = questions.length - answeredCount;
    if (
      missing > 0 &&
      !(await confirm({
        title: `답하지 않은 문항이 ${missing}개 있어요`,
        body: "답하지 않은 문항은 오답으로 채점돼요. 그대로 제출할까요?",
        confirmLabel: "제출하기",
        cancelLabel: "계속 풀기",
      }))
    )
      return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/lectures/${lectureId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: questions.map((q) => ({ questionId: q.id, choices: choices[q.id], texts: texts[q.id] })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as Result & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "채점하지 못했어요. 다시 시도해 주세요.");
        return;
      }
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (data.passed) router.refresh();
    } catch {
      setError("네트워크 오류로 제출하지 못했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setResult(null);
    setChoices({});
    setTexts({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      {!result && (
        <div className="flex flex-wrap items-center gap-2 text-body-sm">
          <span className="inline-flex h-8 items-center rounded-full bg-surface-sunken px-3.5 font-semibold text-ink-soft">
            총 {questions.length}문항
          </span>
          <span className="inline-flex h-8 items-center rounded-full bg-surface-sunken px-3.5 font-semibold text-ink-soft">
            합격 {passingScore}점 이상
          </span>
          {alreadyPassed && (
            <span className="inline-flex h-8 items-center gap-1 rounded-full bg-success-soft px-3.5 font-bold text-success">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> 이미 통과한 퀴즈예요
            </span>
          )}
        </div>
      )}

      {result && (
        <div
          role="status"
          className={cn(
            "animate-fade-up overflow-hidden rounded-[22px] p-6 md:p-8",
            result.passed ? "bg-ink text-white" : "border border-danger-line bg-danger-soft text-ink",
          )}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div
                className={cn(
                  "flex size-20 shrink-0 flex-col items-center justify-center rounded-full",
                  result.passed ? "bg-brand text-white" : "bg-canvas text-danger",
                )}
              >
                <span className="tabular text-[28px] font-black leading-none">{result.score}</span>
                <span className="text-micro font-bold opacity-80">점</span>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-title font-extrabold">
                  {result.passed ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-success-line" aria-hidden /> 통과했어요!
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-danger" aria-hidden /> 아쉽게도 통과하지 못했어요
                    </>
                  )}
                </p>
                <p className={cn("mt-1 text-body-sm", result.passed ? "text-white/70" : "text-muted")}>
                  {result.total}문항 중 {result.correctCount}문항 정답 · 합격 기준 {result.passingScore}점
                  {result.passed && result.courseCompleted && " · 수료증이 발급됐어요"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!result.passed && (
                <Button variant="primary" size="lg" onClick={retry}>
                  <RotateCcw aria-hidden /> 다시 풀기
                </Button>
              )}
              {result.passed && result.courseCompleted && (
                <Link href={certificateHref} className={buttonVariants({ variant: "primary", size: "lg" })}>
                  <Award aria-hidden /> 수료증 보기
                </Link>
              )}
              {result.passed && nextHref && (
                <Link
                  href={nextHref}
                  className={cn(
                    buttonVariants({ variant: result.courseCompleted ? "outline" : "primary", size: "lg" }),
                    result.courseCompleted && "border-white/30 bg-transparent text-white hover:bg-white/10",
                  )}
                >
                  다음 강의 <ArrowRight aria-hidden />
                </Link>
              )}
            </div>
          </div>
          {result.passed && nextTitle && (
            <p className="mt-4 truncate text-caption text-white/60">다음: {nextTitle}</p>
          )}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        {questions.map((q, qi) => {
          const verdict = correctMap.get(q.id);
          const isChoice = q.type === "SINGLE" || q.type === "MULTI" || q.type === "TRUE_FALSE";
          return (
            <fieldset
              key={q.id}
              className={cn(
                "rounded-[22px] border bg-canvas p-5 md:p-7",
                verdict === undefined ? "border-line-soft" : verdict ? "border-success-line" : "border-danger-line",
              )}
            >
              <legend className="sr-only">{qi + 1}번 문항</legend>
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "tabular flex size-8 shrink-0 items-center justify-center rounded-full text-caption font-extrabold",
                    verdict === undefined
                      ? answered(q)
                        ? "bg-ink text-white"
                        : "bg-surface-sunken text-ink-soft"
                      : verdict
                        ? "bg-success text-white"
                        : "bg-danger text-white",
                  )}
                >
                  {verdict === undefined ? qi + 1 : verdict ? <Check className="h-4 w-4" strokeWidth={3} aria-label="정답" /> : <X className="h-4 w-4" strokeWidth={3} aria-label="오답" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-bold leading-relaxed text-ink">{q.text}</p>
                  <p className="mt-0.5 text-caption text-muted">
                    {verdict === undefined ? TYPE_HINT[q.type] : verdict ? "정답이에요" : "오답이에요"}
                  </p>
                </div>
              </div>

              {isChoice && (
                <div role={q.type === "MULTI" ? "group" : "radiogroup"} aria-label={`${qi + 1}번 보기`} className="mt-4 space-y-2 md:pl-11">
                  {q.options.map((opt, oi) => {
                    const checked = (choices[q.id] ?? []).includes(oi);
                    return (
                      <button
                        key={oi}
                        type="button"
                        role={q.type === "MULTI" ? "checkbox" : "radio"}
                        aria-checked={checked}
                        disabled={!!result}
                        onClick={() => choose(q, oi)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 text-left text-body-sm transition-colors disabled:cursor-default",
                          checked ? "border-ink bg-surface font-semibold text-ink" : "border-line text-ink-soft enabled:hover:border-neutral-400 enabled:hover:text-ink",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center border-[1.5px] transition-colors",
                            q.type === "MULTI" ? "rounded-[6px]" : "rounded-full",
                            checked ? "border-ink bg-ink text-white" : "border-neutral-400 bg-canvas",
                          )}
                        >
                          {checked &&
                            (q.type === "MULTI" ? (
                              <Check className="h-3.5 w-3.5 animate-check-in" strokeWidth={3} />
                            ) : (
                              <span className="size-2 animate-check-in rounded-full bg-white" />
                            ))}
                        </span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === "FILL_GAP" && (
                <p className="mt-4 rounded-2xl bg-surface p-4 text-body leading-[2.6] text-ink-soft md:ml-11">
                  {q.segments.map((seg, si) => (
                    <Fragment key={si}>
                      {seg}
                      {si < q.segments.length - 1 && (
                        <input
                          aria-label={`${qi + 1}번 문항 ${si + 1}번째 빈칸`}
                          value={texts[q.id]?.[si] ?? ""}
                          disabled={!!result}
                          onChange={(e) => setText(q.id, si, e.target.value)}
                          className={controlClass("md", "mx-1 inline-block h-10 w-40 align-middle text-body-sm sm:w-52")}
                        />
                      )}
                    </Fragment>
                  ))}
                </p>
              )}

              {q.type === "KEYWORDS" && (
                <input
                  aria-label={`${qi + 1}번 문항 답`}
                  value={texts[q.id]?.[0] ?? ""}
                  disabled={!!result}
                  onChange={(e) => setText(q.id, 0, e.target.value)}
                  placeholder="답을 입력하세요"
                  className={controlClass("md", "mt-4 md:ml-11 md:w-[calc(100%-2.75rem)]")}
                />
              )}
            </fieldset>
          );
        })}

        {error && (
          <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-body-sm font-medium text-danger">
            {error}
          </p>
        )}

        {!result &&
          (enrolled ? (
            <div className="sticky bottom-3 z-sticky flex items-center justify-between gap-4 rounded-full border border-line-soft bg-canvas/95 py-2 pl-5 pr-2 shadow-md backdrop-blur">
              <span className="text-body-sm text-muted">
                <span className="tabular font-bold text-ink">{answeredCount}</span>/{questions.length} 답함
              </span>
              <Button type="submit" variant="primary" size="lg" loading={submitting}>
                제출하고 채점하기
              </Button>
            </div>
          ) : (
            <p className="rounded-2xl bg-warning-soft px-4 py-3 text-body-sm font-medium text-warning">
              미리보기 중이에요. 수강 신청 후 퀴즈를 제출할 수 있어요.
            </p>
          ))}
      </form>
    </div>
  );
}
