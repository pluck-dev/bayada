"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import type { CourseStatus, ProductType, Visibility } from "@bayada/db";
import { setFeatured } from "@/lib/actions/programs";
import { COURSE_STATUS_LABEL, COURSE_STATUS_TONE, PRODUCT_TYPE_LABEL } from "@/lib/labels";
import { Badge, Button, Card, EmptyState, selectClass, cx } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";
import { VisibilityPill } from "@/components/programs/ProgramTable";

export function FeaturedManager({
  locale,
  featured,
  candidates,
}: {
  locale: string;
  featured: { id: string; title: string; status: CourseStatus; visibility: Visibility; productType: ProductType }[];
  candidates: { id: string; title: string; visibility: Visibility }[];
}) {
  const { run, isPending } = useAction();
  const [pick, setPick] = useState("");

  return (
    <Card
      title={`메인 큐레이션 · 신규·인기 (${featured.length})`}
      padded={false}
      actions={
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (pick) run(() => setFeatured(pick, true), { onSuccess: () => setPick("") });
          }}
        >
          <select
            className={cx(selectClass, "h-7! w-[280px]! text-caption!")}
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            aria-label="큐레이션에 추가할 프로그램"
          >
            <option value="">게시된 프로그램 선택…</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.visibility === "PUBLIC" ? "외부" : "사내"})
              </option>
            ))}
          </select>
          <Button size="sm" type="submit" variant="secondary" disabled={!pick || isPending}>
            <Plus className="h-3.5 w-3.5" aria-hidden />
            추가
          </Button>
        </form>
      }
    >
      {featured.length === 0 ? (
        <EmptyState title="큐레이션된 프로그램이 없습니다" description="오른쪽 위에서 게시된 프로그램을 골라 메인 신규·인기 영역에 노출하세요." />
      ) : (
        <ul className="divide-y divide-line-soft">
          {featured.map((f) => (
            <li key={f.id} className="flex items-center gap-3 px-4 py-2.5 text-caption">
              <Link href={`/${locale}/programs/${f.id}`} className="flex-1 truncate font-medium hover:underline">
                {f.title}
              </Link>
              <span className="text-caption text-muted">{PRODUCT_TYPE_LABEL[f.productType]}</span>
              <VisibilityPill value={f.visibility} />
              <Badge tone={COURSE_STATUS_TONE[f.status]}>{COURSE_STATUS_LABEL[f.status]}</Badge>
              {f.status !== "PUBLISHED" && <span className="text-micro text-warning">게시 전이라 메인에 안 보임</span>}
              <Button size="sm" variant="ghost" aria-label={`${f.title} 큐레이션에서 빼기`} disabled={isPending} onClick={() => run(() => setFeatured(f.id, false))}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
