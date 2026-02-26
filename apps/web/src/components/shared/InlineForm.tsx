"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";

type FieldType = "text" | "email" | "tel" | "select" | "textarea";

interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}

interface InlineFormProps {
  title: string;
  description?: string;
  fields?: FormField[];
  submitLabel?: string;
  className?: string;
}

const defaultFields: FormField[] = [
  { name: "name", label: "이름", type: "text", placeholder: "홍길동", required: true },
  { name: "email", label: "이메일", type: "email", placeholder: "example@email.com", required: true },
  { name: "phone", label: "전화번호", type: "tel", placeholder: "010-0000-0000", required: true },
  {
    name: "serviceType",
    label: "서비스 유형",
    type: "select",
    required: true,
    options: [
      { label: "선택해 주세요", value: "" },
      { label: "방문요양", value: "home-care" },
      { label: "방문간호", value: "visiting-nursing" },
      { label: "재활치료", value: "rehabilitation" },
      { label: "치매케어", value: "dementia-care" },
      { label: "기타", value: "other" },
    ],
  },
  {
    name: "message",
    label: "문의 내용",
    type: "textarea",
    placeholder: "궁금하신 점을 자유롭게 작성해 주세요.",
    required: false,
  },
];

export function InlineForm({
  title,
  description,
  fields = defaultFields,
  submitLabel = "상담 신청하기",
  className = "",
}: InlineFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("InlineForm 제출:", formData);
    setSubmitted(true);
  };

  const inputBase =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black/[0.87] placeholder:text-black/40 transition-colors focus:border-[#ce0e2d] focus:outline-none focus:ring-2 focus:ring-[rgb(250,230,234)]";

  return (
    <section className={`bg-[#f5f5f5] py-16 lg:py-24 ${className}`}>
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl font-bold text-black/[0.87] sm:text-4xl">{title}</h2>
            {description && (
              <p className="mt-3 text-base leading-relaxed text-black/60">{description}</p>
            )}

            {submitted ? (
              <div className="mt-10 rounded-xl border border-green-200 bg-green-50 px-8 py-10 text-center">
                <p className="text-lg font-semibold text-green-700">
                  상담 신청이 접수되었습니다.
                </p>
                <p className="mt-2 text-sm text-green-600">
                  담당자가 빠른 시간 내에 연락드리겠습니다.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {fields.map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="mb-1.5 block text-sm font-medium text-black/[0.87]"
                    >
                      {field.label}
                      {field.required && (
                        <span className="ml-1 text-[#ce0e2d]">*</span>
                      )}
                    </label>

                    {field.type === "textarea" ? (
                      <textarea
                        id={field.name}
                        name={field.name}
                        rows={4}
                        placeholder={field.placeholder}
                        required={field.required}
                        onChange={handleChange}
                        className={`${inputBase} resize-none`}
                      />
                    ) : field.type === "select" ? (
                      <select
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        onChange={handleChange}
                        defaultValue=""
                        className={inputBase}
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        onChange={handleChange}
                        className={inputBase}
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  className="mt-2 w-full rounded-lg bg-[#ce0e2d] py-[0.813rem] px-6 text-base font-medium text-white transition-colors duration-300 hover:bg-[#980019] focus:outline focus:outline-4 focus:outline-[rgb(250,230,234)]"
                >
                  {submitLabel}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
