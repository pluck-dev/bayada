// 서비스 레이어 공통 유틸

import { DEFAULT_PAGE_SIZE } from "@bayada/shared/constants";

/** 페이지네이션 파라미터 파싱 */
export function paginationParams(params: { page?: number; limit?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/** 페이지네이션 결과 래핑 */
export function paginatedResult<T>(items: T[], total: number, page: number, limit: number) {
  return {
    items,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };
}
