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
