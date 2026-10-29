// 토스페이먼츠 결제 API (결제위젯 SDK v2 "결제창형" + 승인·취소 API v1)
// https://docs.tosspayments.com/sdk/v2/js/payment-window
// https://docs.tosspayments.com/guides/v2/cancel-payment
import { ServiceError } from "../errors";

/**
 * 토스페이먼츠 공식 문서·샘플(tosspayments/tosspayments-sample)에 공개된 "결제위젯 연동" 테스트 키.
 * 같은 샘플의 API 개별 연동 키(test_ck_D5Ge…/test_sk_zXLk…)는 2026-10 기준 UNAUTHORIZED_KEY 라 못 쓴다.
 * 테스트 키로는 실제 돈이 오가지 않는다. 운영(production)에서는 env 가 없으면 결제를 막는다.
 */
const DOCS_TEST_CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const DOCS_TEST_SECRET_KEY = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

const isProd = process.env.NODE_ENV === "production";

/** 브라우저 결제창에 넘길 클라이언트 키 (서버에서 런타임에 읽어 props 로 내려준다) */
export function tossClientKey(): string | null {
  return process.env.TOSS_CLIENT_KEY || process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || (isProd ? null : DOCS_TEST_CLIENT_KEY);
}

function tossSecretKey(): string | null {
  return process.env.TOSS_SECRET_KEY || (isProd ? null : DOCS_TEST_SECRET_KEY);
}

/** 테스트 키(test_)로 동작 중인지 — 화면에 "테스트 결제" 안내를 띄울 때 */
export function isTossTestMode(): boolean {
  return (tossClientKey() ?? "").startsWith("test_");
}

export class TossError extends ServiceError {
  constructor(
    public code: string,
    message: string,
    statusCode = 400,
  ) {
    super(message, statusCode);
    this.name = "TossError";
  }
}

/** Payment 객체 중 쓰는 필드만 */
export interface TossPayment {
  paymentKey: string;
  orderId: string;
  status: string; // DONE · CANCELED · PARTIAL_CANCELED ...
  method: string | null; // 카드 · 간편결제 · 계좌이체 ...
  totalAmount: number;
  balanceAmount: number;
  approvedAt: string | null;
  easyPay?: { provider: string | null } | null;
  card?: { issuerCode: string | null; number: string | null } | null;
  receipt?: { url: string | null } | null;
}

async function tossPost(path: string, body: Record<string, unknown>, idempotencyKey?: string): Promise<TossPayment> {
  const secret = tossSecretKey();
  if (!secret) throw new TossError("NOT_CONFIGURED", "결제 설정(TOSS_SECRET_KEY)이 되어 있지 않습니다", 503);
  // 시크릿 키 뒤에 콜론을 붙여 base64 (Basic 인증)
  const authorization = "Basic " + btoa(`${secret}:`);
  let res: Response;
  try {
    res = await fetch(`https://api.tosspayments.com${path}`, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
        // 같은 키로 다시 보내면 토스가 처음 응답을 그대로 돌려준다 (중복 승인·중복 취소 방지)
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
  } catch {
    throw new TossError("NETWORK_ERROR", "결제사와 통신하지 못했습니다. 잠시 후 다시 시도해 주세요", 502);
  }
  const data = (await res.json().catch(() => ({}))) as Partial<TossPayment> & { code?: string; message?: string };
  if (!res.ok) {
    throw new TossError(data.code ?? "UNKNOWN", data.message ?? "결제 처리에 실패했습니다", res.status >= 500 ? 502 : 400);
  }
  return data as TossPayment;
}

/** 결제 승인 — successUrl 로 받은 paymentKey·orderId·amount 그대로 */
export function confirmTossPayment(paymentKey: string, orderId: string, amount: number) {
  return tossPost("/v1/payments/confirm", { paymentKey, orderId, amount }, `confirm-${orderId}`);
}

/** 결제 취소(환불). cancelAmount 를 주면 부분 취소 */
export function cancelTossPayment(paymentKey: string, cancelReason: string, cancelAmount: number | undefined, idempotencyKey: string) {
  return tossPost(
    `/v1/payments/${encodeURIComponent(paymentKey)}/cancel`,
    { cancelReason, ...(cancelAmount !== undefined ? { cancelAmount } : {}) },
    idempotencyKey,
  );
}

/** 화면 표기용 결제수단 — "카드", "간편결제(토스페이)" */
export function describeTossMethod(p: TossPayment): string | null {
  if (!p.method) return null;
  return p.easyPay?.provider ? `${p.method}(${p.easyPay.provider})` : p.method;
}
