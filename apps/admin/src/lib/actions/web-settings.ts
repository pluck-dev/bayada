"use server";

// 홈페이지 사이트 정보·문의 알림 (SiteSetting key = web.site / web.inquiry). 아카데미 설정(site-settings.ts)과 같은 저장 규칙:
// 섹션별 한 행, 화면을 연 시점 updatedAt 과 다르면 거부, '기본값으로' = 행 삭제.
import { revalidatePath } from "next/cache";
import { prisma } from "@bayada/db";
import { safeHref } from "@bayada/shared/site-settings";
import {
  WEB_SETTING_DEFAULTS,
  WEB_SNS_KEYS,
  WEB_SNS_LABEL,
  isEmail,
  isWebSettingKey,
  normalizeWebSetting,
  type WebSettingKey,
  type WebSettings,
} from "@bayada/shared/web-content";
import { ActionError, audit, runAction } from "../session";
import { revalidateWeb } from "../web-revalidate";

function assertKey(key: string): asserts key is WebSettingKey {
  if (!isWebSettingKey(key)) throw new ActionError("알 수 없는 설정입니다.");
}

/** 정규화가 조용히 지우는 잘못된 값을 저장 전에 알려 준다 */
function assertValues(key: WebSettingKey, raw: Record<string, unknown>) {
  if (key === "web.site") {
    const sns = (raw.sns ?? {}) as Record<string, unknown>;
    for (const k of WEB_SNS_KEYS) {
      const v = typeof sns[k] === "string" ? String(sns[k]).trim() : "";
      if (v && v !== "#" && !safeHref(v)) throw new ActionError(`${WEB_SNS_LABEL[k]} 링크는 https:// 로 시작해야 합니다.`);
    }
    for (const [f, label] of [
      ["email", "푸터 이메일"],
      ["contactEmail", "문의 페이지 이메일"],
    ] as const) {
      const v = typeof raw[f] === "string" ? String(raw[f]).trim() : "";
      if (v && !isEmail(v)) throw new ActionError(`${label} 형식이 올바르지 않습니다.`);
    }
  }
  if (key === "web.inquiry") {
    const bad = String(raw.notifyEmails ?? "")
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s && !isEmail(s));
    if (bad.length) throw new ActionError(`메일 주소 형식이 올바르지 않습니다: ${bad.join(", ")}`);
  }
}

async function finish(key: WebSettingKey, what: string) {
  revalidatePath("/[locale]/(dashboard)/web/settings", "page");
  // 알림 주소는 홈페이지 화면에 안 나오므로 재생성 불필요
  return { message: key === "web.site" ? `${what} ${await revalidateWeb()}` : what };
}

export async function saveWebSetting(key: string, value: unknown, baseUpdatedAt: string | null) {
  return runAction("web.settings", async (user) => {
    assertKey(key);
    const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
    assertValues(key, raw);
    const next = normalizeWebSetting(key, raw) as WebSettings[typeof key];
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    if ((row?.updatedAt.toISOString() ?? null) !== baseUpdatedAt) {
      throw new ActionError("다른 관리자가 먼저 이 설정을 저장했습니다. 새로고침 후 다시 저장하세요.");
    }
    const before = row ? normalizeWebSetting(key, row.value) : WEB_SETTING_DEFAULTS[key];
    if (JSON.stringify(before) === JSON.stringify(next)) return { message: "변경 사항이 없습니다." };
    await prisma.siteSetting.upsert({ where: { key }, create: { key, value: next as object }, update: { value: next as object } });
    await audit(user.id, "web.settings", `SiteSetting:${key}`, { before, after: next });
    return finish(key, "저장했습니다.");
  });
}

export async function resetWebSetting(key: string) {
  return runAction("web.settings", async (user) => {
    assertKey(key);
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    if (!row) return { message: "이미 기본값입니다." };
    await prisma.siteSetting.delete({ where: { key } });
    await audit(user.id, "web.settings", `SiteSetting:${key}`, {
      before: normalizeWebSetting(key, row.value),
      after: WEB_SETTING_DEFAULTS[key],
      reset: true,
    });
    return finish(key, "기본값으로 되돌렸습니다.");
  });
}
