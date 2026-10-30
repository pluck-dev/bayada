"use client";

import { buttonVariants } from "@bayada/ui";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={buttonVariants({ variant: "primary" })}
    >
      <Printer className="h-4 w-4" aria-hidden /> PDF로 저장 · 인쇄
    </button>
  );
}
