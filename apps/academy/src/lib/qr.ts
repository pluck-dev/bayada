import QRCode from "qrcode";
import { SITE_URL } from "@/lib/site";

/** 수료증 공개 검증 절대 주소 (QR·인쇄물에 찍히므로 요청 호스트가 아니라 고정 사이트 주소 기준) */
export function certificateVerifyUrl(locale: string, number: string): string {
  return `${SITE_URL}/${locale}/verify/${encodeURIComponent(number)}`;
}

/** QR 코드 SVG 문자열 (서버에서 생성해 그대로 심는다) */
export function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#18181b", light: "#ffffff" },
  });
}
