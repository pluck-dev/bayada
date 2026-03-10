"use client";

interface NeedsReviewProps {
  children: React.ReactNode;
  label?: string;
  note?: string;
  show?: boolean;
}

/**
 * 수정필요 오버레이 컴포넌트
 * - 빨간색 테두리 + 라벨로 클라이언트 확인이 필요한 섹션 표시
 * - show={false}로 비활성화 가능
 */
export function NeedsReview({
  children,
  label = "수정필요",
  note,
  show = true,
}: NeedsReviewProps) {
  if (!show) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      {/* 얇은 점선 테두리만 표시 — 콘텐츠 가리지 않음 */}
      <div className="pointer-events-none absolute inset-0 z-40 border border-dashed border-red-400/40 rounded-lg" />
      {/* 라벨 + 메모를 우상단 작은 태그로 표시 */}
      <div className="pointer-events-none absolute -top-2.5 right-2 z-50 flex items-center gap-1.5">
        <div className="bg-red-500/80 px-2 py-0.5 rounded-full shadow-sm">
          <span className="text-white text-[10px] font-semibold tracking-wide">
            {label}
          </span>
        </div>
        {note && (
          <div className="bg-red-500/60 px-2 py-0.5 rounded-full shadow-sm max-w-[200px]">
            <span className="text-white text-[10px] font-medium truncate block">
              {note}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
