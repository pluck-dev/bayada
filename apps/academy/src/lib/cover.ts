import type { CoverMode, JobRole, Level, ProductType } from "@bayada/db";
import type { CoverInput } from "@bayada/ui/cover";
import { JOB_ROLE_LABEL, LEVEL_LABEL, PRODUCT_TYPE_LABEL } from "@/lib/labels";

/** 아카데미 프로그램 데이터 → 표지 입력. 표지 규칙(색·무늬)은 @bayada/ui/cover 한 곳에 있다 */
export interface CoverSource {
  slug: string;
  title: string;
  productType: ProductType;
  level?: Level | null;
  audiences?: JobRole[];
  category?: { name: string; slug: string } | null;
}

export function audienceLabel(audiences: JobRole[] = []): string {
  if (audiences.length === 0) return "전 직군";
  return audiences.length > 1
    ? `${JOB_ROLE_LABEL[audiences[0]]} 외 ${audiences.length - 1}`
    : JOB_ROLE_LABEL[audiences[0]];
}

export function coverInput(c: CoverSource): CoverInput {
  return {
    slug: c.slug,
    title: c.title,
    category: c.category ?? null,
    typeLabel: PRODUCT_TYPE_LABEL[c.productType],
    levelLabel: c.level ? LEVEL_LABEL[c.level] : null,
    audienceLabel: audienceLabel(c.audiences),
  };
}

/** 업로드 이미지를 쓸지: UPLOAD 로 고르고 이미지가 있을 때만. 그 외(AUTO·이미지 없음)는 자동 표지 */
export function uploadedCover(c: { coverMode: CoverMode; thumbnail: string | null }): string | null {
  return c.coverMode === "UPLOAD" && c.thumbnail ? c.thumbnail : null;
}

/** OG·공유용 표지 이미지 주소 (상대 경로 — metadataBase 가 절대 주소로 바꾼다) */
export function coverImagePath(c: { slug: string; coverMode: CoverMode; thumbnail: string | null }): string {
  return uploadedCover(c) ?? `/api/cover/${encodeURIComponent(c.slug)}`;
}
