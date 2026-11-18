"use client";
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { AudienceSegment } from "@bayada/shared/web-page-content";
const AudienceContext = createContext<AudienceSegment | null>(null);
export function AudienceContent({ segment, children }: { segment: AudienceSegment; children: ReactNode }) {
 return <AudienceContext.Provider value={segment}>{children}</AudienceContext.Provider>;
}
export function useAudienceSegment(slug: string) {
 const segment = useContext(AudienceContext);
 if (!segment || segment.slug !== slug) throw new Error("대상별 안내 데이터 연결을 확인하세요.");
 return segment;
}
