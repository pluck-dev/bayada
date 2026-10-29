"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Award, CheckCircle2, ChevronRight, Loader2, RotateCcw, XCircle } from "lucide-react";

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

export function QuizRunner({
  lectureId,
  questions,
  passingScore,
  enrolled,
  alreadyPassed,
  nextHref,
  certificatesHref,
}: {
  lectureId: string;
  questions: ClientQuestion[];
  passingScore: number;
  enrolled: boolean;
  alreadyPassed: boolean;
  nextHref: string | null;
  certificatesHref: string;
}) {
  const router = useRouter();
  const [choices, setChoices] = useState<Record<string, number[]>>({});
  const [texts, setTexts] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const correctMap = new Map(result?.results.map((r) => [r.questionId, r.correct]));

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
  }

  const inputCls =
    "mx-1 inline-block h-9 w-36 rounded-lg border border-line bg-white px-3 align-middle text-sm text-ink focus:border-ink focus:outline-none disabled:bg-surface";

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface p-5 text-sm text-ink-soft">
        총 {questions.length}문항 · 합격 기준 {passingScore}점 이상
        {alreadyPassed && !result && (
          <span className="ml-2 inline-flex items-center gap-1 font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> 이미 통과한 퀴즈예요
          </span>
        )}
      </div>

      {result && (
        <div
          role="status"
          className={`mt-5 rounded-2xl border p-6 ${
            result.passed ? "border-success/30 bg-success-soft" : "border-brand/20 bg-brand-soft"
          }`}
        >
          <div className="flex items-center gap-3">
            {result.passed ? (
              <CheckCircle2 className="h-7 w-7 text-success" aria-hidden />
            ) : (
              <XCircle className="h-7 w-7 text-brand" aria-hidden />
            )}
            <div>
              <p className="text-lg font-bold text-ink">
                {result.score}점 · {result.passed ? "통과했어요!" : "아쉽게도 통과하지 못했어요"}
              </p>
              <p className="text-sm text-muted">
                {result.total}문항 중 {result.correctCount}문항 정답 · 합격 기준 {result.passingScore}점
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {!result.passed && (
              <button
                type="button"
                onClick={retry}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft"
              >
                <RotateCcw className="h-4 w-4" aria-hidden /> 다시 풀기
              </button>
            )}
            {result.passed && result.courseCompleted && (
              <Link
                href={certificatesHref}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong"
              >
                <Award className="h-4 w-4" aria-hidden /> 수료증 보기
              </Link>
            )}
            {result.passed && nextHref && (
              <Link
                href={nextHref}
                className="inline-flex h-10 items-center gap-1 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong"
              >
                다음 강의 <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        {questions.map((q, qi) => {
          const verdict = correctMap.get(q.id);
          return (
            <fieldset
              key={q.id}
              className={`rounded-2xl border bg-white p-6 ${
                verdict === undefined ? "border-line" : verdict ? "border-success/40" : "border-brand/40"
              }`}
            >
              <legend className="sr-only">{qi + 1}번 문항</legend>
              <div className="flex items-start justify-between gap-4">
                <p className="text-[15px] font-semibold leading-relaxed text-ink">
                  <span className="mr-2 text-brand">Q{qi + 1}.</span>
                  {q.text}
                </p>
                {verdict !== undefined &&
                  (verdict ? (
                    <span className="shrink-0 text-xs font-semibold text-success">정답</span>
                  ) : (
                    <span className="shrink-0 text-xs font-semibold text-brand">오답</span>
                  ))}
              </div>

              {(q.type === "SINGLE" || q.type === "MULTI" || q.type === "TRUE_FALSE") && (
                <div className="mt-4 space-y-2">
                  {q.type === "MULTI" && <p className="text-xs text-muted">정답을 모두 고르세요</p>}
                  {q.options.map((opt, oi) => {
                    const checked = (choices[q.id] ?? []).includes(oi);
                    return (
                      <label
                        key={oi}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                          checked ? "border-ink bg-surface text-ink" : "border-line text-ink-soft hover:border-ink-soft"
                        }`}
                      >
                        <input
                          type={q.type === "MULTI" ? "checkbox" : "radio"}
                          name={q.id}
                          checked={checked}
                          disabled={!!result}
                          onChange={() => choose(q, oi)}
                          className="h-4 w-4 accent-[#18181b]"
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              )}

              {q.type === "FILL_GAP" && (
                <p className="mt-4 rounded-xl bg-surface p-4 text-[15px] leading-[2.4] text-ink-soft">
                  {q.segments.map((seg, si) => (
                    <Fragment key={si}>
                      {seg}
                      {si < q.segments.length - 1 && (
                        <input
                          aria-label={`${qi + 1}번 문항 ${si + 1}번째 빈칸`}
                          value={texts[q.id]?.[si] ?? ""}
                          disabled={!!result}
                          onChange={(e) => setText(q.id, si, e.target.value)}
                          className={inputCls}
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
                  className="mt-4 h-11 w-full rounded-xl border border-line px-4 text-sm text-ink focus:border-ink focus:outline-none disabled:bg-surface"
                />
              )}
            </fieldset>
          );
        })}

        {error && (
          <p role="alert" className="text-sm text-brand">
            {error}
          </p>
        )}

        {!result &&
          (enrolled ? (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-semibold text-white hover:bg-brand-strong disabled:opacity-70"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              제출하고 채점하기
            </button>
          ) : (
            <p className="text-sm text-muted">수강 신청 후 퀴즈를 제출할 수 있어요.</p>
          ))}
      </form>
    </div>
  );
}
