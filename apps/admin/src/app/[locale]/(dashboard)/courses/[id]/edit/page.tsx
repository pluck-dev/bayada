"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Video,
  FileText,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@bayada/ui";
import { COURSE_STATUS_LABELS } from "@bayada/shared";

const statusOptions = [
  { value: "DRAFT", label: "초안" },
  { value: "PUBLISHED", label: "공개" },
  { value: "ARCHIVED", label: "보관" },
];

const lectureTypeOptions = [
  { value: "VIDEO", label: "영상" },
  { value: "TEXT", label: "텍스트" },
];

interface CategoryOption {
  value: string;
  label: string;
}

interface Lecture {
  id: string;
  title: string;
  type: "VIDEO" | "TEXT";
  duration: number | null;
  isFree: boolean;
  videoUrl?: string | null;
}

interface Section {
  id: string;
  title: string;
  order: number;
  expanded: boolean;
  lectures: Lecture[];
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  status: string;
  thumbnail: string | null;
  categoryId: string | null;
  sections: Array<{
    id: string;
    title: string;
    order: number;
    lectures: Lecture[];
  }>;
}

// 모달 상태 타입
interface SectionModalState {
  open: boolean;
  mode: "create" | "edit";
  sectionId?: string;
  title: string;
}

interface LectureModalState {
  open: boolean;
  mode: "create" | "edit";
  sectionId: string;
  lectureId?: string;
  title: string;
  type: "VIDEO" | "TEXT";
  videoUrl: string;
  duration: string;
  isFree: boolean;
}

interface DeleteConfirmState {
  open: boolean;
  type: "section" | "lecture";
  id: string;
  sectionId?: string;
  name: string;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const initialSectionModal: SectionModalState = {
  open: false,
  mode: "create",
  title: "",
};

const initialLectureModal: LectureModalState = {
  open: false,
  mode: "create",
  sectionId: "",
  title: "",
  type: "VIDEO",
  videoUrl: "",
  duration: "",
  isFree: false,
};

const initialDeleteConfirm: DeleteConfirmState = {
  open: false,
  type: "section",
  id: "",
  name: "",
};

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 모달 상태
  const [sectionModal, setSectionModal] = useState<SectionModalState>(initialSectionModal);
  const [lectureModal, setLectureModal] = useState<LectureModalState>(initialLectureModal);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>(initialDeleteConfirm);
  const [modalSaving, setModalSaving] = useState(false);

  // 데이터 로드
  useEffect(() => {
    loadCourse();
    fetch("/api/v1/categories")
      .then((r) => r.json())
      .then((cats) => {
        setCategories(
          (cats ?? []).map((c: { id: string; name: string }) => ({
            value: c.id,
            label: c.name,
          }))
        );
      })
      .catch(() => {});
  }, [id]);

  const loadCourse = async () => {
    try {
      const res = await fetch(`/api/v1/courses/${id}`);
      const courseData = await res.json();
      setCourse(courseData);
      setSections(
        (courseData.sections ?? []).map(
          (s: CourseData["sections"][number], i: number) => ({
            ...s,
            expanded: i === 0,
          })
        )
      );
    } catch {
      // 무시
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, expanded: !s.expanded } : s
      )
    );
  };

  // ─── 강의 기본 정보 저장 ───
  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title") as string,
      slug: form.get("slug") as string,
      description: form.get("description") as string,
      price: Number(form.get("price")) || 0,
      categoryId: (form.get("category") as string) || null,
      status: (form.get("status") as string) || "DRAFT",
      thumbnail: (form.get("thumbnail") as string) || null,
    };

    try {
      const res = await fetch(`/api/v1/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "저장에 실패했습니다");
        return;
      }
      const updated = await res.json();
      setCourse(updated);
      alert("변경사항이 저장되었습니다");
    } catch {
      alert("네트워크 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  // ─── 섹션 CRUD ───
  const openAddSection = () => {
    setSectionModal({ open: true, mode: "create", title: "" });
  };

  const openEditSection = (sectionId: string, title: string) => {
    setSectionModal({ open: true, mode: "edit", sectionId, title });
  };

  const handleSaveSection = async () => {
    if (!sectionModal.title.trim()) return;
    setModalSaving(true);

    try {
      if (sectionModal.mode === "create") {
        const res = await fetch(`/api/v1/courses/${id}/sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: sectionModal.title.trim() }),
        });
        if (!res.ok) throw new Error();
        const newSection = await res.json();
        setSections((prev) => [
          ...prev,
          { ...newSection, expanded: true },
        ]);
      } else {
        const res = await fetch(
          `/api/v1/courses/${id}/sections/${sectionModal.sectionId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: sectionModal.title.trim() }),
          }
        );
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionModal.sectionId
              ? { ...s, title: updated.title, lectures: updated.lectures ?? s.lectures }
              : s
          )
        );
      }
      setSectionModal(initialSectionModal);
    } catch {
      alert("섹션 저장에 실패했습니다");
    } finally {
      setModalSaving(false);
    }
  };

  const confirmDeleteSection = (sectionId: string, name: string) => {
    setDeleteConfirm({ open: true, type: "section", id: sectionId, name });
  };

  const handleDeleteSection = async () => {
    setModalSaving(true);
    try {
      const res = await fetch(
        `/api/v1/courses/${id}/sections/${deleteConfirm.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      setSections((prev) => prev.filter((s) => s.id !== deleteConfirm.id));
      setDeleteConfirm(initialDeleteConfirm);
    } catch {
      alert("섹션 삭제에 실패했습니다");
    } finally {
      setModalSaving(false);
    }
  };

  // ─── 레슨 CRUD ───
  const openAddLecture = (sectionId: string) => {
    setLectureModal({
      open: true,
      mode: "create",
      sectionId,
      title: "",
      type: "VIDEO",
      videoUrl: "",
      duration: "",
      isFree: false,
    });
  };

  const openEditLecture = (sectionId: string, lecture: Lecture) => {
    setLectureModal({
      open: true,
      mode: "edit",
      sectionId,
      lectureId: lecture.id,
      title: lecture.title,
      type: lecture.type,
      videoUrl: lecture.videoUrl ?? "",
      duration: lecture.duration ? String(lecture.duration) : "",
      isFree: lecture.isFree,
    });
  };

  const handleSaveLecture = async () => {
    if (!lectureModal.title.trim()) return;
    setModalSaving(true);

    const body = {
      title: lectureModal.title.trim(),
      type: lectureModal.type,
      videoUrl: lectureModal.videoUrl || null,
      duration: lectureModal.duration ? Number(lectureModal.duration) : null,
      isFree: lectureModal.isFree,
    };

    try {
      if (lectureModal.mode === "create") {
        const res = await fetch(
          `/api/v1/courses/${id}/sections/${lectureModal.sectionId}/lectures`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (!res.ok) throw new Error();
        const newLecture = await res.json();
        setSections((prev) =>
          prev.map((s) =>
            s.id === lectureModal.sectionId
              ? { ...s, lectures: [...s.lectures, newLecture] }
              : s
          )
        );
      } else {
        const res = await fetch(
          `/api/v1/courses/${id}/sections/${lectureModal.sectionId}/lectures/${lectureModal.lectureId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setSections((prev) =>
          prev.map((s) =>
            s.id === lectureModal.sectionId
              ? {
                  ...s,
                  lectures: s.lectures.map((l) =>
                    l.id === lectureModal.lectureId ? { ...l, ...updated } : l
                  ),
                }
              : s
          )
        );
      }
      setLectureModal(initialLectureModal);
    } catch {
      alert("레슨 저장에 실패했습니다");
    } finally {
      setModalSaving(false);
    }
  };

  const confirmDeleteLecture = (
    sectionId: string,
    lectureId: string,
    name: string
  ) => {
    setDeleteConfirm({
      open: true,
      type: "lecture",
      id: lectureId,
      sectionId,
      name,
    });
  };

  const handleDeleteLecture = async () => {
    setModalSaving(true);
    try {
      const res = await fetch(
        `/api/v1/courses/${id}/sections/${deleteConfirm.sectionId}/lectures/${deleteConfirm.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      setSections((prev) =>
        prev.map((s) =>
          s.id === deleteConfirm.sectionId
            ? { ...s, lectures: s.lectures.filter((l) => l.id !== deleteConfirm.id) }
            : s
        )
      );
      setDeleteConfirm(initialDeleteConfirm);
    } catch {
      alert("레슨 삭제에 실패했습니다");
    } finally {
      setModalSaving(false);
    }
  };

  // ─── 삭제 확인 핸들러 ───
  const handleConfirmDelete = () => {
    if (deleteConfirm.type === "section") {
      handleDeleteSection();
    } else {
      handleDeleteLecture();
    }
  };

  // ─── 강의 삭제 ───
  const [deletingCourse, setDeletingCourse] = useState(false);

  const handleDeleteCourse = async () => {
    if (!confirm("이 강의를 완전히 삭제하시겠습니까?\n포함된 모든 섹션과 강의가 함께 삭제되며, 되돌릴 수 없습니다.")) {
      return;
    }
    setDeletingCourse(true);
    try {
      const res = await fetch(`/api/v1/courses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "강의 삭제에 실패했습니다");
        return;
      }
      router.push("/courses");
    } catch {
      alert("네트워크 오류가 발생했습니다");
    } finally {
      setDeletingCourse(false);
    }
  };

  // ─── 렌더링 ───
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-16 text-center text-[color:var(--muted)]">
        강의를 찾을 수 없습니다
      </div>
    );
  }

  const statusVariant =
    course.status === "PUBLISHED"
      ? "success"
      : course.status === "ARCHIVED"
        ? "default"
        : "secondary";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* 뒤로가기 */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm text-[color:var(--muted)] hover:text-[color:var(--fg)]"
      >
        <ArrowLeft className="h-4 w-4" />
        강의 목록으로
      </Link>

      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--fg)]">
            강의 편집
          </h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            강의 정보와 커리큘럼을 수정합니다.
          </p>
        </div>
        <Badge variant={statusVariant as "success" | "default" | "secondary"}>
          {COURSE_STATUS_LABELS[course.status as keyof typeof COURSE_STATUS_LABELS] ?? course.status}
        </Badge>
      </div>

      {/* 기본 정보 */}
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              id="title"
              name="title"
              label="강의 제목"
              defaultValue={course.title}
            />
            <Input
              id="slug"
              name="slug"
              label="URL 슬러그"
              defaultValue={course.slug}
            />
            <Textarea
              id="description"
              name="description"
              label="강의 설명"
              defaultValue={course.description ?? ""}
              rows={3}
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Input
                id="price"
                name="price"
                label="가격 (원)"
                type="number"
                defaultValue={course.price}
              />
              <Select
                id="category"
                name="category"
                label="카테고리"
                options={categories}
                defaultValue={course.categoryId ?? undefined}
              />
              <Select
                id="status"
                name="status"
                label="상태"
                options={statusOptions}
                defaultValue={course.status}
              />
            </div>
            <Input
              id="thumbnail"
              name="thumbnail"
              label="썸네일 URL"
              defaultValue={course.thumbnail ?? ""}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "저장 중..." : "변경사항 저장"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* 커리큘럼 관리 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>커리큘럼</CardTitle>
            <Button variant="outline" size="sm" onClick={openAddSection}>
              <Plus className="mr-1.5 h-4 w-4" />
              섹션 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-lg border border-[color:var(--border)] bg-white"
            >
              {/* 섹션 헤더 */}
              <div className="flex items-center gap-3 px-4 py-3">
                <GripVertical className="h-4 w-4 shrink-0 text-[color:var(--muted)] cursor-grab" />
                <button
                  type="button"
                  className="flex flex-1 items-center gap-2 text-left"
                  onClick={() => toggleSection(section.id)}
                >
                  {section.expanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-[color:var(--muted)]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--muted)]" />
                  )}
                  <span className="flex-1 text-sm font-medium text-[color:var(--fg)]">
                    {section.title}
                  </span>
                  <span className="text-xs text-[color:var(--muted)]">
                    {section.lectures.length}개 강의
                  </span>
                </button>
                <button
                  type="button"
                  className="rounded p-1 text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditSection(section.id, section.title);
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded p-1 text-[color:var(--muted)] hover:bg-[color:var(--error-bg)] hover:text-[color:var(--error)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDeleteSection(section.id, section.title);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* 레슨 목록 */}
              {section.expanded && (
                <div className="border-t border-[color:var(--border)]">
                  {section.lectures.map((lecture) => (
                    <div
                      key={lecture.id}
                      className="flex items-center gap-3 border-b border-[color:var(--border)] px-4 py-2.5 pl-14 last:border-0"
                    >
                      <GripVertical className="h-3.5 w-3.5 shrink-0 text-[color:var(--muted)] cursor-grab" />
                      {lecture.type === "VIDEO" ? (
                        <Video className="h-4 w-4 shrink-0 text-[color:var(--info)]" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-[color:var(--warning)]" />
                      )}
                      <span className="flex-1 text-sm text-[color:var(--fg)]">
                        {lecture.title}
                      </span>
                      {lecture.isFree && (
                        <Badge variant="info">무료</Badge>
                      )}
                      <span className="text-xs text-[color:var(--muted)]">
                        {formatDuration(lecture.duration)}
                      </span>
                      <button
                        type="button"
                        className="rounded p-1 text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--fg)]"
                        onClick={() => openEditLecture(section.id, lecture)}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-[color:var(--muted)] hover:bg-[color:var(--error-bg)] hover:text-[color:var(--error)]"
                        onClick={() =>
                          confirmDeleteLecture(section.id, lecture.id, lecture.title)
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {/* 레슨 추가 버튼 */}
                  <div className="px-4 py-2.5 pl-14">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ce0e2d] hover:underline"
                      onClick={() => openAddLecture(section.id)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      강의 추가
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {sections.length === 0 && (
            <p className="py-8 text-center text-sm text-[color:var(--muted)]">
              아직 커리큘럼이 없습니다. 섹션을 추가해 주세요.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ─── 강의 삭제 ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[color:var(--error)]">위험 영역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[color:var(--fg)]">강의 삭제</p>
              <p className="text-xs text-[color:var(--muted)]">
                이 강의와 모든 섹션, 강의 콘텐츠가 영구적으로 삭제됩니다.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteCourse}
              disabled={deletingCourse}
            >
              {deletingCourse && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deletingCourse ? "삭제 중..." : "강의 삭제"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── 섹션 추가/편집 모달 ─── */}
      <Modal
        open={sectionModal.open}
        onClose={() => setSectionModal(initialSectionModal)}
      >
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {sectionModal.mode === "create" ? "새 섹션 추가" : "섹션 편집"}
            </ModalTitle>
            <button
              onClick={() => setSectionModal(initialSectionModal)}
              className="rounded p-1 text-[color:var(--muted)] hover:text-[color:var(--fg)]"
            >
              <X className="h-4 w-4" />
            </button>
          </ModalHeader>
          <div className="space-y-4">
            <Input
              id="section-title"
              label="섹션 제목"
              placeholder="예: 1장. 기본 개념"
              value={sectionModal.title}
              onChange={(e) =>
                setSectionModal((prev) => ({ ...prev, title: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSaveSection();
                }
              }}
            />
          </div>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setSectionModal(initialSectionModal)}
            >
              취소
            </Button>
            <Button
              onClick={handleSaveSection}
              disabled={modalSaving || !sectionModal.title.trim()}
            >
              {modalSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {sectionModal.mode === "create" ? "추가" : "저장"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ─── 레슨 추가/편집 모달 ─── */}
      <Modal
        open={lectureModal.open}
        onClose={() => setLectureModal(initialLectureModal)}
      >
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {lectureModal.mode === "create" ? "새 강의 추가" : "강의 편집"}
            </ModalTitle>
            <button
              onClick={() => setLectureModal(initialLectureModal)}
              className="rounded p-1 text-[color:var(--muted)] hover:text-[color:var(--fg)]"
            >
              <X className="h-4 w-4" />
            </button>
          </ModalHeader>
          <div className="space-y-4">
            <Input
              id="lecture-title"
              label="강의 제목"
              placeholder="예: 1-1. 소개 영상"
              value={lectureModal.title}
              onChange={(e) =>
                setLectureModal((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                id="lecture-type"
                label="유형"
                options={lectureTypeOptions}
                value={lectureModal.type}
                onChange={(e) =>
                  setLectureModal((prev) => ({
                    ...prev,
                    type: e.target.value as "VIDEO" | "TEXT",
                  }))
                }
              />
              <Input
                id="lecture-duration"
                label="길이 (초)"
                type="number"
                placeholder="예: 360"
                value={lectureModal.duration}
                onChange={(e) =>
                  setLectureModal((prev) => ({ ...prev, duration: e.target.value }))
                }
              />
            </div>
            <Input
              id="lecture-video-url"
              label="영상 URL"
              placeholder="https://..."
              value={lectureModal.videoUrl}
              onChange={(e) =>
                setLectureModal((prev) => ({ ...prev, videoUrl: e.target.value }))
              }
            />
            <label className="flex items-center gap-2 text-sm text-[color:var(--fg)]">
              <input
                type="checkbox"
                checked={lectureModal.isFree}
                onChange={(e) =>
                  setLectureModal((prev) => ({
                    ...prev,
                    isFree: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              무료 공개 강의
            </label>
          </div>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setLectureModal(initialLectureModal)}
            >
              취소
            </Button>
            <Button
              onClick={handleSaveLecture}
              disabled={modalSaving || !lectureModal.title.trim()}
            >
              {modalSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {lectureModal.mode === "create" ? "추가" : "저장"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ─── 삭제 확인 모달 ─── */}
      <Modal
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm(initialDeleteConfirm)}
      >
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {deleteConfirm.type === "section" ? "섹션 삭제" : "강의 삭제"}
            </ModalTitle>
          </ModalHeader>
          <p className="text-sm text-[color:var(--muted)]">
            <span className="font-medium text-[color:var(--fg)]">
              &ldquo;{deleteConfirm.name}&rdquo;
            </span>
            {deleteConfirm.type === "section"
              ? "을(를) 삭제하면 포함된 모든 강의도 함께 삭제됩니다."
              : "을(를) 삭제하시겠습니까?"}
            <br />
            이 작업은 되돌릴 수 없습니다.
          </p>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(initialDeleteConfirm)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={modalSaving}
            >
              {modalSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              삭제
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
