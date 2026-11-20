import type { Metadata } from "next";
import { cookies } from "next/headers";
import { reviewAccessEnabled, reviewCookieName, safeReviewDestination } from "@bayada/review/access";
import { isReviewUnlocked } from "@bayada/review/server";
import { ReviewAccessForm } from "@bayada/review-ui/access-form";

export const metadata: Metadata = { title: "리뷰 모드", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// 클라이언트 검수용 리뷰 모드 잠금 해제·종료 화면 (사이트 내비게이션에는 노출하지 않는다)
export default async function ReviewAccessPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { next } = await searchParams;
  const store = await cookies();
  return (
    <ReviewAccessForm
      site="web"
      next={safeReviewDestination(Array.isArray(next) ? next[0] : next)}
      enabled={reviewAccessEnabled()}
      unlocked={isReviewUnlocked("web", store.get(reviewCookieName("web"))?.value)}
    />
  );
}
