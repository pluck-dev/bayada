import type * as React from "react";

/**
 * 링크를 그리는 컴포넌트 (next/link 등). 공용 패키지는 Next 에 의존하지 않으므로
 * 앱이 `LinkComponent={Link}` 로 넘긴다. 기본은 <a>.
 */
export type LinkLike =
  | "a"
  | React.ComponentType<{ href: string; className?: string; children?: React.ReactNode; "aria-current"?: "page" | "step" | "true" | undefined; "aria-label"?: string; rel?: string }>;
