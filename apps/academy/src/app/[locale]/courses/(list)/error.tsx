"use client";

import { RotateCw } from "lucide-react";
import { Button, EmptyState } from "@bayada/ui";

export default function CatalogError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page page-y">
      <EmptyState
        framed
        title="프로그램을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        action={
          <Button onClick={reset} leftIcon={<RotateCw aria-hidden />}>
            다시 시도
          </Button>
        }
      />
    </div>
  );
}
