"use client";

import { motion } from "framer-motion";
import { cn } from "@bayada/ui";

interface Step {
  title: string;
  description: string;
}

interface ProcessTimelineProps {
  title?: string;
  subtitle?: string;
  steps: Step[];
  variant?: "vertical" | "horizontal" | "alternating";
}

const ease = [0.16, 1, 0.3, 1] as const;

function StepCircle({ number }: { number: number }) {
  return (
    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ce0e2d] text-sm font-bold text-white">
      {number}
    </div>
  );
}

function VerticalTimeline({ steps }: { steps: Step[] }) {
  return (
    <div className="relative">
      {/* 세로 라인 */}
      <div className="absolute left-5 top-0 h-full w-px -translate-x-1/2 bg-black/10" />

      <div className="space-y-10">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: index * 0.12, ease }}
            className="flex gap-5"
          >
            <StepCircle number={index + 1} />
            <div className="pt-1.5">
              <h3 className="text-lg font-bold text-black/[0.87]">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-black/60">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function HorizontalTimeline({ steps }: { steps: Step[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: index * 0.1, ease }}
          className="relative text-center"
        >
          {/* 가로 화살표 (마지막 제외) */}
          {index < steps.length - 1 && (
            <div className="absolute right-0 top-5 hidden h-px w-full -translate-y-1/2 translate-x-1/2 bg-black/10 lg:block" />
          )}
          <div className="mx-auto mb-4 flex justify-center">
            <StepCircle number={index + 1} />
          </div>
          <h3 className="text-lg font-bold text-black/[0.87]">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-black/60">
            {step.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function AlternatingTimeline({ steps }: { steps: Step[] }) {
  return (
    <div className="relative">
      {/* 중앙 세로 라인 (lg 이상만) */}
      <div className="absolute left-5 top-0 h-full w-px -translate-x-1/2 bg-black/10 lg:left-1/2" />

      <div className="space-y-10 lg:space-y-16">
        {steps.map((step, index) => {
          const isEven = index % 2 === 0;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease }}
              className={cn(
                "flex gap-5",
                "lg:items-center lg:gap-0",
                isEven ? "lg:flex-row" : "lg:flex-row-reverse"
              )}
            >
              {/* 모바일: 왼쪽 서클 */}
              <div className="lg:hidden">
                <StepCircle number={index + 1} />
              </div>

              {/* 텍스트 영역 */}
              <div
                className={cn(
                  "flex-1 pt-1.5 lg:pt-0",
                  isEven ? "lg:pr-16 lg:text-right" : "lg:pl-16 lg:text-left"
                )}
              >
                <h3 className="text-lg font-bold text-black/[0.87]">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-black/60">
                  {step.description}
                </p>
              </div>

              {/* 데스크탑: 중앙 서클 */}
              <div className="hidden lg:flex lg:justify-center">
                <StepCircle number={index + 1} />
              </div>

              {/* 빈 공간 (반대편) */}
              <div className="hidden flex-1 lg:block" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function ProcessTimeline({
  title,
  subtitle,
  steps,
  variant = "vertical",
}: ProcessTimelineProps) {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        {/* 섹션 헤더 */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-12 text-center"
          >
            {title && (
              <h2
                className="font-bold text-black/[0.87]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mx-auto mt-3 max-w-2xl text-base text-black/60">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {variant === "vertical" && <VerticalTimeline steps={steps} />}
        {variant === "horizontal" && <HorizontalTimeline steps={steps} />}
        {variant === "alternating" && <AlternatingTimeline steps={steps} />}
      </div>
    </section>
  );
}
