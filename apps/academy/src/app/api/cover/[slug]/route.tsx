import { ImageResponse } from "next/og";
import { prisma } from "@bayada/db";
import { CoverPattern, coverSpec } from "@bayada/ui/cover";
import { coverInput } from "@/lib/cover";
import { decodeParam } from "@/lib/params";

/**
 * 자동 표지 PNG (1200×630) — OG·공유 미리보기용. 화면의 표지(CourseCover)와 같은 색·무늬 규칙.
 * 공개(PUBLISHED + PUBLIC) 프로그램만 그린다: 사내 전용 제목이 바깥으로 새지 않게.
 */
export const runtime = "nodejs";

// satori 는 woff2 를 못 읽고 기본 글꼴엔 한글이 없다 → Pretendard Bold(otf)를 한 번 받아 프로세스에 캐시
let fontPromise: Promise<ArrayBuffer | null> | null = null;
function pretendard(): Promise<ArrayBuffer | null> {
  fontPromise ??= fetch("https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-Bold.otf", {
    signal: AbortSignal.timeout(8000),
  })
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .catch(() => null)
    .then((buf) => {
      if (!buf) fontPromise = null; // 실패하면 다음 요청에서 다시 시도
      return buf;
    });
  return fontPromise;
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeParam((await params).slug);
  const course = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED", visibility: "PUBLIC" },
    select: {
      slug: true,
      title: true,
      productType: true,
      level: true,
      audiences: true,
      category: { select: { name: true, slug: true } },
    },
  });
  if (!course) return new Response("Not found", { status: 404 });

  const s = coverSpec(coverInput(course));
  const p = s.palette;
  const font = await pretendard();
  const titleSize = s.length === "short" ? 92 : s.length === "medium" ? 74 : 58;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: p.bg,
          color: p.fg,
          padding: "64px 72px",
          fontFamily: font ? "Pretendard" : "sans-serif",
        }}
      >
        <CoverPattern kind={s.pattern} color={p.pattern} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, color: p.sub }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: p.accent }} />
          {s.eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 34,
            maxWidth: 900,
            fontSize: titleSize,
            lineHeight: 1.18,
            letterSpacing: "-0.02em",
            fontWeight: 700,
          }}
        >
          {s.title}
        </div>
        <div style={{ display: "flex", marginTop: "auto", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {s.chips.map((c) => (
              <div key={c} style={{ display: "flex", background: p.chipBg, borderRadius: 999, padding: "8px 22px", fontSize: 26 }}>
                {c}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: p.sub }}>BAYADA Academy</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: font ? [{ name: "Pretendard", data: font, weight: 700, style: "normal" }] : undefined,
      headers: { "cache-control": "public, max-age=3600, stale-while-revalidate=86400" },
    },
  );
}
