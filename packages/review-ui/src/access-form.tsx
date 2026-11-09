"use client";
// /review-access 화면 — 리뷰 모드 비밀번호 입력 / 종료. 사이트 화면은 그대로 두고 리뷰 도구만 연다.
import { useState, type FormEvent } from "react";
import { reviewSites, type ReviewSiteKey } from "@bayada/review/config";
import { REVIEW_API, readResult } from "./shared";
import "./access.css";

export function ReviewAccessForm({ site, next, enabled, unlocked }: { site: ReviewSiteKey; next: string; enabled: boolean; unlocked: boolean }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const brand = reviewSites[site].brand;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !password) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(REVIEW_API.session, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password, next }) });
      const result = await readResult(response, "잠금 해제에 실패했습니다.");
      location.assign(typeof result.redirectTo === "string" ? result.redirectTo : "/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "연결을 확인하고 다시 시도해 주세요.");
      setBusy(false);
    }
  }

  async function exit() {
    setBusy(true);
    await fetch(REVIEW_API.session, { method: "DELETE" }).catch(() => null);
    location.assign("/");
  }

  return <main className="review-access-page">
    <section className="review-access-card" aria-labelledby="review-access-title">
      <p className="review-access-eyebrow">{brand}</p>
      <h1 id="review-access-title">리뷰 모드</h1>
      {!enabled ? <p>리뷰 모드가 설정되지 않았습니다. 운영 담당자에게 문의해 주세요.</p>
        : unlocked ? <>
          <p>이 브라우저에서 리뷰 모드가 켜져 있습니다. 화면 오른쪽 아래 &lsquo;리뷰 · 피드백&rsquo; 버튼으로 요소를 선택해 의견을 남길 수 있습니다.</p>
          <div className="review-access-actions">
            <a href={next} className="review-access-primary">사이트로 돌아가기</a>
            <button type="button" onClick={exit} disabled={busy}>{busy ? "종료 중…" : "리뷰 모드 종료"}</button>
          </div>
        </> : <>
          <p>검수용 비밀번호를 입력하면 이 브라우저에서 피드백 도구가 열립니다. 일반 방문자 화면은 바뀌지 않습니다.</p>
          <form className="review-access-form" onSubmit={submit}>
            <label htmlFor="review-access-password">비밀번호</label>
            <input id="review-access-password" type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={event => setPassword(event.target.value)} disabled={busy} aria-invalid={Boolean(error)} aria-describedby={error ? "review-access-error" : undefined} />
            {error && <p id="review-access-error" role="alert" className="review-access-error">{error}</p>}
            <button type="submit" disabled={busy || !password}>{busy ? "확인 중…" : "리뷰 모드 열기"}</button>
          </form>
        </>}
    </section>
  </main>;
}
