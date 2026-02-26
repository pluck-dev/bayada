"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@bayada/ui";

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionSectionProps {
  title?: string;
  subtitle?: string;
  items: AccordionItem[];
  layout?: "full" | "split";
  variant?: "default" | "bordered";
}

const ease = [0.16, 1, 0.3, 1] as const;

function AccordionItemBlock({
  item,
  isOpen,
  onToggle,
  variant,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
  variant: "default" | "bordered";
}) {
  return (
    <div
      className={cn(
        "overflow-hidden",
        variant === "bordered"
          ? "rounded-2xl ring-1 ring-black/5 shadow-sm"
          : "border-b border-black/10"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between gap-4 text-left transition-colors",
          variant === "bordered" ? "p-5" : "py-5",
          "hover:bg-black/[0.02]"
        )}
      >
        <span className="text-base font-semibold text-black/[0.87]">
          {item.title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease }}
        >
          <ChevronDown className="h-5 w-5 shrink-0 text-black/40" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <div
              className={cn(
                "pb-5 text-sm leading-relaxed text-black/60",
                variant === "bordered" ? "px-5" : ""
              )}
            >
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AccordionSection({
  title,
  subtitle,
  items,
  layout = "full",
  variant = "default",
}: AccordionSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const accordionList = (
    <div className={cn("space-y-3", variant === "default" && "space-y-0")}>
      {items.map((item, index) => (
        <AccordionItemBlock
          key={item.title}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
          variant={variant}
        />
      ))}
    </div>
  );

  if (layout === "split") {
    return (
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
            {/* 좌측: 타이틀 */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
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
                <p className="mt-3 text-base text-black/60">{subtitle}</p>
              )}
            </motion.div>

            {/* 우측: 아코디언 */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
            >
              {accordionList}
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
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
        <div className="mx-auto max-w-3xl">{accordionList}</div>
      </div>
    </section>
  );
}
