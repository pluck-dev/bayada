import type { CSSProperties } from "react";
import type { CoverPatternKind } from "./spec";

/**
 * 표지 무늬 (오른쪽 아래를 채우는 큰 도형). 훅·이벤트 없이 SVG 만 — 카드(HTML)와 OG 이미지(satori)가 같이 쓴다.
 * viewBox 는 표지 비율(16:9)과 같은 160×90. 글자 영역(왼쪽 위)과 겹치지 않게 오른쪽에 둔다.
 */
export function CoverPattern({ kind, color, style }: { kind: CoverPatternKind; color: string; style?: CSSProperties }) {
  const common = {
    viewBox: "0 0 160 90",
    preserveAspectRatio: "xMaxYMax slice",
    style: { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%", ...style },
    "aria-hidden": true,
  };
  switch (kind) {
    case "rings":
      return (
        <svg {...common} fill="none" stroke={color} strokeWidth="7">
          <circle cx="150" cy="92" r="20" />
          <circle cx="150" cy="92" r="38" />
          <circle cx="150" cy="92" r="56" />
        </svg>
      );
    case "cross":
      // 의료·돌봄을 떠올리는 둥근 십자
      return (
        <svg {...common} fill={color}>
          <path d="M122 30h16a4 4 0 0 1 4 4v18h18a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4h-18v18a4 4 0 0 1-4 4h-16a4 4 0 0 1-4-4V76h-18a4 4 0 0 1-4-4V56a4 4 0 0 1 4-4h18V34a4 4 0 0 1 4-4z" />
        </svg>
      );
    case "dots":
      return (
        <svg {...common} fill={color}>
          {Array.from({ length: 5 }, (_, r) =>
            Array.from({ length: 6 }, (_, c) => (
              <circle key={`${r}-${c}`} cx={108 + c * 10} cy={48 + r * 10} r="2.6" />
            )),
          )}
        </svg>
      );
    case "arc":
      return (
        <svg {...common} fill={color}>
          <path d="M96 90a52 52 0 0 1 104 0z" />
          <path d="M124 90a24 24 0 0 1 48 0z" fill={color} opacity="0.9" />
        </svg>
      );
    case "stripes":
    default:
      return (
        <svg {...common} fill={color}>
          <path d="M112 90 150 22h12l-38 68z" />
          <path d="M132 90 170 22h12l-38 68z" />
          <path d="M92 90 130 22h12l-38 68z" />
        </svg>
      );
  }
}
