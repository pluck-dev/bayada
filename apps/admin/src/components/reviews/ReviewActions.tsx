"use client";

import type { ReviewStatus } from "@bayada/db";
import { moderateReview } from "@/lib/actions/reviews";
import { Button } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export function ReviewActions({ id, status, reportCount }: { id: string; status: ReviewStatus; reportCount: number }) {
  const { run, isPending } = useAction();
  if (status === "HIDDEN") {
    return (
      <Button
        size="sm"
        variant="secondary"
        disabled={isPending}
        onClick={() =>
          run(() => moderateReview(id, "publish"), {
            confirm: {
              title: "이 후기를 다시 게시할까요?",
              body: "학습자 화면에 다시 보이고, 신고 수는 0으로 초기화됩니다.",
              confirmLabel: "다시 게시",
            },
          })
        }
      >
        다시 게시
      </Button>
    );
  }
  return (
    <div className="flex justify-end gap-1">
      {reportCount > 0 && (
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          title="신고를 검토했고 문제가 없어 계속 게시합니다"
          onClick={() =>
            run(() => moderateReview(id, "dismiss"), {
              confirm: { title: "신고를 기각할까요?", body: "후기는 계속 게시되고 신고 수는 0으로 초기화됩니다.", confirmLabel: "신고 기각" },
            })
          }
        >
          신고 기각
        </Button>
      )}
      <Button
        size="sm"
        variant="danger"
        disabled={isPending}
        onClick={() =>
          run(() => moderateReview(id, "hide"), {
            confirm: { title: "이 후기를 숨길까요?", body: "학습자 화면에서 보이지 않습니다. 나중에 다시 게시할 수 있습니다.", confirmLabel: "숨김", danger: true },
          })
        }
      >
        숨김
      </Button>
    </div>
  );
}
