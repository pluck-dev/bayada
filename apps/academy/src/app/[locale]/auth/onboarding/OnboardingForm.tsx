"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function OnboardingForm({
  name,
  next,
  options,
}: {
  name: string | null;
  next: string;
  options: { value: string; label: string }[];
}) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return setError("직군을 선택해 주세요.");
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobRole: selected }),
    }).catch(() => null);
    if (!res?.ok) {
      const data = res ? await res.json().catch(() => ({})) : {};
      setError(data.error || "저장하지 못했어요. 다시 시도해 주세요.");
      setLoading(false);
      return;
    }
    window.location.href = next;
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <form onSubmit={submit} className="w-full max-w-[440px]">
        <h1 className="text-[28px] font-bold tracking-tight text-ink">{name ? `${name}님, 환영해요` : "환영해요"}</h1>
        <p className="mt-2 text-[15px] text-muted">하시는 일을 알려 주시면 맞는 교육을 먼저 보여 드릴게요.</p>
        {error && (
          <p role="alert" className="mt-6 rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand">
            {error}
          </p>
        )}
        <fieldset className="mt-6 grid grid-cols-2 gap-2.5">
          <legend className="sr-only">직군</legend>
          {options.map((o) => (
            <label
              key={o.value}
              className={`flex h-14 cursor-pointer items-center justify-center rounded-xl border px-3 text-center text-[14px] font-semibold transition-colors ${
                selected === o.value ? "border-brand bg-brand-soft text-brand" : "border-line text-ink hover:bg-surface"
              }`}
            >
              <input
                type="radio"
                name="jobRole"
                value={o.value}
                checked={selected === o.value}
                onChange={() => setSelected(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          ))}
        </fieldset>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-70"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          시작하기
        </button>
      </form>
    </div>
  );
}
