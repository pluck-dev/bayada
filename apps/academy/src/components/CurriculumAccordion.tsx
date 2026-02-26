"use client";

import { useState } from "react";
import { ChevronDown, FileText, PlayCircle } from "lucide-react";
import { formatDuration } from "@bayada/shared";

interface Lecture {
  id: string;
  title: string;
  type: string;
  duration: number | null;
  isFree: boolean;
}

interface Section {
  id: string;
  title: string;
  lectures: Lecture[];
}

export function CurriculumAccordion({ sections }: { sections: Section[] }) {
  // 기본으로 첫번째 섹션만 펼침
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.length > 0 ? [sections[0].id] : [])
  );

  function toggle(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {sections.map((section, idx) => {
        const isOpen = openSections.has(section.id);
        return (
          <div
            key={section.id}
            className="rounded-2xl border border-gray-100 overflow-hidden transition-all"
          >
            {/* 섹션 헤더 */}
            <button
              onClick={() => toggle(section.id)}
              className="w-full bg-gray-50/50 px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <h3 className="font-semibold text-gray-900 flex items-center gap-3">
                <span className="text-gray-400 font-normal text-sm">
                  Section {idx + 1}
                </span>
                {section.title}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {section.lectures.length}개 강의
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {/* 강의 목록 — 애니메이션 토글 */}
            <div
              className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                maxHeight: isOpen ? `${section.lectures.length * 52 + 8}px` : "0px",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="divide-y divide-gray-50">
                {section.lectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {lecture.type === "VIDEO" ? (
                        <PlayCircle className="h-4 w-4 text-gray-400 group-hover:text-[var(--brand-primary)] transition-colors" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        {lecture.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {lecture.isFree && (
                        <span className="text-xs font-semibold text-[var(--brand-secondary)] bg-red-50 px-2 py-0.5 rounded-full">
                          미리보기
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatDuration(lecture.duration ?? 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
