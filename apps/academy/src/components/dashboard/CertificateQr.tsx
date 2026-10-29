import { qrSvg } from "@/lib/qr";

/** 수료증 검증 QR (서버 컴포넌트) */
export async function CertificateQr({ url, className = "" }: { url: string; className?: string }) {
  const svg = await qrSvg(url);
  return (
    <span
      role="img"
      aria-label={`수료증 검증 QR 코드: ${url}`}
      className={`block [&>svg]:h-full [&>svg]:w-full ${className}`}
      // qrcode 라이브러리가 만든 SVG (사용자 입력 아님)
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
