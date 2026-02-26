"use client";

import { motion } from "framer-motion";
import { cn } from "@bayada/ui";

interface VideoSectionProps {
  title?: string;
  description?: string;
  videoUrl: string;
  reversed?: boolean;
}

const ease = [0.16, 1, 0.3, 1] as const;

function getEmbedUrl(url: string): string {
  if (url.includes("youtube.com/watch")) {
    try {
      const videoId = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      return url;
    }
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("vimeo.com/")) {
    const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
}

export function VideoSection({
  title,
  description,
  videoUrl,
  reversed = false,
}: VideoSectionProps) {
  const embedUrl = getEmbedUrl(videoUrl);
  const hasText = title || description;

  const videoBlock = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: hasText ? 0.15 : 0, ease }}
    >
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 shadow-md">
        <iframe
          src={embedUrl}
          title={title ?? "비디오"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    </motion.div>
  );

  const textBlock = hasText ? (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease }}
      className="flex flex-col justify-center"
    >
      {title && (
        <h2
          className="font-bold text-black/[0.87]"
          style={{ fontSize: "clamp(1.75rem, 3vw, 2.625rem)" }}
        >
          {title}
        </h2>
      )}
      {description && (
        <p className="mt-4 text-base leading-relaxed text-black/60">
          {description}
        </p>
      )}
    </motion.div>
  ) : null;

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1512px] px-4 sm:px-6 lg:px-12">
        {hasText ? (
          <div
            className={cn(
              "grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16",
              reversed && "lg:[direction:rtl] lg:[&>*]:[direction:ltr]"
            )}
          >
            {textBlock}
            {videoBlock}
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">{videoBlock}</div>
        )}
      </div>
    </section>
  );
}
