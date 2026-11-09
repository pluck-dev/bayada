import { coverSpec, type CoverInput } from "./spec";
import { CoverPattern } from "./CoverArt";

const TITLE_SIZE = {
  card: { short: "8.6cqw", medium: "7.5cqw", long: "6.3cqw" },
  thumb: { short: "11cqw", medium: "9.4cqw", long: "8.2cqw" },
} as const;

/**
 * 자동 생성 표지 (HTML). 부모 상자를 꽉 채운다(부모가 비율을 정함 — 보통 aspect-video).
 * 글자 크기는 표지 폭 기준(cqw)이라 카드·상세·목록 썸네일 어디서나 같은 비례로 보인다.
 * size="thumb" 는 100–200px 폭 목록용: 위 줄·칩·워드마크를 빼고 제목만 크게.
 */
export function CourseCover({ course, size = "card" }: { course: CoverInput; size?: "card" | "thumb" }) {
  const s = coverSpec(course);
  const p = s.palette;
  const thumb = size === "thumb";
  return (
    // cqw 는 가장 가까운 "조상" 컨테이너 기준이라 바깥 상자에 container-type 을 둔다
    <div aria-hidden className="h-full w-full select-none [container-type:inline-size]">
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: p.bg, color: p.fg, padding: thumb ? "7cqw" : "5.6cqw 6cqw" }}
    >
      <CoverPattern kind={s.pattern} color={p.pattern} />
      {!thumb && (
        <p
          className="relative flex items-center gap-[1.6cqw] truncate font-semibold"
          style={{ color: p.sub, fontSize: "max(10px, 3.5cqw)", lineHeight: 1.3 }}
        >
          <span className="inline-block shrink-0 rounded-full" style={{ width: "1.9cqw", height: "1.9cqw", background: p.accent }} />
          <span className="truncate">{s.eyebrow}</span>
        </p>
      )}
      <p
        className="relative font-extrabold"
        style={{
          marginTop: thumb ? 0 : "3.2cqw",
          fontSize: TITLE_SIZE[size][s.length],
          lineHeight: 1.18,
          letterSpacing: "-0.02em",
          maxWidth: thumb ? "100%" : "86%",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: s.length === "long" ? 4 : 3,
          overflow: "hidden",
          wordBreak: "keep-all",
          overflowWrap: "anywhere",
        }}
      >
        {s.title}
      </p>
      {!thumb && (
        <div className="relative mt-auto flex items-end justify-between gap-[2cqw]">
          <div className="flex min-w-0 flex-wrap gap-[1.4cqw]">
            {s.chips.map((c) => (
              <span
                key={c}
                className="truncate rounded-full font-semibold"
                style={{ background: p.chipBg, color: p.fg, fontSize: "max(10px, 3.1cqw)", padding: "0.9cqw 2.6cqw", lineHeight: 1.3 }}
              >
                {c}
              </span>
            ))}
          </div>
          <span className="shrink-0 font-extrabold tracking-tight" style={{ fontSize: "max(9px, 2.9cqw)", color: p.sub }}>
            BAYADA <span className="font-semibold">Academy</span>
          </span>
        </div>
      )}
    </div>
    </div>
  );
}
