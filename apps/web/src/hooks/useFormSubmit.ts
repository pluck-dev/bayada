"use client";

import { useState, useCallback } from "react";
import { submitInquiry } from "@/lib/inquiry";
import type { FormSubmitResult } from "@/types";

interface UseFormSubmitOptions {
  formType: string;
  onSuccess?: (result: FormSubmitResult) => void;
  onError?: (error: Error) => void;
}

interface UseFormSubmitReturn {
  submit: (data: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  result: FormSubmitResult | null;
  error: string | null;
  reset: () => void;
}

export function useFormSubmit({
  formType,
  onSuccess,
  onError,
}: UseFormSubmitOptions): UseFormSubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<FormSubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (data: Record<string, unknown>) => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      setError(null);
      setResult(null);

      try {
        // 폼 원본 값은 data 로, 개인정보 동의는 data.privacyConsent(boolean)로 받는다
        const { privacyConsent, website, ...rest } = data;
        const res = await submitInquiry({
          formType,
          data: rest,
          privacyConsent: privacyConsent === true,
          website: typeof website === "string" ? website : undefined,
          sourcePage: window.location.pathname,
        });
        if (!res.success) throw new Error(res.message);
        setResult(res);
        onSuccess?.(res);
      } catch (err) {
        const message = err instanceof Error ? err.message : "오류가 발생했습니다";
        setError(message);
        onError?.(err instanceof Error ? err : new Error(message));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formType, isSubmitting, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsSubmitting(false);
  }, []);

  return { submit, isSubmitting, result, error, reset };
}
