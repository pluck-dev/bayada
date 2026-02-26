import { createMetadata } from "@/lib/seo";
import { reviews, getAverageRating } from "@/data/reviews";
import { services } from "@/data/services";
import { ReviewsClient } from "./ReviewsClient";

export const metadata = createMetadata({
  title: "이용자 후기",
  description:
    "바야다홈헬스케어 이용자 후기 - 실제 서비스를 경험한 분들의 생생한 후기를 확인하세요.",
  path: "/ko/reviews",
});

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const avg = getAverageRating();

  return (
    <ReviewsClient
      reviews={reviews}
      services={services}
      averageRating={avg}
    />
  );
}
