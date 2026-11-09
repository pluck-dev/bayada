"use client";
// 루트 레이아웃에 한 번 두는 리뷰 도구 진입점.
// 공개 방문자(힌트 쿠키 없음)는 아무것도 받지 않는다 — 도구 JS·CSS·글꼴은 잠금 해제가 서버에서 확인된 뒤에만 지연 로드된다.
// 루트 레이아웃에서 cookies() 를 읽으면 웹사이트 전체가 동적 렌더링으로 바뀌므로, 서명 쿠키 확인은 세션 API(서버)가 한다.
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { reviewHintCookieName, type ReviewSiteKey } from "@bayada/review/config";
import { REVIEW_API } from "./shared";

const ReviewTools = dynamic(() => import("./tools"), { ssr: false });

export function ReviewGate({ site }: { site: ReviewSiteKey }) {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    const hint = `${reviewHintCookieName(site)}=`;
    if (!document.cookie.split(/;\s*/).some(cookie => cookie.startsWith(hint))) return;
    const controller = new AbortController();
    fetch(REVIEW_API.session, { cache: "no-store", signal: controller.signal })
      .then(response => (response.ok ? response.json() : null))
      .then(result => setUnlocked(result?.unlocked === true))
      .catch(() => setUnlocked(false));
    return () => controller.abort();
  }, [site]);
  return unlocked ? <ReviewTools site={site} /> : null;
}
