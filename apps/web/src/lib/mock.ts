import type { FormSubmitResult } from "@/types";

// 폼 접수번호 생성
function generateReferenceNumber(prefix: string): string {
  const date = new Date();
  const dateStr = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `${prefix}-${dateStr}-${seq}`;
}

// Mock 폼 제출 시뮬레이션
export async function mockFormSubmit(
  formType: string,
  data: Record<string, unknown>,
): Promise<FormSubmitResult> {
  // 네트워크 지연 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const prefixMap: Record<string, string> = {
    "provider-application": "HP",
    "other-provider-application": "OP",
    "government-consult": "GV",
    contact: "CT",
    "paid-onboarding": "CS",
    "free-onboarding": "CS",
    "vendor-qualification": "VQ",
  };

  const prefix = prefixMap[formType] || "GN";
  const referenceNumber = generateReferenceNumber(prefix);

  // console에 제출 데이터 로깅
  console.log(`[Mock CRM] ${formType} 폼 제출:`, {
    referenceNumber,
    formType,
    data,
    timestamp: new Date().toISOString(),
  });

  return {
    success: true,
    referenceNumber,
    message: `접수가 완료되었습니다. 접수번호: ${referenceNumber}`,
  };
}
