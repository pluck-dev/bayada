import type { CoverMode } from "@bayada/db";
import { CourseCover } from "@bayada/ui/cover";
import { coverInput, uploadedCover, type CoverSource } from "@/lib/cover";
import { CourseThumb } from "./CourseThumb";

export type CourseMediaSource = CoverSource & { coverMode: CoverMode; thumbnail: string | null };

/**
 * 프로그램 이미지가 들어가는 모든 곳(카드·상세·마이 러닝·홈 순위·결제)이 이것 하나를 쓴다.
 * 표지 방식이 UPLOAD 이고 이미지가 있으면 그 이미지, 아니면(또는 깨지면) 자동 표지.
 */
export function CourseMedia({ course, size = "card" }: { course: CourseMediaSource; size?: "card" | "thumb" }) {
  const cover = <CourseCover course={coverInput(course)} size={size} />;
  const src = uploadedCover(course);
  return src ? <CourseThumb src={src} fallback={cover} /> : cover;
}
