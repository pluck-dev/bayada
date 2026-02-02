"use client";

import { useState } from "react";
import { Button, Input, Textarea } from "@bayada/ui";
import type { Dictionary } from "@bayada/shared/i18n";

interface ConsultationFormProps {
  dict: Dictionary;
  serviceOptions: string[];
}

export function ConsultationForm({ dict, serviceOptions }: ConsultationFormProps) {
  const t = dict.web.consultation;
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-[#dcfce7] p-8 text-center">
        <p className="text-lg font-semibold text-[#16a34a]">상담 신청이 완료되었습니다</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">{t.responseTime}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]">
            {t.name} *
          </label>
          <Input required placeholder={t.name} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]">
            {t.contact} *
          </label>
          <Input required placeholder={t.contact} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]">
          {t.subject}
        </label>
        <Input placeholder={t.subject} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]">
          {t.service} *
        </label>
        <select
          required
          className="flex h-10 w-full rounded-lg border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--fg)] outline-none focus:border-[#ce0e2d] focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="">{t.service}</option>
          {serviceOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]">
          {t.region}
        </label>
        <Input placeholder={t.region} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[color:var(--fg)]">
          {t.message}
        </label>
        <Textarea placeholder={t.message} rows={4} />
      </div>

      <Button type="submit" variant="brand" size="lg" className="w-full">
        {t.submit}
      </Button>
    </form>
  );
}
