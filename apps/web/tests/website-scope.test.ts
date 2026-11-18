import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { mainNavigation, footerNavigation } from "../src/data/navigation";
import { providerSegments, userSegments } from "../src/data/audiences";
import { isPublicWebFormType, webFormLabel } from "@bayada/shared/web-content";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const retired = ["auth", "my-page", "membership", "onboarding", "shop", "employees", "platform", "providers/qualification", "senior-living", "smart-care", "who-we-serve/providers/service-provision-centers/daycare", "who-we-serve/users/chronic-disease", "who-we-serve/users/disability"];

test("retired website routes and authentication API are removed while academy authentication remains", () => {
  for (const path of retired) assert.equal(existsSync(`${root}apps/web/src/app/[locale]/${path}`), false, path);
  assert.equal(existsSync(`${root}apps/web/src/app/api/auth`), false);
  assert.ok(existsSync(`${root}apps/academy/src/app/api/auth/[...nextauth]/route.ts`));
});

test("navigation, audience cards and sitemap contain no retired destinations", () => {
  const links = JSON.stringify([mainNavigation, footerNavigation, providerSegments, userSegments]);
  const sitemap = readFileSync(`${root}apps/web/src/app/sitemap.ts`, "utf8");
  for (const path of retired) {
    assert.ok(!links.includes(`"/${path}"`), path);
    assert.ok(!sitemap.includes(`path: "/${path}"`), path);
  }
});

test("retired public form types cannot be submitted but historical labels remain", () => {
  for (const type of ["vendor-qualification", "deicloud-early-access", "paid-onboarding", "free-onboarding"]) {
    assert.equal(isPublicWebFormType(type), false);
    assert.notEqual(webFormLabel(type), type);
  }
  for (const type of ["contact", "general", "provider-application", "other-provider-application", "government-consult"]) assert.equal(isPublicWebFormType(type), true);
  assert.equal(isPublicWebFormType("__proto__"), false);
});
