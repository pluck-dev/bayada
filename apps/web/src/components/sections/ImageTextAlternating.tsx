"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@bayada/ui";

interface Block {
  title: string;
  description: string;
  imageUrl: string;
}

interface ImageTextAlternatingProps {
  title?: string;
  blocks: Block[];
}

const ease = [0.16, 1, 0.3, 1] as const;

export function ImageTextAlternating({
  title,
  blocks,
}: ImageTextAlternatingProps) {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mb-16 text-center font-bold text-black/[0.87]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
          >
            {title}
          </motion.h2>
        )}

        <div className="space-y-16 lg:space-y-24">
          {blocks.map((block, index) => {
            const reversed = index % 2 !== 0;
            return (
              <div
                key={block.title}
                className={cn(
                  "grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16",
                  reversed && "lg:[direction:rtl] lg:[&>*]:[direction:ltr]"
                )}
              >
                {/* 텍스트 */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, ease }}
                  className="flex flex-col justify-center"
                >
                  <h3
                    className="font-bold text-black/[0.87]"
                    style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
                  >
                    {block.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-black/60">
                    {block.description}
                  </p>
                </motion.div>

                {/* 이미지 */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: 0.15, ease }}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                >
                  <Image
                    src={block.imageUrl}
                    alt={block.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
