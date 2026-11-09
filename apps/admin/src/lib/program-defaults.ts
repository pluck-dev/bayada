import type { ProgramInput } from "./actions/programs";

// 새 프로그램 폼 기본값. ProgramForm("use client") 에 두면 서버 컴포넌트가 import 할 때
// 값이 아니라 클라이언트 참조로 넘어와 스프레드하면 빈 객체가 된다 — 그래서 일반 모듈에 둔다.
export type ProgramFormValue = ProgramInput;

export const EMPTY_PROGRAM: ProgramFormValue = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  thumbnail: "",
  // 새 프로그램도 기본은 자동 표지 — 이미지를 올리면 운영자가 "업로드 이미지"로 바꾼다
  coverMode: "AUTO",
  price: 0,
  productType: "COURSE",
  learningMode: "ONLINE",
  level: "",
  audiences: [],
  categoryId: "",
  providerId: "",
  durationMin: null,
  objectives: [""],
  featured: false,
  visibility: "INTERNAL",
};
