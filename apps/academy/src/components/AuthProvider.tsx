"use client";

import { SessionProvider } from "next-auth/react";
import { FeedbackProvider } from "@bayada/ui";

/** 세션 + 토스트·확인 대화상자(useFeedback) — 브라우저 confirm/alert 대신 디자인된 대화상자를 쓴다 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FeedbackProvider>{children}</FeedbackProvider>
    </SessionProvider>
  );
}
