"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, FileText, ListChecks, Pencil, PlayCircle, Plus, Trash2, X } from "lucide-react";
import type { LectureType, QuestionType } from "@bayada/db";
import {
  addLecture,
  addSection,
  deleteLecture,
  deleteSection,
  moveLecture,
  moveSection,
  renameSection,
  saveQuiz,
  updateLecture,
  type QuestionInput,
} from "@/lib/actions/curriculum";
import { LECTURE_TYPE_LABEL, QUESTION_TYPES, QUESTION_TYPE_LABEL } from "@/lib/labels";
import { Button, EmptyState, Field, cx, inputClass, selectClass, textareaClass } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export interface CurriculumLecture {
  id: string;
  title: string;
  type: LectureType;
  videoUrl: string | null;
  content: string | null;
  duration: number | null; // 초
  isFree: boolean;
  quiz: { passingScore: number; questions: { id: string; type: QuestionType; text: string; options: unknown }[] } | null;
}
export interface CurriculumSection {
  id: string;
  title: string;
  lectures: CurriculumLecture[];
}

const TYPE_ICON = { VIDEO: PlayCircle, TEXT: FileText, QUIZ: ListChecks } as const;

function fmtDuration(sec: number | null) {
  if (!sec) return "";
  const m = Math.round(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)}시간 ${m % 60}분` : `${m}분`;
}

export function CurriculumEditor({
  courseId,
  sections,
  locked,
}: {
  courseId: string;
  sections: CurriculumSection[];
  locked: boolean;
}) {
  const { run, isPending } = useAction();
  const [newSection, setNewSection] = useState("");
  const total = sections.reduce((n, s) => n + s.lectures.length, 0);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption text-muted">
        섹션 {sections.length}개 · 레슨 {total}개
        {locked && " · 검토 중이라 편집이 잠겨 있습니다."}
      </p>

      {sections.length === 0 && (
        <div className="rounded-lg border border-line">
          <EmptyState title="아직 커리큘럼이 없습니다" description="섹션을 만든 뒤 영상·텍스트·퀴즈 레슨을 추가하세요. 승인 요청에는 레슨이 1개 이상 필요합니다." />
        </div>
      )}

      {sections.map((s, i) => (
        <SectionBlock key={s.id} section={s} index={i} last={i === sections.length - 1} locked={locked} />
      ))}

      {!locked && (
        <form
          className="flex items-center gap-2 rounded-lg border border-dashed border-line-strong p-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => addSection(courseId, newSection), { onSuccess: () => setNewSection("") });
          }}
        >
          <input
            className={inputClass}
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            placeholder="새 섹션 제목 (예: 1주차 · 치매의 이해)"
            aria-label="새 섹션 제목"
          />
          <Button type="submit" variant="secondary" disabled={isPending || !newSection.trim()}>
            <Plus className="h-3.5 w-3.5" aria-hidden />
            섹션 추가
          </Button>
        </form>
      )}
    </div>
  );
}

function SectionBlock({ section, index, last, locked }: { section: CurriculumSection; index: number; last: boolean; locked: boolean }) {
  const { run, isPending } = useAction();
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [newType, setNewType] = useState<LectureType>("VIDEO");
  const [newTitle, setNewTitle] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-canvas">
      <header className="flex items-center gap-2 bg-surface px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "접기" : "펼치기"}
          className="rounded p-0.5 text-muted hover:text-fg"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <span className="tabular text-caption text-subtle">{String(index + 1).padStart(2, "0")}</span>
        {editing ? (
          <form
            className="flex flex-1 items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => renameSection(section.id, title), { onSuccess: () => setEditing(false) });
            }}
          >
            <input autoFocus className={cx(inputClass, "h-7!")} value={title} onChange={(e) => setTitle(e.target.value)} aria-label="섹션 제목" />
            <Button size="sm" type="submit" variant="dark" disabled={isPending}>
              저장
            </Button>
            <Button size="sm" variant="ghost" onClick={() => (setEditing(false), setTitle(section.title))}>
              취소
            </Button>
          </form>
        ) : (
          <h3 className="flex-1 text-caption font-semibold">{section.title}</h3>
        )}
        <span className="text-caption text-muted">{section.lectures.length}개 레슨</span>
        {!locked && !editing && (
          <div className="flex items-center">
            <Button size="sm" variant="ghost" aria-label="섹션 제목 수정" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" aria-label="섹션 위로" disabled={index === 0 || isPending} onClick={() => run(() => moveSection(section.id, -1))}>
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" aria-label="섹션 아래로" disabled={last || isPending} onClick={() => run(() => moveSection(section.id, 1))}>
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="섹션 삭제"
              disabled={isPending}
              onClick={() =>
                run(() => deleteSection(section.id), {
                  confirm: {
                    title: `'${section.title}' 섹션을 삭제할까요?`,
                    body: `레슨 ${section.lectures.length}개와 퀴즈가 함께 삭제됩니다.`,
                    confirmLabel: "삭제",
                    danger: true,
                  },
                })
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </header>

      {open && (
        <ul>
          {section.lectures.map((l, j) => {
            const Icon = TYPE_ICON[l.type];
            const isOpen = expanded === l.id;
            return (
              <li key={l.id} className="border-t border-line-soft">
                <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface">
                  <Icon className="ml-6 h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                  <button
                    type="button"
                    className="flex-1 truncate text-left text-caption hover:underline"
                    onClick={() => setExpanded(isOpen ? null : l.id)}
                    aria-expanded={isOpen}
                  >
                    {l.title}
                  </button>
                  <span className="text-micro text-subtle">
                    {LECTURE_TYPE_LABEL[l.type]}
                    {l.type === "QUIZ" && l.quiz ? ` · ${l.quiz.questions.length}문항` : ""}
                    {l.duration ? ` · ${fmtDuration(l.duration)}` : ""}
                    {l.isFree ? " · 미리보기" : ""}
                  </span>
                  {!locked && (
                    <div className="flex items-center">
                      <Button size="sm" variant="ghost" aria-label="레슨 위로" disabled={j === 0 || isPending} onClick={() => run(() => moveLecture(l.id, -1))}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="레슨 아래로"
                        disabled={j === section.lectures.length - 1 || isPending}
                        onClick={() => run(() => moveLecture(l.id, 1))}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="레슨 삭제"
                        disabled={isPending}
                        onClick={() =>
                          run(() => deleteLecture(l.id), {
                            confirm: { title: `'${l.title}' 레슨을 삭제할까요?`, confirmLabel: "삭제", danger: true },
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                {isOpen && (
                  <div className="border-t border-line-soft bg-surface px-4 py-4 pl-12">
                    <LectureEditor lecture={l} locked={locked} />
                  </div>
                )}
              </li>
            );
          })}
          {!locked && (
            <li className="border-t border-line-soft px-3 py-2">
              <form
                className="flex items-center gap-2 pl-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => addLecture(section.id, newType, newTitle), {
                    onSuccess: (r) => {
                      setNewTitle("");
                      const id = "data" in r && r.data ? (r.data as { id: string }).id : null;
                      if (id) setExpanded(id);
                    },
                  });
                }}
              >
                <select
                  className={cx(selectClass, "h-7! w-[92px]!")}
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as LectureType)}
                  aria-label="레슨 유형"
                >
                  {(["VIDEO", "TEXT", "QUIZ"] as LectureType[]).map((t) => (
                    <option key={t} value={t}>
                      {LECTURE_TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
                <input
                  className={cx(inputClass, "h-7!")}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="레슨 제목"
                  aria-label="새 레슨 제목"
                />
                <Button size="sm" type="submit" variant="secondary" disabled={isPending || !newTitle.trim()}>
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  레슨 추가
                </Button>
              </form>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

function LectureEditor({ lecture, locked }: { lecture: CurriculumLecture; locked: boolean }) {
  const { run, isPending } = useAction();
  const [title, setTitle] = useState(lecture.title);
  const [videoUrl, setVideoUrl] = useState(lecture.videoUrl ?? "");
  const [durationMin, setDurationMin] = useState<number | null>(lecture.duration ? Math.round(lecture.duration / 60) : null);
  const [content, setContent] = useState(lecture.content ?? "");
  const [isFree, setIsFree] = useState(lecture.isFree);

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => updateLecture(lecture.id, { title, videoUrl, durationMin, content, isFree }));
        }}
      >
        <fieldset disabled={locked || isPending} className="grid grid-cols-6 gap-3">
          <Field label="레슨 제목" required className="col-span-4">
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="재생 시간 (분)" className="col-span-1">
            <input
              type="number"
              min={0}
              className={cx(inputClass, "tabular")}
              value={durationMin ?? ""}
              onChange={(e) => setDurationMin(e.target.value ? Number(e.target.value) : null)}
            />
          </Field>
          <label className="col-span-1 flex items-end gap-1.5 pb-1.5 text-caption">
            <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="h-4 w-4 accent-zinc-900" />
            무료 미리보기
          </label>
          {lecture.type === "VIDEO" && (
            <Field label="영상 URL" className="col-span-6" hint="MP4 주소 또는 YouTube 링크">
              <input className={cx(inputClass, "font-mono text-caption!")} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://" />
            </Field>
          )}
          {lecture.type === "TEXT" && (
            <Field label="본문" className="col-span-6" hint="HTML 사용 가능">
              <textarea rows={8} className={cx(textareaClass, "font-mono text-caption!")} value={content} onChange={(e) => setContent(e.target.value)} />
            </Field>
          )}
          {!locked && (
            <div className="col-span-6 flex justify-end">
              <Button type="submit" size="sm" variant="dark">
                레슨 저장
              </Button>
            </div>
          )}
        </fieldset>
      </form>
      {lecture.type === "VIDEO" && lecture.videoUrl && /\.mp4(\?|$)/i.test(lecture.videoUrl) && (
        <video src={lecture.videoUrl} controls preload="metadata" className="aspect-video w-full max-w-[480px] rounded-md bg-black" />
      )}
      {lecture.type === "QUIZ" && <QuizEditor lecture={lecture} locked={locked} />}
    </div>
  );
}

function toOptions(raw: unknown): { text: string; correct: boolean }[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((o) => ({ text: String((o as { text?: unknown }).text ?? ""), correct: !!(o as { correct?: unknown }).correct }));
}

function QuizEditor({ lecture, locked }: { lecture: CurriculumLecture; locked: boolean }) {
  const { run, isPending } = useAction();
  const [passingScore, setPassingScore] = useState(lecture.quiz?.passingScore ?? 80);
  const [questions, setQuestions] = useState<QuestionInput[]>(
    (lecture.quiz?.questions ?? []).map((q) => ({ id: q.id, type: q.type, text: q.text, options: toOptions(q.options) })),
  );

  const patch = (i: number, p: Partial<QuestionInput>) => setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...p } : q)));
  const setOpt = (i: number, k: number, p: Partial<{ text: string; correct: boolean }>) =>
    setQuestions((qs) =>
      qs.map((q, j) => {
        if (j !== i) return q;
        const single = q.type === "SINGLE" || q.type === "TRUE_FALSE";
        return {
          ...q,
          options: q.options.map((o, m) => {
            if (m === k) return { ...o, ...p };
            // 단일 정답 문항은 다른 보기의 정답 표시를 끈다
            return single && p.correct ? { ...o, correct: false } : o;
          }),
        };
      }),
    );

  const addQuestion = () =>
    setQuestions((qs) => [
      ...qs,
      { type: "SINGLE", text: "", options: [{ text: "", correct: true }, { text: "", correct: false }] },
    ]);

  const changeType = (i: number, type: QuestionType) => {
    if (type === "TRUE_FALSE") patch(i, { type, options: [{ text: "O", correct: true }, { text: "X", correct: false }] });
    else if (type === "KEYWORDS" || type === "FILL_GAP") patch(i, { type, options: [{ text: "", correct: false }] });
    else patch(i, { type });
  };

  return (
    <div className="rounded-md border border-line bg-canvas">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <p className="text-caption font-semibold">퀴즈 문항 {questions.length}개</p>
        <label className="flex items-center gap-2 text-caption text-muted">
          합격 점수
          <input
            type="number"
            min={0}
            max={100}
            disabled={locked}
            className={cx(inputClass, "tabular h-7! w-16!")}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
          />
          %
        </label>
      </div>
      <ol className="flex flex-col divide-y divide-line-soft">
        {questions.map((q, i) => (
          <li key={i} className="flex flex-col gap-2 px-3 py-3">
            <div className="flex items-start gap-2">
              <span className="tabular mt-1.5 w-5 text-right text-caption text-subtle">{i + 1}.</span>
              <select
                disabled={locked}
                className={cx(selectClass, "w-[120px]!")}
                value={q.type}
                onChange={(e) => changeType(i, e.target.value as QuestionType)}
                aria-label={`${i + 1}번 문항 유형`}
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {QUESTION_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
              <textarea
                disabled={locked}
                rows={q.type === "FILL_GAP" ? 1 : 2}
                className={textareaClass}
                value={q.text}
                onChange={(e) => patch(i, { text: e.target.value })}
                placeholder="문항 내용"
                aria-label={`${i + 1}번 문항 내용`}
              />
              {!locked && (
                <Button size="sm" variant="ghost" aria-label={`${i + 1}번 문항 삭제`} onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="ml-7 flex flex-col gap-1.5">
              {q.type === "FILL_GAP" && <p className="text-micro text-muted">보기 본문에서 정답을 |정답| 처럼 세로막대로 감싸면 빈칸이 됩니다.</p>}
              {q.type === "KEYWORDS" && <p className="text-micro text-muted">정답으로 인정할 키워드를 한 줄에 하나씩 입력합니다.</p>}
              {q.options.map((o, k) => (
                <div key={k} className="flex items-center gap-2">
                  {(q.type === "SINGLE" || q.type === "MULTI" || q.type === "TRUE_FALSE") && (
                    <input
                      type={q.type === "MULTI" ? "checkbox" : "radio"}
                      name={`q-${lecture.id}-${i}`}
                      disabled={locked}
                      checked={o.correct}
                      onChange={(e) => setOpt(i, k, { correct: e.target.checked })}
                      aria-label={`보기 ${k + 1} 정답`}
                      className="h-4 w-4 accent-emerald-600"
                    />
                  )}
                  <input
                    disabled={locked || q.type === "TRUE_FALSE"}
                    className={cx(inputClass, "h-7!", o.correct && q.type !== "KEYWORDS" && q.type !== "FILL_GAP" && "border-success-line! bg-success-soft!")}
                    value={o.text}
                    onChange={(e) => setOpt(i, k, { text: e.target.value })}
                    placeholder={q.type === "KEYWORDS" ? "키워드" : q.type === "FILL_GAP" ? "본문 (|정답| 포함)" : `보기 ${k + 1}`}
                    aria-label={`보기 ${k + 1}`}
                  />
                  {!locked && q.type !== "TRUE_FALSE" && q.options.length > 1 && (
                    <Button size="sm" variant="ghost" aria-label={`보기 ${k + 1} 삭제`} onClick={() => patch(i, { options: q.options.filter((_, m) => m !== k) })}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              {!locked && q.type !== "TRUE_FALSE" && q.type !== "FILL_GAP" && (
                <button
                  type="button"
                  className="w-fit text-caption text-subtle hover:text-fg"
                  onClick={() => patch(i, { options: [...q.options, { text: "", correct: false }] })}
                >
                  + {q.type === "KEYWORDS" ? "키워드" : "보기"} 추가
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
      {!locked && (
        <div className="flex items-center justify-between border-t border-line px-3 py-2">
          <Button size="sm" variant="ghost" onClick={addQuestion}>
            <Plus className="h-3.5 w-3.5" aria-hidden />
            문항 추가
          </Button>
          <Button size="sm" variant="dark" disabled={isPending} onClick={() => run(() => saveQuiz(lecture.id, passingScore, questions))}>
            퀴즈 저장
          </Button>
        </div>
      )}
    </div>
  );
}
