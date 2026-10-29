"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@bayada/db";
import { ActionError, audit, runAction } from "../session";

const SLUG_RE = /^[\p{L}\p{N}][\p{L}\p{N}-]*$/u;

function slugOf(v: string): string {
  const s = v.trim().toLowerCase();
  if (!s) throw new ActionError("slug 를 입력하세요.");
  if (!SLUG_RE.test(s)) throw new ActionError("slug 는 글자·숫자·하이픈(-)만 쓸 수 있습니다.");
  return s;
}

function done() {
  revalidatePath("/[locale]/(dashboard)/taxonomy", "page");
}

// ─── 카테고리 ───
export interface CategoryInput {
  name: string;
  slug: string;
  order: number;
}

function cleanCategory(input: CategoryInput) {
  const name = input.name.trim();
  if (!name) throw new ActionError("카테고리 이름을 입력하세요.");
  return { name, slug: slugOf(input.slug), order: Math.round(Number(input.order) || 0) };
}

export async function createCategory(input: CategoryInput) {
  return runAction("taxonomy", async (user) => {
    const c = await prisma.category.create({ data: cleanCategory(input) });
    await audit(user.id, "category.create", `Category:${c.id}`, { name: c.name });
    done();
    return { message: "카테고리를 추가했습니다." };
  });
}

export async function updateCategory(id: string, input: CategoryInput) {
  return runAction("taxonomy", async (user) => {
    const c = await prisma.category.update({ where: { id }, data: cleanCategory(input) });
    await audit(user.id, "category.update", `Category:${id}`, { name: c.name });
    done();
    return { message: "카테고리를 저장했습니다." };
  });
}

export async function deleteCategory(id: string) {
  return runAction("taxonomy", async (user) => {
    const n = await prisma.course.count({ where: { categoryId: id } });
    if (n) throw new ActionError(`프로그램 ${n}개가 쓰고 있는 카테고리는 삭제할 수 없습니다.`);
    const c = await prisma.category.delete({ where: { id } });
    await audit(user.id, "category.delete", `Category:${id}`, { name: c.name });
    done();
    return { message: "카테고리를 삭제했습니다." };
  });
}

// ─── 제공기관 ───
export interface ProviderInput {
  name: string;
  slug: string;
  logo: string;
  isPartner: boolean;
}

function cleanProvider(input: ProviderInput) {
  const name = input.name.trim();
  if (!name) throw new ActionError("제공기관 이름을 입력하세요.");
  const logo = input.logo.trim();
  if (logo && !/^(https?:\/\/|\/)/.test(logo)) throw new ActionError("로고 URL 은 http(s) 또는 / 로 시작해야 합니다.");
  return { name, slug: slugOf(input.slug), logo: logo || null, isPartner: !!input.isPartner };
}

export async function createProvider(input: ProviderInput) {
  return runAction("taxonomy", async (user) => {
    const p = await prisma.provider.create({ data: cleanProvider(input) });
    await audit(user.id, "provider.create", `Provider:${p.id}`, { name: p.name });
    done();
    return { message: "제공기관을 추가했습니다." };
  });
}

export async function updateProvider(id: string, input: ProviderInput) {
  return runAction("taxonomy", async (user) => {
    const p = await prisma.provider.update({ where: { id }, data: cleanProvider(input) });
    await audit(user.id, "provider.update", `Provider:${id}`, { name: p.name });
    done();
    return { message: "제공기관을 저장했습니다." };
  });
}

export async function deleteProvider(id: string) {
  return runAction("taxonomy", async (user) => {
    const n = await prisma.course.count({ where: { providerId: id } });
    if (n) throw new ActionError(`프로그램 ${n}개의 제공기관이라 삭제할 수 없습니다.`);
    const p = await prisma.provider.delete({ where: { id } });
    await audit(user.id, "provider.delete", `Provider:${id}`, { name: p.name });
    done();
    return { message: "제공기관을 삭제했습니다." };
  });
}
