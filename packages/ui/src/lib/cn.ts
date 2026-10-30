import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** theme.css 의 타입 스케일 이름. tailwind-merge 가 이걸 글자색으로 오해해 `text-h2 text-ink` 중 하나를 지우지 않게 등록한다 */
export const TEXT_SCALE = ["display", "h1", "h2", "h3", "title", "body-lg", "body", "body-sm", "caption", "micro"] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...TEXT_SCALE] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
