import { statSync } from "node:fs";
import { resolve, sep } from "node:path";
/** Missing supplied files stay visible as pending, without a fake download link. */
export function resourceLinkAvailable(href: string, publicRoot = resolve(process.cwd(), "public")) {
 if (href.startsWith("https://")) return true;
 if (!href.startsWith("/") || href.startsWith("//")) return false;
 try {
  const root = resolve(publicRoot);
  const file = resolve(root, "." + decodeURIComponent(href.split(/[?#]/)[0]!));
  return file.startsWith(root + sep) && statSync(file).isFile();
 } catch { return false; }
}
