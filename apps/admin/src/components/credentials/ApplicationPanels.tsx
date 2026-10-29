"use client";

import { useState } from "react";
import type { CredentialAppStatus } from "@bayada/db";
import {
  approveApplication,
  completeEvaluation,
  reopenEvaluation,
  rejectApplication,
  saveScores,
  startEvaluation,
  type ScoreInput,
} from "@/lib/actions/credentials";
import { judge, type Thresholds } from "@/lib/credentials";
import { Badge, Button, Card, Field, cx, inputClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

function Verdict({ passed }: { passed: boolean | null }) {
  if (passed === null) return <span className="text-[12.5px] text-subtle">점수를 입력하면 판정이 표시됩니다</span>;
  return <Badge tone={passed ? "blue" : "red"}>{passed ? "합격" : "불합격"}</Badge>;
}

function ScoreRow({ label, value, pass }: { label: string; value: number | null; pass: number }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 text-[13px]">
      <dt className="text-muted">{label}</dt>
      <dd>
        <span className="tabular font-semibold text-fg">{value ?? "-"}</span>
        <span className="tabular text-subtle"> / 합격 {pass}점</span>
      </dd>
    </div>
  );
}

/** 심사위원 평가 패널 — 평가 시작 → 점수 입력(임시 저장) → 평가 완료(판정) */
export function EvaluationPanel({
  id,
  status,
  canEvaluate,
  thresholds,
  initial,
  evaluatorName,
}: {
  id: string;
  status: CredentialAppStatus;
  canEvaluate: boolean;
  thresholds: Thresholds;
  initial: ScoreInput;
  evaluatorName: string | null;
}) {
  const { run, isPending } = useAction();
  const [v, setV] = useState<ScoreInput>(initial);
  const num = (s: string) => (s.trim() === "" ? null : Number(s));
  const editing = status === "EVALUATING" && canEvaluate;
  const scores = editing ? v : initial;
  const passed = judge(thresholds, num(scores.examScore), num(scores.practicalScore));
  const dirty = JSON.stringify(v) !== JSON.stringify(initial);

  return (
    <Card
      title="심사위원 평가"
      actions={evaluatorName && status !== "SUBMITTED" ? <span className="text-[11.5px] text-muted">{evaluatorName}</span> : undefined}
    >
      {status === "SUBMITTED" ? (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-zinc-600">아직 평가를 시작하지 않았습니다. 평가를 시작하면 담당 심사위원으로 기록됩니다.</p>
          {canEvaluate ? (
            <Button variant="primary" disabled={isPending} onClick={() => run(() => startEvaluation(id))}>
              평가 시작
            </Button>
          ) : (
            <p className="text-[12px] text-muted">심사위원(임상 리뷰어·Super Admin)이 평가합니다.</p>
          )}
        </div>
      ) : editing ? (
        <fieldset disabled={isPending} className="flex flex-col gap-3.5">
          <div className={cx("grid gap-3", thresholds.practicalRequired ? "grid-cols-2" : "grid-cols-1")}>
            <Field label="시험 점수" htmlFor="ev-exam" hint={`합격 ${thresholds.examPassingScore}점 이상`}>
              <input
                id="ev-exam"
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                className={cx(inputClass, "tabular")}
                value={v.examScore}
                onChange={(e) => setV({ ...v, examScore: e.target.value })}
              />
            </Field>
            {thresholds.practicalRequired && (
              <Field label="실기 점수" htmlFor="ev-practical" hint={`합격 ${thresholds.practicalPassingScore}점 이상`}>
                <input
                  id="ev-practical"
                  type="number"
                  min={0}
                  max={100}
                  inputMode="numeric"
                  className={cx(inputClass, "tabular")}
                  value={v.practicalScore}
                  onChange={(e) => setV({ ...v, practicalScore: e.target.value })}
                />
              </Field>
            )}
          </div>
          <Field label="평가 의견" htmlFor="ev-note" hint="실기 관찰 내용·보완점. 운영자가 승인할 때 참고합니다.">
            <textarea
              id="ev-note"
              rows={4}
              className={textareaClass}
              value={v.evaluatorNote}
              onChange={(e) => setV({ ...v, evaluatorNote: e.target.value })}
            />
          </Field>
          <div className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2">
            <span className="text-[12.5px] text-muted">판정 미리보기</span>
            <Verdict passed={passed} />
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" disabled={isPending || !dirty} onClick={() => run(() => saveScores(id, v))}>
              임시 저장
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={isPending || passed === null}
              onClick={() =>
                run(() => completeEvaluation(id, v), {
                  confirm: {
                    title: `평가를 마치고 ${passed ? "합격" : "불합격"}으로 판정할까요?`,
                    body: passed
                      ? "운영자 승인 대기로 넘어갑니다. 승인되면 인증번호가 발급됩니다."
                      : "운영자가 확인 후 반려 처리합니다. 필요하면 재평가할 수 있습니다.",
                    confirmLabel: "평가 완료",
                  },
                })
              }
            >
              평가 완료
            </Button>
          </div>
        </fieldset>
      ) : (
        <div className="flex flex-col gap-3">
          <dl className="divide-y divide-zinc-100">
            <ScoreRow label="시험" value={num(initial.examScore)} pass={thresholds.examPassingScore} />
            {thresholds.practicalRequired && (
              <ScoreRow label="실기" value={num(initial.practicalScore)} pass={thresholds.practicalPassingScore} />
            )}
          </dl>
          {status === "EVALUATING" && <p className="text-[12px] text-violet-700">심사위원이 평가 중입니다.</p>}
          {status !== "EVALUATING" && (
            <div className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2">
              <span className="text-[12.5px] text-muted">심사위원 판정</span>
              <Verdict passed={passed} />
            </div>
          )}
          {initial.evaluatorNote && (
            <p className="whitespace-pre-wrap rounded-md border border-line px-3 py-2 text-[12.5px] leading-relaxed text-zinc-700">
              {initial.evaluatorNote}
            </p>
          )}
          {status === "EVALUATED" && canEvaluate && (
            <Button
              size="sm"
              variant="ghost"
              className="self-start"
              disabled={isPending}
              onClick={() =>
                run(() => reopenEvaluation(id), {
                  confirm: { title: "다시 평가할까요?", body: "운영자 승인 대기에서 빠지고 평가 중으로 돌아갑니다.", confirmLabel: "재평가" },
                })
              }
            >
              재평가
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

/** 운영자 승인 패널 — 평가 완료(합격) 건 승인 = 인증 발급, 또는 사유와 함께 반려 */
export function DecisionPanel({
  id,
  status,
  canApprove,
  passed,
  prerequisitesDone,
  decisionNote,
  decidedAt,
  issuedNumber,
  validity,
}: {
  id: string;
  status: CredentialAppStatus;
  canApprove: boolean;
  passed: boolean | null;
  prerequisitesDone: boolean;
  decisionNote: string | null;
  decidedAt: string | null;
  issuedNumber: string | null;
  validity: string;
}) {
  const { run, isPending } = useAction();
  const [note, setNote] = useState("");

  if (status === "APPROVED" || status === "REJECTED") {
    return (
      <Card title="운영자 승인">
        <div className="flex flex-col gap-2.5 text-[13px]">
          <div className="flex items-center justify-between">
            <Badge tone={status === "APPROVED" ? "green" : "slate"}>{status === "APPROVED" ? "발급 완료" : "반려"}</Badge>
            {decidedAt && <span className="tabular text-[12px] text-muted">{decidedAt}</span>}
          </div>
          {issuedNumber && (
            <p>
              인증번호 <span className="font-mono font-semibold">{issuedNumber}</span>
            </p>
          )}
          {decisionNote && (
            <p className="whitespace-pre-wrap rounded-md border border-line px-3 py-2 text-[12.5px] leading-relaxed text-zinc-700">
              {decisionNote}
            </p>
          )}
        </div>
      </Card>
    );
  }

  if (!canApprove) {
    return (
      <Card title="운영자 승인">
        <p className="text-[12.5px] text-muted">평가가 끝나면 운영자(콘텐츠 운영자·Super Admin)가 승인해 발급합니다.</p>
      </Card>
    );
  }

  const blocked = status !== "EVALUATED" ? "평가 완료 후 승인할 수 있습니다." : !passed ? "불합격 판정은 발급할 수 없습니다." : !prerequisitesDone ? "선수 프로그램 미수료" : null;

  return (
    <Card title="운영자 승인">
      <fieldset disabled={isPending} className="flex flex-col gap-3">
        {status === "EVALUATED" && passed && (
          <p className="text-[12.5px] leading-relaxed text-zinc-600">
            승인하면 인증번호(BC-연도-일련번호)와 검증 QR이 자동 생성되고 학습자 인증서 지갑에 바로 표시됩니다. 유효기간 {validity}.
          </p>
        )}
        <Field label="처리 메모" htmlFor="dc-note" hint="반려할 때는 필수 — 학습자에게 사유로 보입니다.">
          <textarea id="dc-note" rows={3} className={textareaClass} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <Button
          variant="dark"
          disabled={isPending || !!blocked}
          title={blocked ?? undefined}
          onClick={() =>
            run(() => approveApplication(id, note), {
              confirm: { title: "승인하고 인증을 발급할까요?", body: "인증번호가 발급되며 되돌리려면 '발급된 인증'에서 취소해야 합니다.", confirmLabel: "승인 · 발급" },
            })
          }
        >
          승인 · 발급
        </Button>
        {blocked && <p className="-mt-1 text-center text-[11.5px] text-muted">{blocked}</p>}
        <Button
          variant="danger"
          disabled={isPending || !note.trim()}
          title={!note.trim() ? "반려 사유를 입력하세요" : undefined}
          onClick={() =>
            run(() => rejectApplication(id, note), {
              confirm: { title: "이 신청을 반려할까요?", body: "학습자는 사유를 확인한 뒤 다시 신청할 수 있습니다.", confirmLabel: "반려", danger: true },
            })
          }
        >
          반려
        </Button>
      </fieldset>
    </Card>
  );
}
