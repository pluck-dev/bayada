"use client";

import { buttonVariants } from "@bayada/ui";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function ResendVerifyButton({ locale }: { locale: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const resend = async () => {
    setState("sending");
    setError("");
    const res = await fetch("/api/auth/verify-email/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    }).catch(() => null);
    if (res?.ok) return setState("sent");
    const data = res ? await res.json().catch(() => ({})) : {};
    setError(data.error || "메일을 보내지 못했어요.");
    setState("idle");
  };

  return (
    <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
      <button
        type="button"
        onClick={resend}
        disabled={state !== "idle"}
        className={buttonVariants({ variant: "secondary", size: "sm" })}
      >
        {state === "sending" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
        {state === "sent" ? "보냈어요 · 메일함 확인" : "인증 메일 다시 보내기"}
      </button>
      {error && <p role="alert" className="text-caption text-danger">{error}</p>}
    </div>
  );
}
