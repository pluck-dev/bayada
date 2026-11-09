"use client";
// 잠금 해제된 브라우저에서만 불러오는 리뷰 도구 본체 (gate.tsx 가 next/dynamic 으로 로드)
import type { ReviewSiteKey } from "@bayada/review/config";
import { ElementInspector } from "./element-inspector";
import { REVIEW_API, ReviewSiteContext } from "./shared";
import "./review.css";

export async function exitReviewMode() {
  await fetch(REVIEW_API.session, { method: "DELETE" }).catch(() => null);
}

export default function ReviewTools({ site }: { site: ReviewSiteKey }) {
  return <ReviewSiteContext.Provider value={site}>
    <ElementInspector onExit={async () => {
      await exitReviewMode();
      // 표시 쿼리·해시를 지우고 일반 화면으로 다시 연다
      location.replace(location.pathname + location.search);
    }} />
  </ReviewSiteContext.Provider>;
}
