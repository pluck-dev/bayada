import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/site-settings";

export const alt = "BAYADA Academy - 헬스케어 교육 플랫폼";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// 어드민 사이트 설정의 OG 이미지 URL 을 요청 때마다 반영 (빌드 시점 값으로 굳지 않게)
export const dynamic = "force-dynamic";

/** 어드민에서 OG 이미지 URL 을 지정했으면 그 이미지를 그대로 내려준다. 못 가져오면 기본 생성 이미지 */
async function configuredImage(): Promise<Response | null> {
  const url = (await getSiteSettings()).seo.ogImageUrl;
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    return new Response(await res.arrayBuffer(), {
      headers: { "content-type": type, "cache-control": "public, max-age=600" },
    });
  } catch {
    return null;
  }
}

export default async function Image() {
  const custom = await configuredImage();
  if (custom) return custom;
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f7",
          fontFamily: "sans-serif",
        }}
      >
        {/* 배경 장식 */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "-200px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #e31b34 0%, #ffb6c1 100%)",
            opacity: 0.08,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
            opacity: 0.06,
          }}
        />

        {/* 메인 콘텐츠 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* 로고 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                backgroundColor: "#e31b34",
                borderRadius: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "36px",
                fontWeight: "bold",
              }}
            >
              B
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "52px",
                  fontWeight: "bold",
                  color: "#1d1d1f",
                  lineHeight: 1.1,
                }}
              >
                BAYADA Academy
              </span>
            </div>
          </div>

          {/* 서브타이틀 */}
          <span
            style={{
              fontSize: "28px",
              color: "#86868b",
              fontWeight: 500,
            }}
          >
            헬스케어 전문 교육 플랫폼
          </span>

          {/* 태그들 */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {["온라인 강의", "자격증 과정", "실무 교육"].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  fontSize: "18px",
                  color: "#6e6e73",
                  fontWeight: 500,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
