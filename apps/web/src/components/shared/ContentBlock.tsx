import { ReactNode } from "react";

interface ContentBlockProps {
  title?: string;
  content: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export function ContentBlock({
  title,
  content,
  align = "left",
  className = "",
}: ContentBlockProps) {
  const alignClass =
    align === "center"
      ? "text-center mx-auto"
      : align === "right"
        ? "text-right ml-auto"
        : "text-left";

  return (
    <div className={`mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-12 ${className}`}>
      <div className={`max-w-3xl ${alignClass}`}>
        {title && (
          <h2 className="text-3xl font-bold leading-tight text-black/[0.87] sm:text-4xl">
            {title}
          </h2>
        )}
        <div
          className={`${title ? "mt-6" : ""} text-base leading-relaxed text-black/[0.7]`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
