"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface TextAndVideoProps {
  title: string;
  content: ReactNode;
  videoUrl: string;
  reversed?: boolean;
  className?: string;
}

export function TextAndVideo({
  title,
  content,
  videoUrl,
  reversed = false,
  className = "",
}: TextAndVideoProps) {
  const isYouTube =
    videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  const getEmbedUrl = (url: string): string => {
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const embedUrl = isYouTube ? getEmbedUrl(videoUrl) : videoUrl;

  const textBlock = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col justify-center"
    >
      <h2 className="text-3xl font-bold leading-tight text-black/[0.87] sm:text-4xl">
        {title}
      </h2>
      <div className="mt-6 text-base leading-relaxed text-black/[0.7]">
        {content}
      </div>
    </motion.div>
  );

  const videoBlock = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100 shadow-md">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    </motion.div>
  );

  return (
    <section className={`bg-white py-16 lg:py-24 ${className}`}>
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-12">
        <div
          className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
            reversed ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          {reversed ? (
            <>
              {videoBlock}
              {textBlock}
            </>
          ) : (
            <>
              {textBlock}
              {videoBlock}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
