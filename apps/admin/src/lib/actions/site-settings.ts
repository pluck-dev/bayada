"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@bayada/db";
import {
  SITE_SETTING_DEFAULTS,
  SITE_SETTING_KEYS,
  normalizeSetting,
  safeHref,
  type SiteSettingKey,
  type SiteSettings,
} from "@bayada/shared/site-settings";
import { ActionError, audit, runAction } from "../session";

// 아카데미 홈·헤더·푸터는 요청마다 DB 를 읽는 동적 렌더링이라 저장 즉시 반영된다(따로 revalidate 할 캐시가 없다).
// 어드민 쪽 설정 화면만 다시 그린다.
function done() {
  revalidatePath("/[locale]/(dashboard)/site-settings", "page");
}

function assertKey(key: string): asserts key is SiteSettingKey {
  if (!(SITE_SETTING_KEYS as string[]).includes(key)) throw new ActionError("알 수 없는 설정입니다.");
}

/** 정규화에서 조용히 지워지는 잘못된 링크를 저장 전에 알려 준다 */
function assertLinks(key: SiteSettingKey, raw: Record<string, unknown>) {
  const bad = (label: string, v: unknown) => {
    if (typeof v === "string" && v.trim() && !safeHref(v)) {
      throw new ActionError(`${label} 링크 형식이 올바르지 않습니다. /경로, #위치, https://, mailto:, tel: 만 쓸 수 있습니다.`);
    }
  };
  if (key === "home.hero") {
    bad("주 버튼", (raw.primaryCta as { href?: unknown } | undefined)?.href);
    bad("보조 버튼", (raw.secondaryCta as { href?: unknown } | undefined)?.href);
  }
  if (key === "footer" && Array.isArray(raw.sns)) {
    for (const s of raw.sns as { label?: unknown; url?: unknown }[]) bad(`SNS(${String(s.label ?? "")})`, s.url);
  }
  if (key === "inquiry") bad("문의", raw.url);
  if (key === "seo" && typeof raw.ogImageUrl === "string" && raw.ogImageUrl.trim() && !/^https?:\/\//i.test(raw.ogImageUrl.trim())) {
    throw new ActionError("OG 이미지 URL 은 https:// 로 시작하는 주소여야 합니다.");
  }
  if (key === "faq" && Array.isArray(raw.items)) {
    const items = raw.items as { q?: unknown; a?: unknown }[];
    const half = items.findIndex((it) => !String(it.q ?? "").trim() !== !String(it.a ?? "").trim());
    if (half >= 0) throw new ActionError(`FAQ ${half + 1}번 항목의 질문과 답변을 모두 입력하세요.`);
  }
  if (key === "inquiry" && !String(raw.email ?? "").trim() && !String(raw.url ?? "").trim()) {
    throw new ActionError("기관 도입 문의 메일 또는 링크 중 하나는 있어야 합니다.");
  }
}

async function current(key: SiteSettingKey) {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return { row, value: row ? normalizeSetting(key, row.value) : SITE_SETTING_DEFAULTS[key] };
}

/**
 * 섹션 하나 저장. baseUpdatedAt = 화면을 연 시점의 저장 시각(없었으면 null) — 그사이 다른 사람이 저장했으면 거부.
 */
export async function saveSiteSetting(key: string, value: unknown, baseUpdatedAt: string | null) {
  return runAction("site.manage", async (user) => {
    assertKey(key);
    const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
    assertLinks(key, raw);
    const next = normalizeSetting(key, raw) as SiteSettings[typeof key];
    const { row, value: before } = await current(key);
    if ((row?.updatedAt.toISOString() ?? null) !== baseUpdatedAt) {
      throw new ActionError("다른 관리자가 먼저 이 설정을 저장했습니다. 새로고침 후 다시 저장하세요.");
    }
    if (JSON.stringify(before) === JSON.stringify(next)) return { message: "변경 사항이 없습니다." };
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: next as object },
      update: { value: next as object },
    });
    await audit(user.id, "site.settings", `SiteSetting:${key}`, { before, after: next });
    done();
    return { message: "저장했습니다. 아카데미에 반영됐습니다." };
  });
}

/** 기본값으로 되돌리기 = 행 삭제 (아카데미는 기본 문구로) */
export async function resetSiteSetting(key: string) {
  return runAction("site.manage", async (user) => {
    assertKey(key);
    const { row, value: before } = await current(key);
    if (!row) return { message: "이미 기본값입니다." };
    await prisma.siteSetting.delete({ where: { key } });
    await audit(user.id, "site.settings", `SiteSetting:${key}`, { before, after: SITE_SETTING_DEFAULTS[key], reset: true });
    done();
    return { message: "기본값으로 되돌렸습니다. 아카데미에 반영됐습니다." };
  });
}
